const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (connection) => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    console.log('serializeUser', user.id);
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    if(user.id !=undefined && user.id != null){
      connection.query("SELECT id,password,grade,approvalState FROM user WHERE id = '"+user.id+"'", function(err, results) {
          if (err){  return done(err);}
          else if(results.length==0){done(null, false, {message: '로그인하세요' });}
          else{
            console.log('passport_deserializeUser : '+ results[0].id +","+parseInt(results[0].grade));
            user = results[0];
            done(null, user); // 여기의 user가 req.user가 됨
          }
        });
    }
    else done(null, false, {message: '로그인하세요' });
  });

  passport.use(new LocalStrategy({ // local 전략을 세움
    usernameField:'id',
    passwordField:'key',
    passReqToCallback: true,
  }, (req, id, key, done) => {
    console.log('LocalStrategy : '+id+key);
    connection.query("SELECT id,password,grade,approvalState FROM user WHERE id = ?",[id], function(err, results) {
      console.log('Local_Strategy_query_');
        if (err){
          return done(err);//query error
        }
        else if (results.length==0)  {
          return done(null, false);
        } //no result
        else {
          if((results[0].password)==key && results[0].approvalState){
            console.log('Local_Strategy_select_'+results[0].grade);
            return done(null, results[0]);
          }else{ done(null, false)}
        }
    });
  }));
};
