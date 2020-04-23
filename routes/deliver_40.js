var express = require('express');
var route = express.Router();
var time = require('../db/getPresentTime.js');
var productState = require('../db/productState.js');
module.exports=function(app, conn){

  route.get('/', function(req, res){
      console.log("get_deliver");
      sql = 'SELECT DISTINCT reciveDate,localPosition,reciveState FROM recivetobranch';
      conn.query(sql, function(err, recive){
        if(err)             {console.log(err);return res.sendfile('views/error.html');}
        else if(recive==0)  {return res.render('deliverInputForm_40', {recive:'',path:'deliver'});}
        else                {return res.render('deliverInputForm_40', {recive:recive,path:'deliver'});}
      });
  });

  route.post('/detailsDeliver', function(req, res){
    console.log("ajax__detailsDeliver");
      sql = 'SELECT productCode,productAmount FROM recivetobranch where reciveDate="'+req.body.reciveDate+'" and localPosition="'+req.body.localPosition+'"';
      conn.query(sql, function(err, results){
        if(err)             {console.log(err);return res.sendfile('views/error.html');}
        else if(results==0) {return res.send('');}
        else                {return res.send(results);}
      });
  });

  route.post('/deliverly', function(req, res){
    var deliverly =[];
    var reciveDate_ = time.getCurentTime();
    console.log("post_deliverly : ");
    for(var i=0,j=0;i<req.body.length;i++){
      if(req.body[req.body[i]]>0){
        deliverly[j]={
          productCode:req.body[i],
          productAmount:req.body[req.body[i]],
          reciveDate:reciveDate_,
          reciveState:productState.NOTDONE,
          localPosition:req.body.localPosition
        };
        j++;
      }
    }
    var sql = '';
    for ( var i=0;  i<deliverly.length; i++ ) {
        sql += 'INSERT INTO recivetobranch(productCode,productAmount,reciveDate,reciveState,localPosition) VALUE ("'+deliverly[i].productCode+'","'+deliverly[i].productAmount+'","'+deliverly[i].reciveDate+'","'+deliverly[i].reciveState+'","'+deliverly[i].localPosition+'");';
    }
    conn.query(sql, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {return res.redirect('/user');}
    });
  });

  return route;
};
