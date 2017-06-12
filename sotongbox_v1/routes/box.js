module.exports = function(multer, passport) {

  var express = require('express');
  var pool = require('../config/mysql/db')();
  var auto_incre = require('./auto_incre.js');
  var nowDate = require('./nowDate.js');
  var router = express.Router();
  var _storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/images/userUploadImages')
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  })
  var upload = multer({
    storage: _storage
  })

  /* GET home page. */
  router.get('/Inner:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
      if (err) console.log("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sb_no = req.params.id;
        sb_no = sb_no.substring(1, 13);
        var m_no = req.user.m_no;
        var sql = "select sb_open,"
                          +"sb_img,"
                          +"sb_name,"
                          +"DATE_FORMAT(sb_register, '%Y %m %d')as sb_resiger,"
                          +"(select count(*) from sotongcard where sb_no = ?) as cardnum,"
                          +"(select count(*) from sb_subscribe where sb_no = ? and sb_s_check = 1) as subscribenum"
                  +" from  sotongbox as sb"
                  +" where sb_no = ?;"
        connection.query(sql, [sb_no, sb_no, sb_no], function(err, result) {
          if (err) console.log("해당 소통상자 select 에러 : ", err);
          else {
            var sql2 = "select sb_s_check as subscribe"
                      +" from sb_subscribe"
                      +" where sb_no = ? and m_no = (select m_no from member where m_no = ?);"
            connection.query(sql2, [sb_no, m_no], function(err, check) {
              if (err) console.log("구독 체크 에러 : ", err);
              else {
                if (check == '') {
                  check[0] = {
                    subscribe: 2
                  };
                }
                res.render('index', {
                  result: result,
                  check: check,
                  page: './boxInner.ejs',
                  user: req.user,
                  sb_no: sb_no
                });
              }
            });
            connection.release();
          }
        });
      }
    });
  });

  router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
      if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sql = "select  sb_no, "
                          +"sb_img, "
                          +"sb_name,"
                          +"(select m_img from member where m_no = sb.m_no) as m_img,"
                          +"(select m_nickname from member where m_no = sb.m_no) as m_nickname,"
                          +"(select m_level from member where m_no = sb.m_no) as m_level,"
                          +"(select username from member  where m_no = sb.m_no) as username,"
                          +"(select count(*) from sotongcard where sb_no = sb.sb_no) as cardnum,"
                          +"(select count(*) from sb_subscribe where sb_no = sb.sb_no) as subscribenum"
                +" from sotongbox as sb"
                +" where sb_no != '0'"
                +" group by sb_no"
                +" order by sb_register desc;"
        connection.query(sql, function(err, results) {
          res.render('index', {
            results: results,
            page: './box.ejs',
            user: req.user
          });

          connection.release();
        });
      }
    });
  });
  router.post('/newBox', upload.single('userfile'), function(req, res, next) {
    var cate_no = req.body.category;
    var m_no = req.user.m_no;
    var sb_name = req.body.boxname;
    var sb_open = req.body.optionsRadios;
    if (req.file) {
      var sb_img = String("/static/images/userUploadImages/" + req.file.filename);
    } else {
      var sb_img = req.body.unsplash;
    }

    pool.getConnection(function(err, connection) {
      if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);
      var date = nowDate();
      var first_sql = "select count(*) as cnt from sotongbox where DATE_FORMAT(sb_register, '%y%m%d') = ?";
      connection.query(first_sql, [date], function(err, result) {
        var cnt = "" + result[0].cnt;
        var name = 'sb';
        var sb_no = auto_incre(cnt, name);

        var second_sql = "INSERT INTO sotongbox(sb_no, cate_no, m_no, sb_name, sb_img, sb_open) VALUES (?,?,?,?,?,?);";
        connection.query(second_sql, [sb_no, cate_no, m_no, sb_name, sb_img, sb_open], function(err, result) {
          if (err) console.error("상자 만드는 중 에러 발생 err : ", err);

          var third_sql = "select sb_open," +
            "sb_img," +
            "sb_name," +
            "DATE_FORMAT(sb_register, '%Y %m %d')as sb_resiger," +
            "(select count(*) from sotongcard where sb_no = ?) as cardnum," +
            "(select count(*) from sb_subscribe where sb_no = ? and sb_s_check = 1) as subscribenum" +
            " from  sotongbox as sb" +
            " where sb_no = ?;"
          connection.query(third_sql, [sb_no, sb_no, sb_no], function(err, result) {
            if (err) console.log('상자 생성 후 해당 상자 내부 페이지 이동 시 에러 : ', err);
            else {
              var sql2 = "select sb_s_check as subscribe" +
                " from sb_subscribe" +
                " where sb_no = ? and m_no = (select m_no from member where m_no = ?);"
              connection.query(sql2, [sb_no, m_no], function(err, check) {
                if (err) console.log("구독 체크 에러 : ", err);
                else {
                  if (check == '') {
                    check[0] = {
                      subscribe: 2
                    };
                  }
                  res.render('index', {
                    result: result,
                    check: check,
                    page: './boxInner.ejs',
                    user: req.user,
                    sb_no : sb_no
                  });
                }
              });
              connection.release();
            }
          });
        });
      });
    });
  });
  router.post('/newCard', function(req, res, next) {

    console.log("내용");
    console.log(req.body);

    var m_no = req.user.m_no;
    var sb_no = req.body.sb_no;
    var sc_thumbnail = req.body.unsplash;
    var sc_title = req.body.cardname;
    var sc_content = req.body.ir1;
    var sc_ti_name = req.body.tag;
    var sc_thumbnail = req.body.unsplash;

    var tagArray = sc_ti_name.split('#');
    tagArray.splice(0, 1);

    pool.getConnection(function(err, connection) {
      if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);
      var date = nowDate();
      console.log('준완이형님',date);
      var first_sql = "select count(*) as cnt from sotongcard where DATE_FORMAT(sc_register, '%y%m%d') = ?";
      connection.query(first_sql, [date], function(err, result) {
        console.log("박준완짱",result);
        var cnt = "" + result[0].cnt;
        var name = 'sc';
        var sc_no = auto_incre(cnt, name);

        var second_sql = "INSERT INTO sotongcard(sc_no, m_no, sb_no, sc_title, sc_content, sc_thumbnail) VALUES (?,?,?,?,?,?);";
        connection.query(second_sql, [sc_no, m_no, sb_no, sc_title, sc_content, sc_thumbnail], function(err, result) {
          console.log("두번째 쿼리 에러", err);

          for (i = 0; i < tagArray.length; i++) {
            var third_sql = "INSERT INTO sc_taginfo(sc_no,sc_ti_name) VALUES(?,?);";
            connection.query(third_sql, [sc_no, tagArray[i]], function(err, result) {
              console.log("세번째 쿼리 에러", err);
            });
          }
          var fourth_sql = "select sb_open," +
            "sb_img," +
            "sb_name," +
            "DATE_FORMAT(sb_register, '%Y %m %d')as sb_resiger," +
            "(select count(*) from sotongcard where sb_no = ?) as cardnum," +
            "(select count(*) from sb_subscribe where sb_no = ? and sb_s_check = 1) as subscribenum" +
            " from  sotongbox as sb" +
            " where sb_no = ?;"
          connection.query(fourth_sql, [sb_no, sb_no, sb_no], function(err, result) {
            if (err) console.log('상자 생성 후 해당 상자 내부 페이지 이동 시 에러 : ', err);
            else {
              var sql2 = "select sb_s_check as subscribe" +
                " from sb_subscribe" +
                " where sb_no = ? and m_no = (select m_no from member where m_no = ?);"
              connection.query(sql2, [sb_no, m_no], function(err, check) {
                if (err) console.log("구독 체크 에러 : ", err);
                else {
                  if (check == '') {
                    check[0] = {
                      subscribe: 2
                    };
                  }
                  res.render('index', {
                    result: result,
                    check: check,
                    page: './boxInner.ejs',
                    user: req.user,
                    sb_no : sb_no
                  });
                }
              });
              connection.release();
            }
          });
        });
      });
    });
  });

  return router;
}
