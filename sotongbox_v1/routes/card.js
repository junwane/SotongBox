module.exports = function(passport, io) {

  var express = require('express');
  var pool = require('../config/mysql/db')();
  var auto_incre = require('./auto_incre.js');
  var nowDate = require('./nowDate.js');
  var router = express.Router();

  router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {

      var first_sql = "select  sc_no, " +
        "sc_title, " +
        "sc_thumbnail, " +
        "sc_content, " +
        "(select m_img from member where m_no = sc.m_no) as m_img, " +
        "(select m_nickname from member where m_no = sc.m_no) as m_nickname, " +
        "(select m_level from member where m_no = sc.m_no) as m_level, " +
        "(select count(*) from sc_comment where sc_co_division = 'nice' and sc_no = sc.sc_no) as niceNum, " +
        "(select count(*) from sc_reply where sc_no = sc.sc_no) as replynum " +
        " from sotongcard sc order by sc_no desc";

      connection.query(first_sql, function(err, rows) {
        var noti_sql = "select m.m_img as m_img,"+
                                         "m.m_nickname as m_nickname,"+
                                         "n.noti_value1 as noti_value1,"+
                                         "n.noti_value2 as noti_value2,"+
                                         "DATE_FORMAT(n.noti_date, '%y%m%d') as noti_date,"+
                                         "n.noti_check as noti_check,"+
                                         "msg.msg_content as msg_content"+
                                  " from member m, notice n, message msg"+
                                  " where n.noti_accept = ? and m.m_no = n.noti_send and n.msg_no = msg.msg_no";
        connection.query(noti_sql, [req.user.m_no], function(err, noti_list){
          res.render('index', {
            rows: rows,
            noti_list : noti_list,
            page: './mainCard.ejs',
            user: req.user
          });
        });
        connection.release();
      });
    });
  });

  router.post('/choice', function(req, res) {

    console.log("마 히야 여왔따");

    var m_no = req.user.m_no;
    var check1 = req.body.check1;
    var check2 = req.body.check2;

    pool.getConnection(function(err, connection) {

      var sql = "select  sc_no, "+
                  "sc_title, "+
                  "sc_thumbnail, "+
                  "sc_content, "+
                  "(select m_img from member where m_no = sc.m_no) as m_img , "+
                  "(select m_nickname from member where m_no = sc.m_no) as m_nickname, "+
                  "(select m_level from member where m_no = sc.m_no) as m_level, "+
                  "(select count(*) from sc_comment where sc_co_division = 'nice' and sc_no = sc.sc_no) as niceNum, "+
                  "(select count(*) from sc_reply where sc_no = sc.sc_no) as replynum "+
                  "from sotongcard sc ";

      if (check1 == 'allcard') {
        if (check2 == 'newcard') {
          sql += "order by sc_no desc";
        } else if (check2 = 'nicecard') {
          sql += "order by niceNum desc";
        } else if (check3 = 'replycard') {
          sql += "order by replynum desc";
        }
      } else if (check1 == 'mycard') {
        if (check2 == 'newcard') {
          sql += "where m_no ='"+m_no+"' order by sc_no desc";
        } else if (check2 = 'nicecard') {
          sql += "where m_no ='"+m_no+"' order by niceNum desc";
        } else if (check3 = 'replycard') {
          sql += "where m_no ='"+m_no+"' order by replynum desc";
        }
      }




      connection.query(sql, function(err, result) {

        res.json(result);
      });
      connection.release();
    });
  });
  return router;
}
