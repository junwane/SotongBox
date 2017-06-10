module.exports = function(){
  var mysql = require('mysql');
  var pool = mysql.createPool({
    connectionLimit : 5,
    host:'localhost',
    user :'root',
    password : '111111',
    port : 3306,
    database : 'sotong'
  });

  return pool;
};

// module.exports = function(){
//   var mysql = require('mysql');
//   var pool = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '111111',
//     database : 'test',
//     port : 3307
//   });
//   pool.connect();
//   return pool;
// };
