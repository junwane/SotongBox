module.exports = function(multer, passport,io) {

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
  var usernickname = '';

  /* GET home page. */
  router.get('/Inner/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
      if (err) console.log("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sb_no = req.params.id;
        var m_no = req.user.m_no;
        var sql = "select sb_open, m_no," +
          "sb_img," +
          "sb_name," +
          "DATE_FORMAT(sb_register, '%Y %m %d')as sb_resiger," +
          "(select count(*) from sotongcard where sb_no = ?) as cardnum," +
          "(select count(*) from sb_subscribe where sb_no = ? and sb_s_check = 1) as subscribenum" +
          " from  sotongbox as sb" +
          " where sb_no = ?;"
        connection.query(sql, [sb_no, sb_no, sb_no], function(err, result) {
          if (err) console.log("해당 소통상자 select 에러 : ", err);
          else {
            var sql2 = "select sb_s_check as subscribe" +
              " from sb_subscribe" +
              " where sb_no = ? and m_no = (select m_no from member where m_no = ?);"
            connection.query(sql2, [sb_no, m_no], function(err, check) {
              if (err) console.log("구독 체크 에러 : ", err);
              else {
                if (check == '') {
                  if (m_no == result[0].m_no) {
                    check[0] = {
                      subscribe: 3
                    };
                  } else {
                    check[0] = {
                      subscribe: 2
                    };
                  }
                }
                var sql3 = "select  sc_no," +
                  "sc_title," +
                  "sc_thumbnail," +
                  "sc_content," +
                  "(select m_img from member where m_no = sc.m_no) as m_img ," +
                  "(select m_nickname from member where m_no = sc.m_no) as m_nickname," +
                  "(select m_level from member where m_no = sc.m_no) as m_level," +
                  "(select count(*) from sc_comment where sc_co_division = 'nice' and sc_no = sc.sc_no) as niceNum," +
                  "(select count(*) from sc_reply where sc_no = sc.sc_no) as replynum" +
                  " from sotongcard sc" +
                  " where sb_no = ?";
                connection.query(sql3, [sb_no], function(err, scresults) {
                  if (err) console.log('해당 상자 카드 리스트 select 에러 : ', err);
                  else{
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
                        result: result,
                        check: check,
                        scresults: scresults,
                        noti_list : noti_list,
                        page: './boxInner.ejs',
                        user: req.user,
                        sb_no: sb_no
                      });
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
    usernickname = req.user.m_nickname;
    pool.getConnection(function(err, connection) {
      if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sql = "select  sb_no, " +
          "sb_img, " +
          "sb_open," +
          "sb_name," +
          "(select m_img from member where m_no = sb.m_no) as m_img," +
          "(select m_nickname from member where m_no = sb.m_no) as m_nickname," +
          "(select m_level from member where m_no = sb.m_no) as m_level," +
          "(select username from member  where m_no = sb.m_no) as username," +
          "(select count(*) from sotongcard where sb_no = sb.sb_no) as cardnum," +
          "(select count(*) from sb_subscribe where sb_no = sb.sb_no and sb_s_check = 1) as subscribenum" +
          " from sotongbox as sb" +
          " where sb_open != '비공개' or (sb_open = '비공개' and m_no = ?)" +
          " group by sb_no" +
          " order by sb_register desc;"
        connection.query(sql, [req.user.m_no], function(err, results) {
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
              results: results,
              noti_list : noti_list,
              page: './box.ejs',
              user: req.user
            });
          });
          connection.release();
        });
      }
    });
  });

  router.post('/choice',  function(req, res, next) {
    var m_no = req.user.m_no;
    var check1 = req.body.check1;
    var check2 = req.body.check2;

    pool.getConnection(function(err, connection) {
      if (err) console.log('커넥션 객체 얻어오기 에러 : ', err);
      else {
        var sql = "select  sb.sb_no as sb_no," +
          "sb.sb_img as sb_img," +
          "sb.sb_open as sb_open," +
          "sb.sb_name as sb_name," +
          "(select m_img from member where m_no = sb.m_no) as m_img," +
          "(select m_nickname from member where m_no = sb.m_no) as m_nickname," +
          "(select m_level from member where m_no = sb.m_no) as m_level," +
          "(select username from member  where m_no = sb.m_no) as username," +
          "(select count(*) from sotongcard where sb_no = sb.sb_no) as cardnum," +
          "(select count(*) from sb_subscribe where sb_no = sb.sb_no and sb_s_check = 1) as subscribenum";

        if (check1 == 'all') {
          sql += " from sotongbox as sb" +
            " where sb_open != '비공개' or (sb_open = '비공개' and m_no = ?)" +
            " group by sb_no";
          if (check2 == 'newest') {
            sql += " order by sb_register desc";
          } else if (check2 == 'popularity') {
            sql += " order by subscribenum desc, cardnum desc";
          }
        } else if (check1 == 'my') {
          sql += " from sotongbox as sb" +
            " where m_no = ?" +
            " group by sb_no";
          if (check2 == 'newest') {
            sql += " order by sb_register desc";
          } else if (check2 == 'popularity') {
            sql += " order by subscribenum desc, cardnum desc";
          }
        } else if (check1 == 'subscribe') {
          sql += " from sotongbox as sb, (select sb_no from sb_subscribe where m_no = ?) as sub_sb"
                +" where sb.sb_no = sub_sb.sb_no"
                +" group by sb.sb_no";
          if (check2 == 'newest') {
            sql += " order by sb.sb_register desc";
          } else if (check2 == 'popularity') {
            sql += " order by subscribenum desc, cardnum desc";
          }
        }

        connection.query(sql, [m_no], function(err, data) {
          if (err) console.log('내 상자 select 에러 : '.err);
          else {
            res.json(data);
          }
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
          res.redirect('./Inner/' + sb_no);
          connection.release();
        });
      });
    });
  });

  router.post('/Inner/subscribe', function(req, res, next) {
    var sb_no = req.body.sb_no;
    var sb_open = req.body.sb_open;
    var m_no = req.user.m_no;

    pool.getConnection(function(err, connection) {
      if (err) console.log("커넥션 객체 얻어오기 에러 : ", err);
      else {
        var sql = ''

        if (sb_open == '전체공개') {
          sql = 'insert into sb_subscribe(m_no, sb_no, sb_s_check) values(?,?,1)';
        } else {
          sql = 'insert into sb_subscribe(m_no, sb_no, sb_s_check) values(?,?,0)';
        }

        connection.query(sql, [m_no, sb_no], function(err, result) {
          if (err) console.log('구독테이블 인설트 에러 : ', err);
          else {
            res.redirect('./' + sb_no);
          }
          connection.release();
        });
      }
    });

  });

  router.post('/subscribe/manager/:sb_no', function(req, res, next){
    var sb_no = req.params.sb_no;
    var check = req.body.check;
    var sb_s_check;

    var sql = "select m.m_no as m_no," +
      "m.username as username,"+
      "m.m_nickname as nickname" +
      " from member as m," +
      "(select m_no " +
      " from sb_subscribe" +
      " where sb_no = ?" +
      " and sb_s_check = ?) as sm" +
      " where m.m_no = sm.m_no";

    if(check == 'subscribeMember'){
      sb_s_check = 1;
    }else{
      sb_s_check = 0;
    }

    pool.getConnection(function(err, connection){
      if(err) console.log('커넥션 객체 얻어오기 에러 : ', err);
      else{
        connection.query(sql, [sb_no,sb_s_check], function(err, data){
          if(err) console.log('구독 관리 에러 : ', err);
          else{
            res.json(data);
          }
          connection.release();
        });
      }
    });
  });

  router.post('/subscribeCut', function(req, res, next){
    var m_no = req.body.m_no;
    var sb_no = req.body.sb_no;

    pool.getConnection(function(err, connection){
      if(err) console.log('커넥션 객처 얻어오기 에러 : ', err);
      else{
        var sql = 'update sb_subscribe set sb_s_check = 4 where m_no = ? and sb_no = ?';

        connection.query(sql, [m_no, sb_no], function(err, data){
          if(err) console.log('구독 차단 에러 : ', err);
          else{
            res.json(data);
          }
          connection.release();
        });
      }
    });
  });

  router.post('/subscribePostulat', function(req, res, next){
    var m_no = req.body.m_no;
    var check = req.body.check;
    var sb_no = req.body.sb_no;

    pool.getConnection(function(err, connection){
      var sql = '';

      if(check == 'consent'){
        sql += 'update sb_subscribe set sb_s_check = 1 where m_no = ? and sb_no = ?';
      }else{
        sql += 'update sb_subscribe set sb_s_check = 4 where\ m_no = ? and sb_no = ?';
      }

      connection.query(sql, [m_no, sb_no], function(err, data){
        if(err) console.log('수락 요청 처리 에러 : ', err);
        else{
          res.json(data);
        }
        connection.release();
      });
    });

  });


  router.post('/newCard', upload.single('userfile'), function(req, res, next) {

    console.log("리퀘스트 바디@@@",req.file);

    var m_no = req.user.m_no;
    var sb_no = req.body.sb_no;
    var sc_title = req.body.cardname;
    var sc_content = req.body.ir1;
    var sc_ti_name = req.body.tag;
    var sb_name = req.body.boxName;
    var ndate = new Date();



    var tagArray = sc_ti_name.split('#');
    tagArray.splice(0, 1);

    if (req.file) {
      var sc_thumbnail = String("/static/images/userUploadImages/" + req.file.filename);
    } else {
      var sc_thumbnail = req.body.unsplash;
    }

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
          if(err) console.log("두번째 쿼리 에러", err);

          for (i = 0; i < tagArray.length; i++) {
            var third_sql = "INSERT INTO sc_taginfo(sc_no,sc_ti_name) VALUES(?,?);";
            connection.query(third_sql, [sc_no, tagArray[i]], function(err, result) {
              if(err) console.log("세번째 쿼리 에러", err);
            });
          }

          var sql3 = "select m_no from sb_subscribe where sb_no = ? and sb_s_check = 1 and m_no != ?";
          connection.query(sql3, [sb_no, m_no], function(err, notiList){
            if(err) console.log('알림 보낼 리스트 select 에러 : ', err);
            else{
              var boxAdmin = "select m_no from sotongbox where sb_no = ?";
              connection.query(boxAdmin, [sb_no], function(err, boxAdmin){
                if(err) console.log('상자 관리자 select 에러 : ', err);
                if(boxAdmin[0].m_no != req.user.m_no){
                  var sql4 = "insert into notice(msg_no, noti_send, noti_accept, noti_date, noti_value1, noti_value2) values(1,?,?,?,?,?)";
                  connection.query(sql4, [m_no, boxAdmin[0].m_no, ndate, sb_name, sc_title], function(err, adminNotiResult){
                    if(err) console.log('상자 관리자 알림 에러 : ', err);
                  });
                }
              });
              for( var i = 0 ; i < notiList.length ; i++){
                var sql5 = "insert into notice(msg_no, noti_send, noti_accept, noti_date, noti_value1, noti_value2) values(1,?,?,?,?,?)";
                connection.query(sql5, [ m_no, notiList[i].m_no, ndate, sb_name, sc_title], function(err, notiResult){
                  if(err) console.log('알림 등록 에러 : ', err);
                });
              }
              res.redirect('./Inner/' + sb_no);
            }
          });
        });
        connection.release();
      });
    });
  });

  var socket_ids = [];

  function registerUser(socket, nickname) {
    if(socket.nickname != undefined) delete socket_ids[socket.nickname];

    socket_ids[nickname] = socket.id
    socket.nickname = nickname;
  }

  io.sockets.on('connection', function(socket){
    registerUser(socket, usernickname);
    console.log("시바알", socket_ids);

    socket.on('serverNewCard', function(data){
      var m_img       = data.m_img;
      var m_nickname  = data.m_nickname;
      var sb_name     = data.sb_name;
      var sc_title    = data.sc_title;
      var time        = nowDate();

      socket.broadcast.emit('clientNewCard', { m_img : m_img, m_nickname : m_nickname, sb_name : sb_name, sc_title : sc_title, time : time });
    });
  });

  router.get('/cardInner/:cardNo', function(req, res, next) {
    var sc_no = req.params.cardNo;

    pool.getConnection(function(err, connection) {
      if (err) console.log('커넥션 객체 얻어오기 에러 : ', err);
      else {
        var sql1 = 'select m.m_img as m_img,' +
          'm.m_nickname as m_nickname,' +
          'sc.sc_no as sc_no,'+
          'DATE_FORMAT(sc.sc_register, "%Y-%m-%d")as sc_register,' +
          'sc.sc_title as sc_title,' +
          'sc.sc_content as sc_content,' +
          'sc.sc_thumbnail as sc_thumbnail,'+
          'co.nicenum as niceNum,' +
          'co.sharenum as shareNum' +
          ' from sotongcard as sc,' +
          ' member as m,' +
          ' (select nice.num as nicenum, share.num as sharenum' +
          ' from (select count(*)-1 as num ' +
          ' from sc_comment ' +
          ' where sc_no = ? and sc_co_division = "nice") as nice, ' +
          '(select count(*)as num ' +
          ' from sc_comment ' +
          ' where sc_no = ? and sc_co_division = "share") as share' +
          ') as co' +
          ' where sc.sc_no = ? and sc.m_no = m.m_no';
        connection.query(sql1, [sc_no, sc_no, sc_no], function(err, scresult) {
          if (err) console.log('해당 카드 select 에러 : ', err);
          else {
            if (scresult[0].niceNum < 0) {
              scresult[0].niceNum = 0;
            }
            var sql2 = "select m.m_nickname as m_nickname, m.m_img as m_img" +
              " from sc_comment as sc_co, member m" +
              " where sc_co_division = 'nice' and sc_no = ?  and sc_co.m_no = m.m_no";
            connection.query(sql2, [sc_no], function(err, nice) {
              if (err) console.log('좋아요 회원 select 에러 : ', err);
              else {
                if (nice == '') {
                  nice[0] = {
                    m_nickname: '',
                    m_img: ''
                  }
                }
                var sql3 = 'select count(*) replyNum from sc_reply where sc_no = ?';
                connection.query(sql3, [sc_no], function(err, replyNum) {
                  if (err) console.log('댓글 수 select 에러 : ', err);
                  else {
                    var sql4 = "select sc_r.sc_r_no as sc_r_no," +
                      "m.m_img as m_img," +
                      "m.m_nickname as m_nickname," +
                      "DATE_FORMAT(sc_r.sc_r_register, '%Y-%m-%d') as sc_r_register," +
                      "sc_r.sc_r_content as sc_r_content," +
                      "(select count(*) from sc_r_comment where sc_r_co_division = 'nice' and sc_r_no = sc_r.sc_r_no) as niceNum" +
                      " from sc_reply as sc_r, member as m" +
                      " where sc_r.sc_no = ? and sc_r.m_no = m.m_no"+
                      " order by sc_r.sc_r_register desc"+
                      " limit 0, 5";
                    connection.query(sql4, [sc_no], function(err, reply) {
                      if (err) console.log('카드 댓글 select 에러 : ', err);
                      else {
                        var sql5 = "select sc_ti_name from sc_taginfo where sc_no = ?";
                        connection.query(sql5, [sc_no], function(err, tag) {
                          if (err) console.log('카드 태그 정보 select 에러 ', err);
                          else {
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
                                scresult: scresult,
                                nice: nice,
                                reply: reply,
                                replyNum: replyNum,
                                tag: tag,
                                noti_list : noti_list,
                                page: './cardInner.ejs',
                                user: req.user
                              });
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
          connection.release();
        });
      }
    });
  });

  router.post('/card/reply', function(req, res, next){
    var m_no = req.body.m_no;
    var sc_no = req.body.sc_no;
    var sc_r_content = req.body.sc_r_content;

    pool.getConnection(function(err, connection){
      if(err) console.log('커넥션 객체 얻어오기 에러 : ', err);
      else{
        var date = nowDate();
        var sql1 = "select count(*) as cnt from sc_reply where DATE_FORMAT(sc_r_register, '%y%m%d') = ?";

        connection.query(sql1, [date], function(err, cnt){
          if(err) console.log('댓글 수 select 에러 : ', err);
          else{
            var cnt = ""+cnt[0].cnt;
            var name= "scr";
            var sc_r_no = auto_incre(cnt,name);
            var date = new Date();
            var sql2 = "insert into sc_reply(sc_r_no,sc_no,m_no,sc_r_content,sc_r_register,sc_r_modify) values(?,?,?,?,?,?)";

            connection.query(sql2, [sc_r_no,sc_no,m_no,sc_r_content,date,date], function(err, result){
              if(err) console.log('댓글 등록 에러 : ', err);
              else{
                var sql3 = "select sc_r.sc_r_no as sc_r_no," +
                  "m.m_img as m_img," +
                  "m.m_nickname as m_nickname," +
                  "DATE_FORMAT(sc_r.sc_r_register, '%Y-%m-%d') as sc_r_register," +
                  "sc_r.sc_r_content as sc_r_content," +
                  "(select count(*) from sc_r_comment where sc_r_co_division = 'nice' and sc_r_no = sc_r.sc_r_no) as niceNum" +
                  " from sc_reply as sc_r, member as m" +
                  " where sc_r.sc_no = ? and sc_r.m_no = m.m_no and sc_r.sc_r_no = ?";

                connection.query(sql3, [sc_no, sc_r_no], function(err, data){
                  if(err) console.log('댓글 등록 정보 select 에러 : ', err);
                  else{
                    res.json(data);
                  }
                });
              }
            });
          }
          connection.release();
        });
      }
    });
  });

  router.post('/card/moreReply', function(req, res, next){
    var sc_no = req.body.sc_no;
    pool.getConnection(function(err, connection){
      if(err) console.log('커넥션 객체 얻어오기 에러 : ', err);
      else{
        var sql = "select sc_r.sc_r_no as sc_r_no," +
                "m.m_img as m_img," +
                "m.m_nickname as m_nickname," +
                "DATE_FORMAT(sc_r.sc_r_register, '%Y-%m-%d') as sc_r_register," +
                "sc_r.sc_r_content as sc_r_content," +
                "(select count(*) from sc_r_comment where sc_r_co_division = 'nice' and sc_r_no = sc_r.sc_r_no) as niceNum" +
                " from sc_reply as sc_r, member as m" +
                " where sc_r.sc_no = ? and sc_r.m_no = m.m_no";

        connection.query(sql, [sc_no], function(err, data){
          if(err) console.log('카드 댓글 더보기 select 에러 : ',err);
          else{
            res.json(data);
          }
          connection.release();
        });
      }
    });
  });

  router.post('/card/comment', function(req, res, next){
    var check = req.body.check;
    var m_no = req.body.m_no;
    var sc_no = req.body.sc_no;

    console.log('check', check);
    console.log('m_no', m_no);
    console.log('sc_no',sc_no);

    pool.getConnection(function(err, connection){
      var sql1 = "insert into sc_comment(sc_no,m_no,sc_co_division) values(?,?,?)";

      connection.query(sql1, [sc_no, m_no, check], function(err, result){
        if(err){
          var data = 'err';
          res.json(data);
          connection.release();
        }
        else{
          var sql2 =  "select m.m_nickname as m_nickname, m.m_img as m_img" +
            " from sc_comment as sc_co, member m" +
            " where sc_co_division = 'nice' and sc_no = ?  and sc_co.m_no = m.m_no";

          connection.query(sql2, [sc_no], function(err, data){
            if(err) console.log('카드 좋아요 select 에러 : ', err);
            else{
              res.json(data);
            }
            connection.release();
          });
        }
      });
    });
  });

  router.post('/card/reply/comment', function(req, res, next){
    var sc_r_no = req.body.sc_r_no;
    var m_no = req.body.m_no;

    pool.getConnection(function(err, connection){
      var sql1 = "insert into sc_r_comment(sc_r_no, m_no, sc_r_co_division) values(?,?,'nice')";

      connection.query(sql1, [sc_r_no, m_no], function(err, result){
        if(err){
          var data = 'err';
          res.json(data)
        }
        else{
          var sql2 = "select count(*) as niceNum from sc_r_comment where sc_r_no = ?";

          connection.query(sql2, [sc_r_no], function(err, data){
            if(err) console.log('카드 댓글 좋아요 수 select 에러 :',err);
            else{
              res.json(data);
            }
          });
        }
        connection.release();
      });
    });
  });


  return router;
}
