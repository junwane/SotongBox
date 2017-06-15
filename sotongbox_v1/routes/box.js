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
  router.get('/Inner/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
      if (err) console.log("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sb_no = req.params.id;
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
                  var sql3 = "select count(*) as num from sotongbox where sb_no = ? and m_no = ?";
                  connection.query(sql3, [sb_no, m_no], function(err, row){
                    if(err) console.log('상자 개설자 여부 체크 에러 :'+err);
                    else{
                      if(row[0].num == 1){
                        check[0] = {
                          subscribe: 3
                        };
                      }else{
                        check[0] = {
                          subscribe: 2
                        };
                      }
                    }
                  });
                }
                var sql4 = "select  sc_no,"
                                   +"sc_title,"
                                   +"sc_thumbnail,"
                                   +"sc_content,"
                                   +"(select m_img from member where m_no = sc.m_no) as m_img ,"
                                   +"(select m_nickname from member where m_no = sc.m_no) as m_nickname,"
                                   +"(select m_level from member where m_no = sc.m_no) as m_level,"
                                   +"(select count(*) from sc_comment where sc_co_division = 'nice' and sc_no = sc.sc_no) as niceNum,"
                                   +"(select count(*) from sc_reply where sc_no = sc.sc_no) as replynum"
                            +" from sotongcard sc"
                            +" where sb_no = ?";
                connection.query(sql4, [sb_no], function(err, scresults){
                  if(err) console.log('해당 상자 카드 리스트 select 에러 : ',err);
                  else{
                    res.render('index', {
                      result: result,
                      check: check,
                      scresults : scresults,
                      page: './boxInner.ejs',
                      user: req.user,
                      sb_no: sb_no
                    });
                  }
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
                          +"sb_open,"
                          +"sb_name,"
                          +"(select m_img from member where m_no = sb.m_no) as m_img,"
                          +"(select m_nickname from member where m_no = sb.m_no) as m_nickname,"
                          +"(select m_level from member where m_no = sb.m_no) as m_level,"
                          +"(select username from member  where m_no = sb.m_no) as username,"
                          +"(select count(*) from sotongcard where sb_no = sb.sb_no) as cardnum,"
                          +"(select count(*) from sb_subscribe where sb_no = sb.sb_no) as subscribenum"
                +" from sotongbox as sb"
                +" where sb_open != '비공개' or (sb_open = '비공개' and m_no = ?)"
                +" group by sb_no"
                +" order by sb_register desc;"
        connection.query(sql, [req.user.m_no], function(err, results) {
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
            res.redirect('./Inner/'+sb_no);
        });
      });
    });
  });

  router.post('/Inner/subscribe', function(req, res, next){
    var sb_no  = req.body.sb_no;
    var sb_open = req.body.sb_open;
    var m_no = req.user.m_no;

    pool.getConnection(function(err, connection) {
      if(err) console.log("커넥션 객체 얻어오기 에러 : ", err);
      else{
        var sql = ''

        if(sb_open == 'all'){
          sql = 'insert into sb_subscribe(m_no, sb_no, sb_s_check) values(?,?,1)';
        }else{
          sql = 'insert into sb_subscribe(m_no, sb_no, sb_s_check) values(?,?,0)';
        }

        connection.query(sql,[m_no,sb_no], function(err, result){
          if(err) console.log('구독테이블 인설트 에러 : ',err);
          else{
            res.redirect('./'+sb_no);
          }
        });
      }
    });

  });

  router.post('/newCard', function(req, res, next) {
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
          var first_sql = "select count(*) as cnt from sotongcard where DATE_FORMAT(sc_register, '%y%m%d') = ?";
          connection.query(first_sql, [date], function(err, result) {
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
              res.redirect('./Inner/'+sb_no);
            });
          });
        });
      });

    router.get('/cardInner/:cardNo', function(req, res, next){
      var sc_no = req.params.cardNo;

      pool.getConnection(function(err, connection){
        if(err) console.log('커넥션 객체 얻어오기 에러 : ', err);
        else{
          var sql1 = 'select m.m_img as m_img,'
                          +'m.m_nickname as m_nickname,'
                          +'DATE_FORMAT(sc.sc_register, "%Y-%m-%d")as sc_register,'
                          +'sc.sc_title as sc_title,'
                          +'sc.sc_content as sc_content,'
                          +'co.nicenum as niceNum,'
                          +'co.sharenum as shareNum'
                  +' from sotongcard as sc,'
                        +' member as m,'
                        +' (select nice.num as nicenum, share.num as sharenum'
                        +' from (select count(*)-1 as num '
                             +' from sc_comment '
                             +' where sc_no = ? and sc_co_division = "nice") as nice, '
                             +'(select count(*)as num '
                             +' from sc_comment '
                             +' where sc_no = ? and sc_co_division = "share") as share'
                          +') as co'
                  +' where sc.sc_no = ? and sc.m_no = m.m_no';
          connection.query(sql1,[sc_no,sc_no,sc_no], function(err, scresult){
            if(err) console.log('해당 카드 select 에러 : ',err);
            else{
              if(scresult[0].niceNum < 0){
                scresult[0].niceNum = 0;
              }
              var sql2 = "select m.m_nickname as m_nickname, m.m_img as m_img"
                        +" from sc_comment as sc_co, member m"
                        +" where sc_co_division = 'nice' and sc_no = ?  and sc_co.m_no = m.m_no";
              connection.query(sql2, [sc_no], function(err, nice){
                if(err) console.log('좋아요 회원 select 에러 : ', err);
                else{
                  if(nice == ''){
                    nice[0] = {
                      m_nickname : '',
                      m_img : ''
                    }
                  }
                  var sql3 = 'select count(*) replyNum from sc_reply where sc_no = ?';
                  connection.query(sql3,[sc_no],function(err, replyNum){
                    if(err) console.log('댓글 수 select 에러 : ',err);
                    else{
                      var sql4 = "select sc_r.sc_r_no as sc_r_no,"
                                        +"m.m_img as m_img,"
                                        +"m.m_nickname as m_nickname,"
                                        +"DATE_FORMAT(sc_r.sc_r_register, '%Y-%m-%d') as sc_r_register,"
                                        +"sc_r.sc_r_content as sc_r_content,"
                                        +"(select count(*) from sc_r_comment where sc_r_co_division = 'nice' and sc_r_no = sc_r.sc_r_no) as niceNum"
                                +" from sc_reply as sc_r, member as m"
                                +" where sc_r.sc_no = ? and sc_r.m_no = m.m_no";
                      connection.query(sql4, [sc_no], function(err, reply){
                        if(err) console.log('카드 댓글 select 에러 : ',err);
                        else{
                          var sql5 = "select sc_ti_name from sc_taginfo where sc_no = ?";
                          connection.query(sql5, [sc_no], function(err, tag){
                            if(err) console.log('카드 태그 정보 select 에러 ',err);
                            else{
                              res.render('index', {
                                scresult : scresult,
                                nice : nice,
                                reply : reply,
                                replyNum : replyNum,
                                tag : tag,
                                page: './cardInner.ejs',
                                user: req.user
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

  return router;
}
