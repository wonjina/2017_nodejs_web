var express = require('express');
var route = express.Router();

module.exports=function(app, conn){

  route.get('/', function(req, res){
    console.log("returnInputForm_50~~");
    var sql = 'SELECT DISTINCT localPosition,returnDate,returnState FROM returnproduct';
    conn.query(sql, function(err, results){
      if(err)             {console.log(err);return res.sendfile('views/error.html');}
      else if(results==0) {return res.render('returnInputForm_50', {results:'',user:req.user.id,path:'return'});}
      else                {return res.render('returnInputForm_50', {results:results,user:req.user.id,path:'return'});}
    });
  });

  route.get('/succese', function(req, res){
    console.log("returnInputForm_50~~");
    var sql = 'UPDATE returnproduct SET returnState = "수령" WHERE returnDate="'+req.query.date+'" and localPosition="'+req.query.local+'"';
    conn.query(sql, function(err, results){
      if(err){console.log(err);return res.sendfile('views/error.html');}
      else {return res.redirect('/return');}
    });
  });

  route.post('/detailsProduct', function(req, res){
    console.log("post_detailsProduct__");
    var sql = 'SELECT productCode,productAmount,localPosition FROM returnproduct WHERE localPosition="'+req.body.localPosition+'" and returnDate="'+req.body.returnDate+'"';
    conn.query(sql, function(err, results){
      if(err)             {console.log(err);return res.sendfile('views/error.html');}
      else if(results==0) {return res.send('');}
      else                {return res.send(results);}
    });
  });
  return route;
};
