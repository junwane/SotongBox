module.exports = function(passport){

  var pool = require('../config/mysql/db')();
  var route = require('express').Router();
  var nodemailer = require('nodemailer'); //이메일 인증
  var SMTPServer = require('smtp-server').SMTPServer; //SMTP config

  route.get('/', function(req, res){
    res.render('index',{user:req.user, page:'./classPage.ejs'});
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
        subject: '[소통박스] '+req.user.username + '님이 클래스 신청이 들어왔습니다.',
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
