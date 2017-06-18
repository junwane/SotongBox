module.exports = function(multer,passport,io){
  var auto_incre = require('./auto_incre.js');
  var nowDate = require('./nowDate.js');
  var pool = require('../config/mysql/db')();
  var route = require('express').Router();
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


  route.get('/', function(req, res){
    pool.getConnection(function(err, connection){
      var sql = "select  c_no, "
                        +"c_img, "
                        +"c_state,"
                        +"c_title,"
                        +"c_content,"
                        +"c_money,"
                        +"c_RTcourse,"
                        +"(select m_img from member where m_no = c.m_no) as m_img,"
                        +"(select m_nickname from member where m_no = c.m_no) as m_nickname,"
                        +"(select m_level from member where m_no = c.m_no) as m_level,"
                        +"(select username from member  where m_no = c.m_no) as username"

              +" from class as c"
              +" where c_state = 'before' or (c_state = 'afoot' and m_no = ?)"
              +" group by c_no"
              +" order by c_register desc;"
        connection.query(sql, req.user.m_no , function(err, result){
          if(err){
            console.log(err);
          } else {
            console.log(result);
            res.render('index',{user:req.user, page:'./classPage.ejs', result : result});
          }
          connection.release();
        });
    });

  });

  route.post('/newClass', upload.single('userfile'), function(req, res){
    console.log(req.body);
    var date = nowDate();
    var money = Number(req.body.c_money);

    if (req.file) {
      var c_img = String("/static/images/classImages/" + req.file.filename);
    } else {
      var c_img = req.body.unsplash;
    }

    pool.getConnection(function(err, connection){
      var first_sql = "select count(*) as cnt from class where DATE_FORMAT(c_register, '%y%m%d') = ?";
      connection.query(first_sql, [date], function(err, result) {
        var cnt = "" + result[0].cnt;
        var name = 'c';
        var c_no = auto_incre(cnt, name);

        console.log(c_no);
        var Class_columns = {
          'c_no' : c_no,
          'c_title' : req.body.c_title,
          'c_content' : req.body.c_content,
          'c_money' : money,
          'c_img' : c_img,
          'c_state' : 'before',
          'c_register' : date,
          'c_modify' : date,
          'm_no' : req.user.m_no,
          'cate_no' : req.body.cate_no
        };


        var second_sql = "insert into class set ?";
        connection.query(second_sql, [Class_columns], function(err, results){
          if(err){
            console.log(err);
          } else {
            res.redirect('/class');
          }
        });
        connection.release();
      });
    });


  });

  route.get('/Inner/:id', function(req, res){
    res.render('index',{user:req.user, page:'./classInner.ejs'});
  });

  route.post('/register', function(req, res){


    var mailOpts, smtpTrans;

    let transporter = nodemailer.createTransport({
        port : 587,
        host : 'smtp.naver.com',
        service: 'naver',
        auth: {
            user: 'sotongbox@naver.com',
            pass: 'manager1@#'
        }
    }); // close transporter


      let mailOptions = {
        from: 'sotongbox@naver.com',
        to: 'sotongbox@naver.com',
        subject: '[소통박스] '+req.user.username + '님이 클래스 신청을 하였습니다.',
        html :
        "<h1>안녕하세요! 저는 디렉터 신청을 원하는 "+req.body.name+"입니다!.</h1>"+"<br>"+
        "연락처 : " + req.body.phone + "입니다!." +"<br>" +
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
          setTimeout( function (){
            res.redirect('/');
          }, 3000);
        }


      }); // close transport.sendMail

  });


  return route;
};
