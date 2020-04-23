
var mysql = require('mysql');
var conn = mysql.createConnection(require('./db_info.js'));
conn.connect(function (err) {
  if (err) {
    console.error('mysql connection error :' + err);
  } else {
    console.info('mysql is connected successfully.');
  }
});
module.exports=conn;
