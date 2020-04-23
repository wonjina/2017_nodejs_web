const server_port = 30001;
const db_port = 3306;
const db_info = require(__dirname+'/db/db_info.js');
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const morgan=require('morgan');

var conn = require(__dirname+'/db/db_con.js')

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');  //템플릿 엔진 ejs 사용하겠다고 선언한 것입니다. 이 선언을 함으로써 우리는 res.render 메소드에서 .ejs를 생략할 수 있게되었습니다.
app.set('layout', 'layout');  //views/layout.ejs를 기본 레이아웃으로 설정합니다. layout.ejs의 <%- body %> 부분에 랜더링된 html 문자열이 들어갑니다.
app.set("layout extractScripts", true); //랜더링된 html에서 모든 script태그를 추출합니다. 이 script태그들은 layout.ejs에서 <%- script %> 부분에 들어가게 됩니다.
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host:db_info.host,
    port:3306,
    user:db_info.user,
    password:db_info.password,
    database:db_info.database
  })
}));
app.use(express.static(path.join(__dirname, 'public')));  //이 폴더에 css ,js같은 파일넣어서 views 파일에서 읽어오기 가능, public 하위 내용이 자동으로 /경로 아래로 라우팅 됨.
app.use('/:a',express.static(path.join(__dirname, 'public')));
app.use('/:a/:b',express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());
require('./passport/passport.js')(conn);

var login_0 = require('./routes/login_0.js')(app, conn);
var todayChart_10 = require('./routes/todayChart_10.js')(app, conn);
var manufacturer_20 = require('./routes/manufacturer_20.js')(app, conn);
var deliver_40 = require('./routes/deliver_40.js')(app, conn);
var return_50 = require('./routes/return_50.js')(app, conn);
var user_60 = require('./routes/user_60.js')(app, conn);
app.use('/login',login_0);
app.use('/todayChart',todayChart_10); //오늘 현황
app.use('/manufacturer',manufacturer_20);       //현황 조회
app.use('/deliver',deliver_40);       //납품
app.use('/return',return_50);         //반품
app.use('/user',user_60);
app.use(morgan('dev'));

app.listen(server_port, function(){
  console.log("connected : "+server_port);
});
