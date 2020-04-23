var express = require('express');
var route = express.Router();
var state = require('../db/productState.js');
var time_ = require('../db/getPresentTime.js');
module.exports=function(app, conn){
  route.get('/', function(req, res){
    console.log("get_manufacturer~~");
    var sql = 'SELECT * FROM manufacturer';
    conn.query(sql, function(err, results_manufacturer){
      if(err)                                 {console.log(err);return res.sendfile('views/error.html');}
      else if(results_manufacturer.length==0) {results_manufacturer='';}
      else {
        sql = 'SELECT DISTINCT factoryName,reciveDate,reciveState FROM center';
        conn.query(sql, function(err, results_center){
          if(err)                          {console.log(err);return res.sendfile('views/error.html');}
          else if(results_center.length==0){return res.render('manufacturer_20', {manufacturer:results_manufacturer, center:'',path:'manufacturer'});}
          else                             {return res.render('manufacturer_20', {manufacturer:results_manufacturer, center:results_center,path:'manufacturer'});}
        });
      }
    });
  });

  route.get('/detail', function(req, res){
    console.log("get_manufacturer_detail");
    var sql = 'SELECT * FROM productlist WHERE manufacturerName="'+req.query.name+'"';
    conn.query(sql, function(err, results){
      if(err)                    {console.log(err);return res.sendfile('views/error.html');}
      else if(results.length==0) {return res.render('manufacturer_detail_21', {product:'', manufacturer:req.query.name,path:'manufacturer'});}
      else                       {return res.render('manufacturer_detail_21', {product:results, manufacturer:req.query.name,path:'manufacturer'});}
    });
  });

  route.post('/detailsProduct', function(req, res){
    console.log("post_detailsProduct__");
    var sql = 'SELECT productCode,productAmount,factoryName FROM center WHERE factoryName="'+req.body.factoryName+'" and reciveDate="'+req.body.reciveDate+'"';
    conn.query(sql, function(err, results){
      if(err)                   { console.log(err);return res.sendfile('views/error.html');}
      else if(results.length==0){return res.send('');}
      else                      {return res.send(results);}
    });
  });

  route.get('/succese', function(req, res){
    console.log("get_manufacturer_succese");
    var sql = 'UPDATE center SET reciveState = "수령" WHERE reciveDate="'+req.query.date+'" and factoryName="'+req.query.factory+'"';
    conn.query(sql, function(err, results){
      if(err) { console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/manufacturer');}
    });
  });

  route.get('/return', function(req, res){
    console.log("get_manufacturer_return");
    var sql = 'SELECT productCode,productAmount FROM center WHERE reciveDate="'+req.query.date+'" and factoryName="'+req.query.factory+'"';
    conn.query(sql, function(err, results){
      if(err)                    {console.log(err);return res.sendfile('views/error.html');}
      else if(results.length==0) {return res.render('manufacturer_return_23', {results:'',reciveDate:req.query.date,factoryName:req.query.factory,path:'manufacturer'});}
      else                       {return res.render('manufacturer_return_23', {results:results,reciveDate:req.query.date,factoryName:req.query.factory,path:'manufacturer'});}
    });
  });

  route.post('/return', function(req, res){
    console.log("get_manufacturer_return");
    var time = time_.getCurentTime();
    var index = req.body.index

    //반품힐 제품이 포함된 칼럼 delete
    var sql = 'DELETE FROM center WHERE reciveDate ="'+req.body.reciveDate+'" and factoryName="'+req.body.factoryName+'"';
    var sql_insert2center=''  //반품한 제품을 제외한 나머지 제품을 center 테이블에 insert
    var sql_insert2return=''  //반품한 제품 테이블에 insert
    for ( var i=0;  i<index; i++ ) {
      if( (req.body['max'+i]-req.body[i])>0){
        sql_insert2center += 'INSERT INTO center(productCode,productAmount,factoryName,reciveDate,reciveState) VALUE ("'+req.body['productCode'+i]+'",'+(req.body['max'+i]-req.body[i])+',"'+req.body.factoryName+'","'+req.body.reciveDate+'","'+state.NOTDONE+'");';
      }
    }
    for ( var i=0;  i<index; i++ ) {
      if(req.body[i]>0){
        sql_insert2return += 'INSERT INTO returnproduct(productCode,productAmount,localPosition,returnDate,returnState) VALUE ("'+req.body['productCode'+i]+'","'+req.body[i]+'","'+req.user.id+'","'+time+'","'+state.NOTDONE+'");';
      }
    }

    conn.query(sql, function(err, results){
      if(err){console.log(err);return res.sendfile('views/error.html');}
      else{
        if(sql_insert2center != ''){
          conn.query(sql_insert2center, function(err, results){
            if(err){console.log(err);return res.sendfile('views/error.html');}
          });
        }
        if(sql_insert2return != ''){
          conn.query(sql_insert2return, function(err, results){
            if(err){console.log(err);return res.sendfile('views/error.html');}
          });
        }
        req.session.save(function(){
          return res.redirect('/manufacturer');
        });
      }
    });//first query
  });

  route.post('/addProduct', function(req, res){
    var product = {
      productCode:req.body.productCode,
      productName:req.body.productName,
      productVersion:req.body.productVersion,
      categoryCode:req.body.categoryCode,
      costPrice:req.body.costPrice,
      manufacturerName:req.body.manufacturer
    };
    console.log("post_manufacturer_addProduct");
    var sql = 'INSERT INTO productlist SET ?';
    conn.query(sql, product, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/manufacturer/detail?name='+product.manufacturerName);}
    });
  });

  route.post('/addManufacturer', function(req, res){
    var manufacturer = {
      manufacturerName:req.body.manufacturer,
      location:req.body.local
    };
    console.log("addManufacturer");
    var sql = 'INSERT INTO manufacturer SET ?';
    conn.query(sql, manufacturer, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/manufacturer');}
    });
  });

  route.get('/deleteProduct', function(req, res){
    console.log("post_manufacturer_deleteProduct :"+req.query.productCode+req.query.manufacturerName);
    var sql =  'DELETE FROM productlist WHERE productCode ="'+req.query.productCode+'"';
    conn.query(sql, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/manufacturer/detail?name='+req.query.manufacturer);}
    });
  });

  route.get('/deteteManufacturer', function(req, res){
    console.log("post_manufacturer_deleteManufacturer :"+req.query.manufacturerName);
    var sql =  'DELETE FROM manufacturer WHERE manufacturerName ="'+req.query.manufacturerName+'"';
    conn.query(sql, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/manufacturer');}
    });
  });

  route.post('/purchase', function(req, res){
    console.log("post_manufacturer_purchase :");
    var sql = 'SELECT * FROM productlist WHERE manufacturerName="'+req.body.manufacturerName+'"';
    conn.query(sql, function(err, results){
      if(err)                    {console.log(err);return res.sendfile('views/error.html');}
      else if(results.length==0) {return res.send('<script>alert("매입 실패. 제품이 없습니다."); document.location.href="/manufacturer";</script>');}
      else {
        var purchase =[];
        var reciveDate_=time_.getCurentTime();
        for(var i=0,j=0;i<results.length;i++){
          if(req.body[i]>0){
            purchase[i]={
              productCode:req.body[i+10],
              productAmount:req.body[i],
              factoryName:req.body.manufacturerName,
              reciveDate:reciveDate_,
              reciveState:"미수령"
            };
            j++;
          }
        }
        console.log("post_manufacturer_purchase : ");
        var sql = '';
        for ( var i=0;  i<purchase.length; i++ ) {
            sql += 'INSERT INTO center(productCode,productAmount,factoryName,reciveDate,reciveState) VALUE ("'+purchase[i].productCode+'","'+purchase[i].productAmount+'","'+purchase[i].factoryName+'","'+purchase[i].reciveDate+'","'+purchase[i].reciveState+'");';
        }
        conn.query(sql, function(err, results){
          if(err) {console.log(err);return res.sendfile('views/error.html');}
          else    {return res.send('<script>alert("매입 완료."); document.location.href="/manufacturer";</script>');}
        });
      }
    });
  });
  return route;
};
