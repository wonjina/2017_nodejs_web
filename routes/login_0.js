var express = require('express');
var route = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var userGrade = require('../db/userGrade');
module.exports=function(app, conn){

  route.get('/', function(req, res){
    console.log('get login : '+req.user);
    if(req.user!=undefined){
      if(req.user.grade==userGrade.MASTER)     {return res.redirect('/todayChart');}
      else if(req.user.grade==userGrade.INTERN){ req.logout(); req.session.save(()=>{return res.sendfile('views/login_0.html');}); }
      else                                     { req.logout(); req.session.save(()=>{return res.sendfile('views/login_0.html');}); }
    }
    else{res.sendfile('views/login_0.html');}
  });
  route.post('/',function(req, res, next) {
                    passport.authenticate('local', function(err, user, info) {
                      if (err) { return next(err); }
                      if (!user) { return res.send('<script>alert("아이디와 비밀번호를 확인하세요."); document.location.href="/login";</script>'); }
                      req.logIn(user, function(err) {
                        if (err) { return next(err); }
                        else{
                          console.log('post login : ');
                          if(req.user.grade==userGrade.MASTER) {return res.redirect('/todayChart');}
                          else                                 {return res.send('<script>alert("인턴페이지 준비중입니다."); document.location.href="/login";</script>');}
                        }
                      });
                    })(req, res, next);
                  }
            );

  route.get('/register',function(req,res){
    if(req.user!=undefined){  //already login
      if(req.user.grade==userGrade.MASTER) {return res.redirect('/todayChart');}
      else                                 {return res.send('<script>alert("인턴페이지 준비중입니다."); document.location.href="/login";</script>');}
    }
    else res.sendfile('views/register_1.html');
  });
  route.post('/register',function(req,res){
    console.log('post register : ');
    var user = {
      id:req.body.id,
      name:req.body.name,
      password:req.body.key,
      birthday:req.body.birthday,
      localPosition:req.body.localPosition
    };
    var sql = 'INSERT INTO user SET ?';
    conn.query(sql, user, function(err, results){
      if(err) {console.log(err);return res.sendfile('views/error.html');}
      else    {req.login(user, function(err) {return res.send('<script>alert("신청이 완료되었습니다."); document.location.href="/login";</script>'); });}
    });
  });

  route.post('/check', function(req, res){
    console.log('check');
    var sql = 'SELECT id FROM user WHERE id="'+req.body.id+'"';
    conn.query(sql, function(err, results){
        if(err)                    {console.log(err);return res.sendfile('views/error.html');}
        else if(results.length==0) {return res.send("ok");}
        else                       {return res.send("no");}
    });
  });

  route.get('/logout',function(req,res){
    console.log("logout : ");
    req.logout();  req.session.save(function(){return res.redirect('/login'); });
  });
  return route;
};
