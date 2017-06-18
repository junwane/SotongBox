module.exports = function(passport, io) {

  var express = require('express');
  var pool = require('../config/mysql/db')();
  var auto_incre = require('./auto_incre.js');
  var nowDate = require('./nowDate.js');
  var router = express.Router();


  /* GET home page. */
  router.get('/', function(req, res, next) {
    var m_no = req.user.m_no;
    var accept_m_name = new Array();
    var send_m_name = new Array();
    pool.getConnection(function(err, connection) {

      var first_sql = "select note_no, max(note_date) as note_date, max(note_content) as note_content, note_send, note_accept from note a where note_date=(select max(note_date) from note b where note_no = a.note_no and (note_send = '"+m_no+"' or note_accept= '"+m_no+"')) group by note_no order by note_date desc";
      connection.query(first_sql, function(err, rows) {

        var second_sql = "select m.m_nickname as m_nickname, m.m_img as m_img, max(n.note_date) as note_date, m_no from member m,( select note_send as my, note_accept as you, note_date from note where note_send = '"+m_no+"' union select	note_accept as my, note_send as you, note_date from note where note_accept = '"+m_no+"') n where n.you = m.m_no group by m.m_nickname order by note_date desc";
        connection.query(second_sql, function(err, rows2) {


          res.render('index', {
            page: './chat.ejs',
            user: req.user,
            rows: rows,
            rows2: rows2
          });
        });
      });
      connection.release();
    });
  });

  router.post('/', function(req, res, next) {
    global.username = req.user.username;
    global.usernickname = req.user.m_nickname;

    var send_m_no = req.user.m_no;
    var take_m_no = req.body.take_m_no;
    var send_nickname = global.usernickname;
    var take_nickname = req.body.take_m_nickname;
    var send_m_img = req.user.m_img;
    var take_m_img = req.body.take_m_img;

    var datas = [send_m_no, take_m_no, take_m_no, send_m_no];

    pool.getConnection(function(err, connection) {
      var sql = "select * from note where note_send=? and note_accept =? or note_send=? and note_accept =? order by note_date";
      connection.query(sql, datas, function(err, rows) {

        res.render('chating', {
          send_nickname: send_nickname,
          take_nickname: take_nickname,
          send_m_no: send_m_no,
          take_m_no: take_m_no,
          send_m_img: send_m_img,
          take_m_img: take_m_img,
          rows: rows
        });
        connection.release();
      });
    });
  });

  router.post('/usersearch', function(req, res) {
    var ajax_username = req.body.username;
    if (ajax_username != "") {
      pool.getConnection(function(err, connection) {
        var sql = "select m_nickname, m_no, m_img,count(username) as e_num from member where m_nickname like '%" + ajax_username + "%'";
        connection.query(sql, function(err, result) {
          if (err) {
            console.log("에러메세지", err);
          } else {
            res.json(result);
            connection.release();
          }
        }); //end of connection
      }); //end of pool
    }
  }); //end of route
  io.on('connection', function(socket) {

    socket.broadcast.emit(global.usernickname, socket.id);
    io.to(socket.id).emit('change name', global.usernickname);

    socket.on('send message', function(note_send, note_content, note_accept, send_name, take_name) {
      var note_content = note_content;
      var note_send = note_send;
      var note_accept = note_accept;
      var note_check = 0;
      var send_name = send_name;
      var take_name = take_name;

      var datas = [note_send, note_accept, note_accept, note_send];

      pool.getConnection(function(err, connection) {
        var first_sql = "select * from note where note_send=? and note_accept =? or note_send=? and note_accept =?";
        connection.query(first_sql, datas, function(err, result) {

          var note_no = result[0].note_no;

          var second_sql = "insert into note(note_no, note_content ,note_send, note_accept , note_check) values(?,?,?,?,?)";
          connection.query(second_sql, [note_no, note_content, note_send, note_accept, note_check], function(err, rows) {

            io.to(socket.id).emit('receive message', note_content, send_name);
            connection.release();
          });
        });
      });
    });

    socket.on('first message', function(note_send, note_content, note_accept, send_name, take_name) {
      var note_content = note_content;
      var note_send = note_send;
      var note_accept = note_accept;
      var note_check = 0;
      var send_name = send_name;
      var take_name = take_name;

      var datas = [note_send, note_accept, note_accept, note_send];

      pool.getConnection(function(err, connection) {
        var first_sql = "select MAX(note_no) as num from note;";
        connection.query(first_sql, function(err, result) {

          var check = result[0].num;

          if (check == null) {
            var note_no = 0;
          } else {
            var note_no = result[0].num;
          }

          var second_sql = "select * from note where note_send=? and note_accept =? or note_send=? and note_accept =?";
          connection.query(second_sql, datas, function(err, rows) {

            if (rows == "") {

              var now_no = Number(note_no) + 1;
            } else {

              var now_no = Number(note_no);
            }

            var sqlForInsertBoard = "insert into note(note_no, note_content ,note_send, note_accept , note_check) values(?,?,?,?,?)";
            connection.query(sqlForInsertBoard, [now_no, note_content, note_send, note_accept, note_check], function(err, rows) {
              if (err) console.error("err : " + err);
              connection.release();
            });
          });
        });
      });
      io.emit('receive message', note_content, send_name);
    });
  });

  return router;
}
