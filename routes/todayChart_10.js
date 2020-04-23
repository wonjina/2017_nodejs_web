var express = require('express');
var route = express.Router();
var sort = require('../db/productSort.js');
var sync = require('async');
var userGrade= require('../db/userGrade.js');
module.exports=function(app, conn){

  route.get('/', function(req, res){
    if(req.user.grade==userGrade.MASTER){
      console.log("todayChart_");
      var attribute={purchaseMax:0,purchaseNow:0,deliverMax:0,deliverNow:0,returnMax:0,returnNow:0,deliver_data:[0,],purchase_data:[0,],return_data:[0,]};
      var remainProduct=[];
      var sql = 'SELECT productCode,costPrice FROM productlist';
      var d = new Date();

      conn.query(sql, function(err, results_productlist){
        if(err)                         {console.log(err);return res.sendfile('views/error.html');}
        else if(results_productlist==0) {return res.render('todayChart_10', {attribute:attribute,path:'todayChart',remainProduct:remainProduct,date:d.getFullYear()});  }
        else {
          sync.parallel(
            [
                function(callback){
                  var sql = 'SELECT productCode,productAmount,reciveDate AS Date,reciveState AS State FROM center';
                  conn.query(sql, function(err, results_product){
                    if(err){console.log(err);return res.sendfile('views/error.html');}//매입한게 없으면 납품한것도없기에 더이상 조회는 필요없음.
                    else{
                      var productAmount=sort.getProductAmount(results_product,results_productlist);
                      var total_product = sort.getProductPrice(productAmount,results_productlist);    //요부분 result 없을경우로 수정
                      var purchase_data=sort.chartData(results_product, results_productlist, d.getFullYear());
                      attribute.purchaseMax=total_product.all; attribute.purchaseNow=total_product.recive; attribute.purchase_data=purchase_data;
                      callback(null,productAmount);
                    }
                  });
                },
                function(callback){
                  sql = 'SELECT productCode,productAmount,reciveDate AS Date,reciveState AS State FROM recivetobranch';
                  conn.query(sql, function(err, results_recivetobranch){
                    if(err){console.log(err);return res.sendfile('views/error.html');}
                    else{
                      var productAmount=sort.getProductAmount(results_recivetobranch,results_productlist);
                      var total_recivetobranch = sort.getProductPrice(productAmount,results_productlist);
                      var deliver_data=sort.chartData(results_recivetobranch, results_productlist, d.getFullYear());
                      attribute.deliverMax=total_recivetobranch.all; attribute.deliverNow=total_recivetobranch.recive; attribute.deliver_data=deliver_data;
                      callback(null,productAmount);
                    }
                  });
                },
                function(callback){
                  sql = 'SELECT productCode,productAmount,returnDate AS Date,returnState AS State FROM returnproduct';
                  conn.query(sql, function(err, results_return){
                    if(err){console.log(err);return res.sendfile('views/error.html');}
                      else{
                        var productAmount=sort.getProductAmount(results_return,results_productlist);
                        var total_return=sort.getProductPrice(productAmount,results_productlist);
                        var return_data=sort.chartData(results_return, results_productlist, d.getFullYear());
                        attribute.returnMax=total_return.all; attribute.returnNow=total_return.recive; attribute.return_data=return_data;
                        callback(null,null);
                      }
                  });
                }
              ],
                function(err,results){
                  for(var i=0;i<results_productlist.length;i++){
                    var pObject={
                      productCode:results_productlist[i].productCode,
                      remainProduct:results[0][i].reciveAmount-results[1][i].allAmount,
                      waitingProduct:results[0][i].allAmount-results[0][i].reciveAmount
                    }
                    remainProduct.push(pObject);
                  }
                  return res.render('todayChart_10', {attribute:attribute,path:'todayChart',remainProduct:remainProduct,date:d.getFullYear()});
          });//async.parallel
        }
      });
    }
    else {return res.redirect('/login');}
  });
  return route;
};
