var express = require('express');
var route = express.Router();
var sync = require('async');
var sort = require('../db/productSort.js');
var userGrade= require('../db/userGrade.js');
module.exports=function(app, conn){
  route.get('/', function(req, res){
    console.log("user_");
    if(req.user.grade==userGrade.MASTER){
      var sql = 'SELECT id, name, localPosition, approvalState, point,grade FROM user';
      conn.query(sql, function(err, results){
        if(err)             {console.log(err);return res.sendfile('views/error.html');}
        else if(results==0) {return res.render('user_60', {user:'',path:'user'});}
        else                {return res.render('user_60', {user:results,path:'user'});}
      });
    }
    else {res.redirect('/login');}
  });
  route.post('/',function(req, res) {
    if(req.user.grade==userGrade.MASTER) {console.log('post_user');return res.redirect('/user');}
    else                                 {return res.redirect('/login');}
  });

  route.get('/detail', function(req, res){
    console.log("user_detail_61_detail");
    if(req.user.grade==userGrade.MASTER){
      var sql = 'SELECT * FROM user WHERE id="'+req.query.id+'"';
      conn.query(sql, function(err, results){
        if(err)             {console.log(err);return res.sendfile('views/error.html');}
        else if(results==0) {return res.send('<script>alert("존재하지 않는 사용자입니다.");document.location.href="/user";</script>');}
        else                {return res.render('user_detail_61', {user:results[0],path:'user'});}
      });
    }
    else {return res.redirect('/login');}
  });

  route.post('/update_user', function(req, res){
    console.log("user_detail_61_update_user = "+req.body.id+","+req.body.name+","+req.body.key+","+req.body.localPosition);
    if(req.user.grade==userGrade.MASTER){
      var user = {};
      if(req.body.id){user.id=req.body.id;}
      if(req.body.name){user.name=req.body.name;}
      if(req.body.key){user.password=req.body.key;}
      if(req.body.localPosition){user.localPosition=req.body.localPosition;}
      if(req.body.point){user.point=req.body.point;}
      var sql = 'UPDATE user SET ? WHERE id="'+req.body.id+'"';
      conn.query(sql, user, function(err, results){
        if(err) {console.log(err);return res.sendfile('views/error.html');}
        else    {return res.redirect('/user');}
      });
    }
    else {return res.redirect('/login');}
  });

  route.post('/delete', function(req, res){
    console.log("user_detail_61_delete");
    if(req.user.grade==userGrade.MASTER){
      var sql = 'DELETE FROM user WHERE id ="'+req.body.id+'"';
      conn.query(sql, function(err, results){
        if(err) {console.log(err);return res.sendfile('views/error.html');}
        else    {return res.redirect('/user');}
      });
    }
    else {return res.redirect('/login');}
  });

  route.post('/update_approve', function(req, res){
    console.log("user_detail_61_update_approve " + req.body.id);
    if(req.user.grade==userGrade.MASTER){
      var sql = 'UPDATE user SET approvalState = true WHERE id="'+req.body.id+'"';
      conn.query(sql, function(err, results){
        if(err) {console.log(err);return res.sendfile('views/error.html');}
        else    {return res.redirect('/user');}
      });
    }
    else {res.redirect('/login');}
  });
  route.get('/deliverly', function(req, res){
    console.log("user_detail_61_deliverly");
    if(req.user.grade==userGrade.MASTER){
      var sql = 'SELECT productCode,costPrice,manufacturerName FROM productlist';
      conn.query(sql, function(err, productlist){
        if(err){console.log(err);return res.sendfile('views/error.html');}
        else if(productlist.length==0){return res.send('<script>alert("제품을 등록해주세요.");document.location.href="/user";</script>');}
        else{
            sync.parallel(
              [
                  function(callback){
                    var sql = 'SELECT productCode,productAmount,reciveDate AS Date,reciveState AS State FROM center';
                    conn.query(sql, function(err, results_product){
                        if(err){console.log(err);return res.sendfile('views/error.html');}
                        else{
                          var productAmount=sort.getProductAmount(results_product,productlist);
                          callback(null,productAmount);
                        }
                    });
                  },
                  function(callback){
                    sql = 'SELECT productCode,productAmount,reciveDate AS Date,reciveState AS State FROM recivetobranch';
                    conn.query(sql, function(err, results_recivetobranch){
                        if(err){console.log(err);return res.sendfile('views/error.html');}
                        else{
                          var productAmount=sort.getProductAmount(results_recivetobranch,productlist);
                          callback(null,productAmount);
                        }
                    });
                  },
                  function(callback){
                    var sql = 'SELECT costRate FROM user WHERE id="'+req.query.id+'"';
                    conn.query(sql, function(err, results){
                        if(err){console.log(err);return res.sendfile('views/error.html');}
                        else if(results.length==0) {callback(null,'');  }
                        else                       {callback(null,results);}
                    });
                  }
                ],
                function(err,results){
                  return res.render('deliverly_41', {centerproductAmount:results[0],reciveproductAmount:results[1],costRate:results[2], productlist:productlist,localPosition:req.query.local,path:'user'});
            });//sync
          }
        });
      }
      else {return res.redirect('/login');}
    });
  return route;
};
