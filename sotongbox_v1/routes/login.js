module.exports = function(passport){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var pool = require('../config/mysql/db')();
  var route = require('express').Router();
  var nodemailer = require('nodemailer'); //이메일 인증
  var SMTPServer = require('smtp-server').SMTPServer; //SMTP config
  var https = require('https');
  var auto_incre = require('./auto_incre.js');
  var multer = require('multer');

  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/users/'); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
var upload = multer({ storage: storage });

route.get('/auth/logout', function(req, res){
      req.logout();
      return req.session.save(function(){
        res.redirect('/'); //로그아웃 후 메인으로
    });
  });

  //-----------------------------------------------로컬, SNS 인증 부분 -------------
  route.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var user = {
        s_l_id : 'local:' + req.body.username,
        username : req.body.username,
        password : hash,
        m_sort: salt
      };
      var s_l_id = 'local:' + req.body.username;
      var username = req.body.username;
      var password = hash;
      var m_sort = salt;
      console.log(req.body.passwordConfirm);
      if(req.body.password === req.body.passwordConfirm){
        pool.getConnection(function(err, connection){
        var sql = 'select count(*) as id from member';
        connection.query(sql, function(err, no){
          var id = ""+no[0].id;
          var name = 'm';
          var m_no = auto_incre(id,name);
          console.log(m_no);

            var sql1 = 'insert into member(m_no) values(?)';
            connection.query(sql1, [m_no], function(err, no){
              console.log(no);
            });

            var sql2 = 'insert into s_link(m_no, s_no) values(?, 1)';
            connection.query(sql2, [m_no], function(err, no){
              console.log(no);
            });

            var sql3 = 'UPDATE member SET username = ?, password = ?, m_sort = ?, m_nickname = ?  where m_no = ?';
            connection.query(sql3, [username, password, m_sort, username, m_no], function(err, update2){
              console.log('4' +update2);
            });

            var sql4 = 'UPDATE s_link SET s_l_id = ? where m_no = ?';
            connection.query(sql4, [s_l_id, m_no], function(err, update1){
              console.log('3' +update1);
            });

            var sql5 = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
            connection.query(sql5, [s_l_id], function(err, results){
              if(err){
                console.log(err);
                res.status(500);
                connection.release();
              } else{
                console.log(results);
                connection.release();
                // req.login(user, function(err){
                //    req.session.save(function(){
                //     // res.redirect('/sendEmail');
                //   });
                // });
              }
            }); // close connection
          }); // close pool

        });


      var mailOpts, smtpTrans;

      let transporter = nodemailer.createTransport({
          port : 587,
          host : 'smtp.naver.com',
          service: 'naver',
          auth: {
              user: 'fkam12@naver.com',
              pass: 'zoavn125'
          }
          // ,
          // tls: {
          //     ciphers: 'SSLv3'
          // }
      }); // close transporter


        let mailOptions = {
          from: 'fkam12@naver.com',
          to: req.body.username,
          subject: '[소통박스] 이메일 인증을 클릭하여 회원가입을 완료해주세요!',
          html :"<h1>안녕하세요! "+req.body.username+" 님!</h1>"+"<br>"
          +"<a href='http://localhost:3003/auth/"+ req.body.username + "/"+ rand + "'>인증</a>" +
          "을 해주세요!"
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



      } else {
        res.redirect("/");
      }


    }); // close hasher

  }); // close route

  route.get('/findpass', function(req, res){
    res.render('login/findpass1');
  });

  route.post('/findpass', function(req, res){
    var uname = req.body.username;

    pool.getConnection(function(err, connection){
      var sql = "select username, password from users where username =? ";
      connection.query(sql, [uname], function(err, result){
        if(err){
          console.log(err);
        } else {
            hasher({password:rand}, function(err, pass, salt, hash){
                var passModify = {
                  password : hash,
                  salt: salt
            };
          pool.getConnection(function(err, connection){
            var sql = "update users set ? where username = ?";
            connection.query(sql, [passModify, uname], function(err, result){
              if(err){
                console.log(err);
              } else {
                res.redirect('/');
              }
            });
          });
        });
          if(result[0].username === req.body.username && uname === result[0].username){
            var mailOpts, smtpTrans;

            let transporter = nodemailer.createTransport({
                port : 465,
                host : 'smtp.naver.com',
                service: 'naver',
                auth: {
                    user: 'fkam12@naver.com',
                    pass: 'zoavn125'
                },
                  tls: {
                      ciphers: 'SSLv3'
                  }
            });

              let mailOptions = {
                from: 'fkam12@naver.com',
                to: req.body.username,
                subject: '[소통박스] 임시비밀번호가 발송되었습니다!',
                html :"<h1>안녕하세요! "+req.body.username+" 님!</h1>"+"<br>"
                + "임시비밀번호는 : <h1>"+ rand +"</h1> 입니다!"
              };

              transporter.sendMail(mailOptions, (error, info) => {
                //Email not sent
                if (error) {
                  console.log(error);
                }
                //Email sent
                else {
                  console.log(info);
                }
              });
              connection.release();
          } // end of if
        }  //end of else
      }); //end of connection
    });
  });

  route.get('/auth/reg', function(req, res){
    res.render('login/reg');
  });

  route.get('/auth/register', function(req, res){
    res.render('login/register2');
  });

  route.post(
    '/auth/login',
    passport.authenticate( //패스포트의 미들웨어로 받음
      'local',
      {
        successRedirect: '/', //해당 코드를 주석처리하면 아래의 함수 호출
        failureRedirect: '/aa',
        failureFlash: true

      }
    ));
    route.get(
      '/auth/facebook',
      passport.authenticate(
        'facebook',
        {scope : 'email'}
      )
    );
    route.get(
      '/auth/facebook/callback',
    passport.authenticate(
      'facebook',
      {
        successRedirect: '/',
        failureRedirect: '/'
       }
     )
   );

   route.get(
     '/auth/twitter',
     passport.authenticate(
       'twitter'
     )
   );

   route.get(
     '/auth/twitter/callback',
     passport.authenticate(
       'twitter',
       {
         successRedirect: '/',
         failureRedirect: '/'
       }
     )
   );

   route.get(
     '/auth/google',
    passport.authenticate(
        'google',
        {
          scope: ['profile', 'email']
      }
    )
  );
  route.get(
      '/auth/google/callback',
    passport.authenticate(
      'google',
      {
        failureRedirect: '/',
      }
    ),
    function(req, res) {
     // Successful authentication, redirect home.
     res.redirect('/');
   }
 );

 route.get(
   '/auth/naver',
   passport.authenticate(
     'naver',null
   )
);

 // creates an account if no account of the new user
 route.get(
   '/auth/naver/callback',
 	passport.authenticate(
    'naver',
    {
      failureRedirect: '/'
    }
  ),
  function(req, res) {
     	res.redirect('/');
     }
   );

  route.get('/auth/login', function(req, res){
    res.render('login/login1');
  });

  // email --------------------------------- 인증
  var rand = "^$@"+parseInt(Math.random() * 12345678910)+"_";
  console.log(rand);

  route.get('/auth/:id/:code' , function(req, res){
    var id = req.params.id;
    var code = req.params.code;
    console.log(rand);
    console.log(code);
    console.log(id);


    if(code === rand){
      pool.getConnection(function(err, connection){
        var e_authentication = true;
        console.log(e_authentication);
        var sql = "update member set m_comfirm=? where username=?";
        connection.query(sql, [e_authentication, id], function(err, result){
          if(err) {
          console.log(err);
           res.redirect('/auth/login');
          connection.release();
        }
          else{
            res.redirect('/addRegister');
            connection.release();
          }
        });
      }); // pool of end

    } // end of if

  });

  route.get("/addRegister", function(req, res){
    res.render("login/addPopup");
  });

  route.post("/addRegister", upload.single('userImage'), function(req, res, next){
    var destination = String(req.file.destination+req.file.filename);
    console.log(destination);
    var m_nickname = req.body.displayName;
    var m_gender = req.body.gender;
    var m_img = req.file.filename;
    //이메일로 username?

    pool.getConnection(function(err, connection){
    var sql = 'select count(*) -1 as id from member';
    connection.query(sql, function(err, no){
      var id = ""+no[0].id;
      var name = 'm';
      var m_no = auto_incre(id,name);
      console.log(m_no);

      var sql1 = "update member set m_nickname = ?, m_gender = ?, m_img = ? where m_no = ?";
      connection.query(sql1, [m_nickname,m_gender,m_img, m_no], function(err, result){
        console.log(result);
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          res.redirect('/');
        }
      });
    });
  });

});
  route.get("/auth/addRegister", function(req, res){
    res.render("login/addRegister");
  });


  route.get('/', function(req, res){
    res.render('login/home.ejs' , {user : req.user, page : "./mainPage.ejs"});
  });

  route.get('/reg', function(req, res){
    res.render('login/reg.ejs');
  });

  route.post('/emailConfirm', function(req, res){
    var ajax_email = req.body.email;
    console.log(ajax_email);

    pool.getConnection(function(err, connection){
      var sql = "select count(username) as e_num from member where username=?";
      connection.query(sql, [ajax_email], function(err, result){
        if(err){
          console.log(err);
        } else {
          console.log(result[0].e_num);
          res.json(result[0].e_num);
          connection.release();
        }
        }); //end of connection
      }); //end of pool
  }); //end of route


  route.post('/displayNameConfirm', function(req, res){
    var ajax_displayName = req.body.displayName;
    console.log(ajax_displayName);

    pool.getConnection(function(err, connection){
        var sql = "select count(m_nickname) as d_num from member where m_nickname=?";
        connection.query(sql, [ajax_displayName], function(err, result){
          if(err){
            console.log(err);
          } else {
            console.log(result[0].d_num);
            res.json(result[0].d_num);
            connection.release();
          }
        }); // end of connection
    }); //end of pool
  }); //end of route


// 트위터 계정연결
route.get('/connect/twitter',
  passport.authorize(
    'twitter-authz',
    {
      failureRedirect: '/'
    }
  )
);

route.get('/connect/twitter/callback',
  passport.authorize(
    'twitter-authz',
    {
      failureRedirect: '/'
    }
  ),
  function(req, res) {
    var user = req.user;
    var account = req.account;

    // Associate the Twitter account with the logged-in user.
    account.userId = user.id;

    res.redirect("/"+user.username);

  }
);

// 구글 계정연결
route.get('/connect/google',
  passport.authorize(
    'google-authz',
    {
      scope: ['profile', 'email'],
      failureRedirect: '/'
    }
  )
);

route.get('/connect/google/callback',
  passport.authorize(
    'google-authz',
    {
      failureRedirect: '/'
    }
  ),
  function(req, res) {
    var user = req.user;
    var account = req.account;

    // Associate the Twitter account with the logged-in user.
    account.userId = user.id;

    res.redirect("/"+user.username);

  }
);

// 네이버 계정연결
route.get('/connect/naver',
  passport.authorize(
    'naver-authz',
    {
      failureRedirect: '/'
    }
  )
);

route.get('/connect/naver/callback',
  passport.authorize(
    'naver-authz',
    {
      failureRedirect: '/'
    }
  ),
  function(req, res) {
    var user = req.user;
    var account = req.account;

    // Associate the Twitter account with the logged-in user.
    account.userId = user.id;

    res.redirect("/"+user.username);

  }
);

// 페북 계정연결
route.get('/connect/facebook',
  passport.authorize(
    'facebook-authz',
    {
      failureRedirect: '/'
    }
  )
);

route.get('/connect/facebook/callback',
  passport.authorize(
    'facebook-authz',
    {
      failureRedirect: '/'
    }
  ),
  function(req, res) {
    var user = req.user;
    var account = req.account;

    // Associate the Twitter account with the logged-in user.
    account.userId = user.id;

    res.redirect("/"+user.username);

  }
);

route.get('/:mypage', function(req, res){
  res.render('index', {user: req.user, page : "./mypage.ejs"});
});
  return route;
};
