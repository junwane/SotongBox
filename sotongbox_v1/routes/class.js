module.exports = function(multer, passport, io) {
  var auto_incre = require('./auto_incre.js');
  var nowDate = require('./nowDate.js');
  var pool = require('../config/mysql/db')();
  var route = require('express').Router();
  var moment = require('moment');
  var nodemailer = require('nodemailer'); //이메일 인증
  var SMTPServer = require('smtp-server').SMTPServer; //SMTP config
  var _storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/images/classImages');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  var upload = multer({
    storage: _storage
  });


  route.get('/', function(req, res) {
    pool.getConnection(function(err, connection) {
      var sql = "select  c_no," +
        "c_img," +
        "c_state," +
        "c_title," +
        "c_content," +
        "(select m_img from member where m_no = c.m_no) as m_img, " +
        "(select m_nickname from member where m_no = c.m_no) as m_nickname, " +
        "(select m_level from member where m_no = c.m_no) as m_level, " +
        "(select username from member  where m_no = c.m_no) as username, " +
        "(select count(b_me_no) from b_write where b_me_no='bm0000' and c_no = c.c_no ) as coursecount, " +
        "(select count(c_no) from c_course where c_no = c.c_no) as studentcount, " +
        "(select count(b_me_no) from b_write where b_me_no='bm0001' and c_no = c.c_no ) as replycount, " +
        "(select sum(b.b_title)div(replycount) from board b, b_write w where b.b_no = w.b_no and w.c_no = c.c_no and w.b_me_no='bm0001') as star " +
        "from class as c " +
        "group by c_no " +
        "order by c_no desc;";
      connection.query(sql, function(err, result) {
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
            user: req.user,
            page: './classPage.ejs',
            result: result,
            noti_list : noti_list
          });
        });
        connection.release();
      });
    });

  });

  route.post('/newClass', upload.single('userfile'), function(req, res) {
    console.log(req.body);
    var date = nowDate();
    var money = Number(req.body.c_money);

    if (req.file) {
      var c_img = String("/static/images/classImages/" + req.file.filename);
    } else {
      var c_img = req.body.unsplash;
    }

    pool.getConnection(function(err, connection) {
      var first_sql = "select count(*) as cnt from class where DATE_FORMAT(c_register, '%y%m%d') = ?";
      connection.query(first_sql, [date], function(err, result) {
        var cnt = "" + result[0].cnt;
        var name = 'c';
        var c_no = auto_incre(cnt, name);

        console.log(c_no);
        var Class_columns = {
          'c_no': c_no,
          'c_title': req.body.c_title,
          'c_content': req.body.c_content,
          'c_money': money,
          'c_img': c_img,
          'c_state': 'before',
          'c_register': date,
          'c_modify': date,
          'm_no': req.user.m_no,
          'cate_no': req.body.cate_no
        };


        var second_sql = "insert into class set ?";
        connection.query(second_sql, [Class_columns], function(err, results) {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/class');
          }
        });
        connection.release();
      });
    });


  });

  route.get('/Inner/:id', function(req, res) {

    var c_no = req.params.id;

    pool.getConnection(function(err, connection) {

      var first_sql = "select * from class where c_no = '" + c_no + "' ";
      connection.query(first_sql, function(err, rows) {

        var m_no = rows[0].m_no;

        var second_sql = "select * from member where m_no = '" + m_no + "' ";
        connection.query(second_sql, function(err, rows2) {

          var third_sql = "select * from board b, b_write w where w.c_no = '" + c_no + "' and b.b_no = w.b_no and w.b_me_no = 'bm0000' group by w.c_no";
          connection.query(third_sql, function(err, rows3) {

            if (!rows3[0]) {

            } else {
              var index = rows3[0].b_index;
              var str_index = index.substr(70, 11);
              rows3[0].b_index = str_index;
            }

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
                user: req.user,
                rows: rows,
                rows2: rows2,
                rows3: rows3,
                noti_list : noti_list,
                class_page: './class/courseIntro.ejs',
                page: './classInner.ejs'
              });
            });
          });
        });
      });
      connection.release();
    });
  });
  route.post('/Inner/:id/newQuestion', upload.single('userfile'), function(req, res) {

    var c_no = req.params.id;

    console.log("바디", req.body);
    console.log("파일", req.file);

    pool.getConnection(function(err, connection) {
      var first_sql = "select * from class where c_no = '" + c_no + "' ";
      connection.query(first_sql, function(err, rows) {

        var m_no = rows[0].m_no;

        var second_sql = "select * from member where m_no = '" + m_no + "' ";
        connection.query(second_sql, function(err, rows2) {
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
              user: req.user,
              rows: rows,
              rows2: rows2,
              noti_list : noti_list,
              class_page: './class/question.ejs',
              page: './classInner.ejs'
            });
          });
        });
      });
      connection.release();
    });
  });

  route.get('/Inner/:id/classjoin', function(req, res) {
    var c_no = req.params.id;
    var n_m_no = req.user.m_no;

    pool.getConnection(function(err, connection) {
      var zero_sql = "INSERT INTO c_course(c_no, m_no) VALUES (?,?)";
      connection.query(zero_sql, [c_no, n_m_no], function(err, rows5) {

        var first_sql = "select * from class where c_no = '" + c_no + "' ";
        connection.query(first_sql, function(err, rows) {

          var m_no = rows[0].m_no;

          var second_sql = "select * from member where m_no = '" + m_no + "' ";
          connection.query(second_sql, function(err, rows2) {

            var third_sql = "select w.m_no, w.c_no, w.b_me_no, w.b_no, b.b_title, b.b_content, b.b_index from b_write w, board b where w.m_no = '" + m_no + "' and w.b_me_no = 'bm0000' and w.c_no = '" + c_no + "'and w.b_no = b.b_no order by b_no";
            connection.query(third_sql, function(err, rows3) {

              var middle_sql = "select * from c_course where c_no = '" + c_no + "' and m_no = '" + n_m_no + "' ";
              connection.query(middle_sql, function(err, rows5) {


                var fourth_sql = "select w.c_no as c_no, b.b_no as b_no, r.b_r_no as b_r_no, r.m_no as m_no, r.b_r_content as b_r_content, r.b_r_register as b_r_register, m.m_img as m_img, m.m_nickname as m_nickname from b_write w, board b, b_reply r, member m where w.c_no = '" + c_no + "' and w.b_me_no = 'bm0000' and w.b_no = b.b_no and b.b_no = r.b_no and r.m_no = m.m_no ";
                connection.query(fourth_sql, function(err, rows4) {

                  for (var i = 0; i < rows4.length; i++) {

                    var time = rows4[i].b_r_register;

                    if (moment(time).format("YYMMDD") - moment().format("YYMMDD") == 0) {
                      time = moment(time).fromNow()
                    } else {
                      time = moment(time).format("YY년 MM월DD일 HH시mm분")
                    }
                    rows4[i].b_r_register = time;

                  }

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
                      user: req.user,
                      rows: rows,
                      n_m_no: n_m_no,
                      rows2: rows2,
                      rows3: rows3,
                      rows4: rows4,
                      rows5: rows5,
                      noti_list : noti_list,
                      class_page: './class/courseList.ejs',
                      page: './classInner.ejs'
                    });
                  });
                });
              });
            });
          });
        });
      });
      connection.release();
    });
  });

  route.get('/Inner/:id/courseList', function(req, res) {

    var c_no = req.params.id;
    var n_m_no = req.user.m_no;

    pool.getConnection(function(err, connection) {

      var first_sql = "select * from class where c_no = '" + c_no + "' ";
      connection.query(first_sql, function(err, rows) {

        var m_no = rows[0].m_no;

        var second_sql = "select * from member where m_no = '" + m_no + "' ";
        connection.query(second_sql, function(err, rows2) {

          var third_sql = "select w.m_no, w.c_no, w.b_me_no, w.b_no, b.b_title, b.b_content, b.b_index from b_write w, board b where w.m_no = '" + m_no + "' and w.b_me_no = 'bm0000' and w.c_no = '" + c_no + "'and w.b_no = b.b_no order by b_no";
          connection.query(third_sql, function(err, rows3) {

            var middle_sql = "select * from c_course where c_no = '" + c_no + "' and m_no = '" + n_m_no + "' ";
            connection.query(middle_sql, function(err, rows5) {


              var fourth_sql = "select w.c_no as c_no, b.b_no as b_no, r.b_r_no as b_r_no, r.m_no as m_no, r.b_r_content as b_r_content, r.b_r_register as b_r_register, m.m_img as m_img, m.m_nickname as m_nickname from b_write w, board b, b_reply r, member m where w.c_no = '" + c_no + "' and w.b_me_no = 'bm0000' and w.b_no = b.b_no and b.b_no = r.b_no and r.m_no = m.m_no ";
              connection.query(fourth_sql, function(err, rows4) {

                for (var i = 0; i < rows4.length; i++) {

                  var time = rows4[i].b_r_register;

                  if (moment(time).format("YYMMDD") - moment().format("YYMMDD") == 0) {
                    time = moment(time).fromNow()
                  } else {
                    time = moment(time).format("YY년 MM월DD일 HH시mm분")
                  }
                  rows4[i].b_r_register = time;

                }

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
                    user: req.user,
                    rows: rows,
                    n_m_no: n_m_no,
                    rows2: rows2,
                    rows3: rows3,
                    rows4: rows4,
                    rows5: rows5,
                    noti_list : noti_list,
                    class_page: './class/courseList.ejs',
                    page: './classInner.ejs'
                  });
                });
              });
            });
          });
        });
      });
      connection.release();
    });
  });
  route.post('/Inner/reply', function(req, res) {

    var b_no = req.body.b_no;
    var m_no = req.body.m_no;
    var b_r_content = req.body.b_r_content;
    var date = nowDate();

    pool.getConnection(function(err, connection) {

      var first_sql = "select count(*) as cnt from b_reply where DATE_FORMAT(b_r_register, '%y%m%d') = ?"
      connection.query(first_sql, [date], function(err, result) {

        var cnt = "" + result[0].cnt;
        var name = 'r';
        var b_r_no = auto_incre(cnt, name);

        var second_sql = "INSERT INTO b_reply(b_r_no, b_no, m_no, b_r_content) VALUES (?,?,?,?)";
        connection.query(second_sql, [b_r_no, b_no, m_no, b_r_content], function(err, result2) {

          var third_sql = "select m.m_img, m.m_nickname, b.b_r_no, b.b_no, b.m_no, b.b_r_content, b.b_r_register from member m, b_reply b where b.b_r_no = '" + b_r_no + "' and b.m_no = m.m_no;";
          connection.query(third_sql, [b_r_no, b_no, m_no, b_r_content], function(err, result3) {

            for (var i = 0; i < result3.length; i++) {

              var time = result3[i].b_r_register;

              if (moment(time).format("YYMMDD") - moment().format("YYMMDD") == 0) {
                time = moment(time).fromNow()
              } else {
                time = moment(time).format("YY년 MM월DD일 HH시mm분")
              }
              result3[i].b_r_register = time;
            }

            res.json(result3);
          });
        });
      });
    });
  });

  route.post('/Inner/:id/courseMake', function(req, res) {

    console.log("여기온다 클래스");

    var m_no = req.user.m_no
    var c_no = req.params.id;
    var date = nowDate();
    var b_title = req.body.b_title;
    var b_content = req.body.b_content;
    var b_me_no = req.body.b_me_no;
    var b_index = req.body.b_index;

    var b_index = b_index.replace('560', '750');
    var b_index = b_index.replace('315', '472.5');

    pool.getConnection(function(err, connection) {

      var first_sql = "select count(*) as cnt from board where DATE_FORMAT(b_register, '%y%m%d') = ?"
      connection.query(first_sql, [date], function(err, result) {

        var cnt = "" + result[0].cnt;
        var name = 'b';
        var b_no = String(c_no + auto_incre(cnt, name));

        var second_sql = "INSERT INTO board(b_no, b_title, b_content, b_index) VALUES (?,?,?,?)";
        connection.query(second_sql, [b_no, b_title, b_content, b_index], function(err, result2) {

          var third_sql = "INSERT INTO b_write(m_no, c_no, b_me_no, b_no) VALUES (?,?,?,?)";
          connection.query(third_sql, [m_no, c_no, b_me_no, b_no], function(err, result3) {

            var fourth_sql = "select * from board where b_no = '" + b_no + "'";
            connection.query(fourth_sql, function(err, rows) {

              res.json(rows);
            });
          });
        });
      });
      connection.release();
    });
  });
  route.get('/Inner/:id/question', function(req, res) {

    var c_no = req.params.id;

    pool.getConnection(function(err, connection) {

      var first_sql = "select * from class where c_no = '" + c_no + "' ";
      connection.query(first_sql, function(err, rows) {

        var m_no = rows[0].m_no;

        var second_sql = "select * from member where m_no = '" + m_no + "' ";
        connection.query(second_sql, function(err, rows2) {
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
              user: req.user,
              rows: rows,
              rows2: rows2,
              noti_list : noti_list,
              class_page: './class/question.ejs',
              page: './classInner.ejs'
            });
          });
        });
      });
      connection.release();
    });
  });

  //수강평 게시판
  route.get('/Inner/:id/courseEvaluation', function(req, res) {

    var c_no = req.params.id;
    var comments = 5;

    pool.getConnection(function(err, connection) {

      var first_sql = "select m_no, c_no, b_me_no," +
        " (select m_nickname from member where m_no = b.m_no) as m_nickname," +
        " (select m_img from member where m_no = b.m_no) as m_img," +
        " (select b_no from board where b_no = b.b_no) as b_no," +
        " (select b_title from board where b_no = b.b_no) as b_title," +
        " (select b_content from board where b_no = b.b_no) as b_content," +
        " (select date_format(b_register, '%y-%m-%d %H:%i:%s') from board where b_no = b.b_no) as b_register," +
        " (select count(b.b_me_no) from b_write b where b.b_me_no = 'bm0001' and b.c_no = ? ) as commentNum," +
        " (select round(sum(b_title) / commentNum) from board bo, b_write b, class c where b.c_no = c.c_no and bo.b_no = b.b_no and b.c_no = ?) as starGrade" +
        " from b_write b" +
        " where b_me_no = 'bm0001'" +
        " and m_no = " +
        " (select m_no" +
        " from member" +
        " where m_no = b.m_no and c_no = ?)" +
        " order by (select date_format(b_register, '%y-%m-%d %H:%i:%s') from board where b_no = b.b_no)"
      connection.query(first_sql, [c_no, c_no, c_no], function(err, row) {

        var second_sql = "select * from class where c_no = '" + c_no + "' ";
        connection.query(second_sql, function(err, rows) {

          var m_no = rows[0].m_no;

          var third_sql = "select * from member where m_no = ?";
          connection.query(third_sql, [m_no], function(err, rows2) {
            if (err) {
              console.log(err);
            } else {
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
                  user: req.user,
                  rows: rows,
                  rows2: rows2,
                  row: row,
                  noti_list : noti_list,
                  class_page: './class/courseEvaluation.ejs',
                  page: './classInner.ejs'
                });
              });
            }
          });
        });
        connection.release();
      });

    });
  });

  //수강평 비동기
  route.post('/Inner/:id/courseEvaluation', function(req, res) {
    var c_no = req.params.id;
    var date = nowDate();
    var b_content = req.body.comment;
    var starNum = String(req.body.num);


    pool.getConnection(function(err, connection) {
      var sql = "select count(*) as cnt from board where DATE_FORMAT(b_register, '%y%m%d') = ?";
      connection.query(sql, [date], function(err, result) {
        var cnt = "" + result[0].cnt;
        var name = 'b';
        var bno = auto_incre(cnt, name);
        var b_no = c_no + auto_incre(cnt, name);

        console.log("게시글번호" + b_no);

        var sql1 = "insert into board(b_no, b_title, b_content, b_register, b_modify) values(?,?,?,now(),now())";
        connection.query(sql1, [b_no, starNum, b_content], function(err, result) {
          console.log("인서트1" + result);
        });

        var sql2 = "select b_me_no from b_menu where b_me_no = 'bm0001'";
        connection.query(sql2, function(err, results) {
          console.log(results[0]);
          var b_me_no = results[0].b_me_no;

          var sql3 = "insert into b_write(m_no, c_no, b_me_no, b_no) values(?,?,?,?)";
          connection.query(sql3, [req.user.m_no, c_no, b_me_no, b_no], function(err, b_write) {
            console.log("인서트2" + b_write);

            var sql4 = "select b_no, b_title, b_content," +
              "(select count(b.b_me_no) from b_write b where b.b_me_no = 'bm0001' and b.c_no = '" + c_no + "' ) as title_count," +
              "(select round(sum(a.b_title)div(title_count)) from board a, b_write b where b.c_no = '"+c_no+"' and b.b_me_no = 'bm0001' and a.b_no = b.b_no ) as starGrade," +
              "(select DATE_FORMAT(b_register, '%y-%m-%d %H:%i:%s')) as b_register, b_modify," +
              "(select m_img from member where m_no =?) as m_img," +
              "(select m_nickname from member where m_no=?) as m_nickname" +
              " from board, class c" +
              " where b_no = ?;"
            connection.query(sql4, [req.user.m_no, req.user.m_no, b_no], function(err, reply) {
              if (err) {
                console.log(err);
              } else {
                console.log(reply);
                res.json(reply);
              }
            });

            connection.release();
          });
        });

      });
    });


  });
  route.post('/Inner/choice', function(req, res) {
    var m_no = req.user.m_no;
    var check1 = req.body.check1;
    var check2 = req.body.check2;

    pool.getConnection(function(err, connection) {

      var sql = "select  c_no, " +
        "c_img, " +
        "c_state, " +
        "c_title, " +
        "c_content, " +
        "(select m_img from member where m_no = c.m_no) as m_img, " +
        "(select m_nickname from member where m_no = c.m_no) as m_nickname, " +
        "(select m_level from member where m_no = c.m_no) as m_level, " +
        "(select username from member  where m_no = c.m_no) as username, " +
        "(select count(b_me_no) from b_write where b_me_no='bm0000' and c_no = c.c_no ) as coursecount, " +
        "(select count(c_no) from c_course where c_no = c.c_no) as studentcount, " +
        "(select count(b_me_no) from b_write where b_me_no='bm0001' and c_no = c.c_no ) as replycount, " +
        "(select sum(b.b_title)div(replycount) from board b, b_write w where b.b_no = w.b_no and w.c_no = c.c_no and w.b_me_no='bm0001') as star " +
        "from class as c ";

      if (check1 == 'allclass') {
        if (check2 == 'newclass') {
          sql += "group by c_no order by c_no desc;";
        } else if (check2 = 'highstar') {
          sql += "group by c_no order by star;";
        }
      } else if (check1 == 'myclass') {
        if (check2 == 'newclass') {
          sql += "where m_no = '" + m_no + "' group by c_no order by c_no;";
        } else if (check2 = 'highstar') {
          sql += "where m_no = '" + m_no + "' group by c_no order by star;";
        }
      }
      connection.query(sql, function(err, ajax_result) {
        res.json(ajax_result);
      });
    });
  });

  route.post('/register', function(req, res) {

    var mailOpts, smtpTrans;

    let transporter = nodemailer.createTransport({
      port: 587,
      host: 'smtp.naver.com',
      service: 'naver',
      auth: {
        user: 'sotongbox@naver.com',
        pass: 'manager1@#'
      }
    }); // close transporter

    let mailOptions = {
      from: 'sotongbox@naver.com',
      to: 'sotongbox@naver.com',
      subject: '[소통박스] ' + req.user.username + '님이 클래스 신청을 하였습니다.',
      html: "<h1>안녕하세요! 저는 디렉터 신청을 원하는 " + req.body.name + "입니다!.</h1>" + "<br>" +
        "연락처 : " + req.body.phone + "입니다!." + "<br>" +
        "하고 싶은 클래스 : " + req.body.wantClass + "입니다!." + "<br>" +
        "유/무료 선택 : " + req.body.optionsCheckboxes + "<br>" +
        "디렉터 신청을 원합니다!."
    };

    transporter.sendMail(mailOptions, (error, info) => {
      //Email not sent
      if (error) {
        console.log(error);
      }
      //Email sent
      else {
        console.log(info);
        transporter.close();
        setTimeout(function() {
          res.redirect('/');
        }, 3000);
      }
    }); // close transport.sendMail
  });
  // route.post('/makelecture', function(req, res) {
  //
  //
  //   res.render('index', {
  //     user: req.user,
  //     rows: rows,
  //     rows2: rows2,
  //     page: './classInner.ejs'
  //   });
  return route;
};
