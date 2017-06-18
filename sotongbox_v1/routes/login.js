module.exports = function(passport,io){
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

            var sql1 = 'insert into member(m_no, username, password, m_sort, m_nickname, m_address) values(?,?,?,?,?,?)';
            connection.query(sql1, [m_no, username, password, m_sort, username, username], function(err, no){
              console.log(no);
            });

            var sql2 = 'insert into s_link(m_no, s_no, s_l_id) values(?, 1, ?)';
            connection.query(sql2, [m_no, s_l_id], function(err, no){
              console.log(no);
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
              user: 'sotongbox@naver.com',
              pass: 'manager1@#'
          }
      }); // close transporter


        let mailOptions = {
          from: 'sotongbox@naver.com',
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


  //비밀번호 찾기
  var randPass;
  route.post('/findpass', function(req, res){
    randPass = parseInt(Math.random() * 1000000)+"";
    console.log(randPass);

    var uname = req.body.username;

      if(uname){
        var mailOpts, smtpTrans;

      let transporter = nodemailer.createTransport({
          port : 587,
          host : 'smtp.naver.com',
          service: 'naver',
          auth: {
              user: 'sotongbox@naver.com',
              pass: 'manager1@#'
          },
            tls: {
                ciphers: 'SSLv3'
            }
      });

        let mailOptions = {
          from: 'sotongbox@naver.com',
          to: req.body.username,
          subject: '[소통박스] 임시비밀번호가 발송되었습니다!',
          html :"<h1>안녕하세요! "+req.body.username+" 님!</h1>"+"<br>"
          + "임시비밀번호는 : <h1>"+ randPass +"</h1> 입니다!" +"<br>"
          + "<a href='http://localhost:3003/pass/"+req.body.username+"'>임시 비밀번호로 수정</a>"

        };

        //"<a href='http://localhost:3003/auth/"+ req.body.username + "/"+ rand + "'>인증</a>"

        transporter.sendMail(mailOptions, (error, info) => {
          //Email not sent
          if (error) {
            console.log(error);
          }
          //Email sent
          else {
            console.log(info);
            transporter.close();
            setTimeout(function (){
              res.redirect('/');
            }, 1000);
          }
        });

      } else {
        res.redirect('/');
      }
  });

  route.get("/pass/:uname", function(req, res){
    var uname = req.params.uname;

    pool.getConnection(function(err, connection){
      var sql = "select username, password from member where username =? ";
      connection.query(sql, [uname], function(err, result){
        if(err){
          console.log(err);
        } else {
            hasher({password:randPass}, function(err, pass, salt, hash){
              var passModify = hash;
              var m_sort = salt;
            var sql1 = "update member set password=?, m_sort=? where username = ?";
            connection.query(sql1, [passModify, m_sort, uname], function(err, pass){
              if(err){
                console.log(err);
              } else {
                res.render("login/passAlert");
              }
              connection.release();
            });
        });


        }  //end of else
      }); //end of connection
    }); // end of pool
  });

  // 비밀번호 찾기

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
        failureRedirect: '/',
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
        var sql1 = "select m_no, username from member where username = ?";
        connection.query(sql1, [id], function(err, no){
          console.log(no);
          var sql = "update member set m_comfirm=? where username=?";
          connection.query(sql, [e_authentication, id], function(err, result){
            if(err) {
            console.log(err);
             res.redirect('/auth/login');
            connection.release();
          }
            else{

              res.redirect('/addRegister/'+id);
              connection.release();
            }
          });
        });

      }); // pool of end

    } // end of if

  });

  //회원가입 팝업
  route.get("/addRegister/:id", function(req, res){
    var id = req.params.id;
    res.render("login/addPopup", {id:id});
  });

  //회원가입 양식
  route.get("/auth/addRegister", function(req, res){
    res.render("login/addRegister");
  });

  route.post("/addRegister", upload.single('userImage'), function(req, res, next){
    var destination = String(req.file.destination+req.file.filename);
    console.log(destination);
    console.log(req.body);
    var m_nickname = req.body.displayName;
    var m_gender = req.body.gender;
    var m_img = req.file.filename;
    var username = req.body.username;
    //이메일로 username?

    pool.getConnection(function(err, connection){
      var sql = "update member set m_nickname = ?, m_gender = ?, m_img = ? where username = ?";
      connection.query(sql, [m_nickname,m_gender,m_img, username], function(err, result){
        console.log(result);
        if(err) {
          console.log(err);
        } else {
          console.log(result);
          res.render("login/addRegisterClose");
        }
      });
    });

  });




  route.get('/', function(req, res){

    if(req.user){
      global.username = req.user.username;
      global.usernickname = req.user.m_nickname;
    }

    res.render('login/home.ejs' , {user : req.user, page : "./mainPage.ejs", message : req.flash('message')});
  });

  io.on('connection', function(socket) {

  console.log('유저 소켓 연결: ', global.usernickname);
  socket.on('disconnect', function() {
    console.log('유저 소켓 연결 해제: ', global.usernickname);
  });
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



//계정연결 팝업 닫기
route.get('/socialAlert', function(req, res){
  res.render("login/socialAlert");
});

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

    res.redirect("/socialAlert");

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

    res.redirect("/socialAlert");

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

    res.redirect("/socialAlert");

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

    res.redirect("/socialAlert");

  }
);


// 마이페이지
route.get('/profile/:mypage', function(req, res){
  pool.getConnection(function(err, connection){
    if(err) console.log("커넥션 객체 얻어오기 에러 : ",err);
    else{
      var username = req.params.mypage;
      var sql = "select m_no, m_img, m_nickname, username, m_introduce, m_langage, m_nation, m_gender"
                +" from member"
                +" where username = ?";
      connection.query(sql, [username], function(err, result){

        if(err) console.log("해당 사용자 프로필 select 에러 : ", err);
        else{
            res.render('index', {user: req.user, page : "./mypage.ejs", result : result[0]} );
        }
      });
    }
  });
});

//마이페이지 비밀번호 변경
route.post('/passModify', function(req, res){
  var pass = req.body.password;
  var passConfirm = req.body.passwordConfirm;
  var username = req.user.username;
  if(pass === passConfirm){
    pool.getConnection(function(err, connection){
      var sql = "select username, password from member where username =? ";
      connection.query(sql, [username], function(err, result){
        if(err){
          console.log(err);
        } else {
            hasher({password:pass}, function(err, pass, salt, hash){
              var passModify = hash;
              var m_sort = salt;
            var sql1 = "update member set password=?, m_sort=? where username = ?";
            connection.query(sql1, [passModify, m_sort, username], function(err, pass){
              if(err){
                console.log(err);
              } else {
                req.logout();
                return req.session.save(function(){
                  res.redirect('/'); //로그아웃 후 메인으로
                });
              }
              connection.release();
            });
        });


        }  //end of else
      }); //end of connection
    }); // end of pool
  }
});

//마이페이지에서 계정연결 체크
//소셜 연결 체크
route.post('/socialConfirmCheck', function(req, res){
  var username = req.user.username;
  var ajax_no = req.body.s_no;
  var ajax_check = req.body.check;
  console.log("클라 체크"+ajax_check);
  console.log(username);
  console.log("클라 데이터"+ajax_no);

  pool.getConnection(function(err, connection){
    var sql1 = "select a.m_no from member a, s_link b where a.m_no = b.m_no and username = ?";
    connection.query(sql1, [username], function(err, a){
      var m_no = a[0].m_no;
      var sql2 = "insert into s_link(m_no) values(?)";
      connection.query(sql2, [m_no], function(err, b){
        if(err){
          console.log(err);
        } else {
          console.log(b);
        }

    var sql = "select a.m_no, b.s_no, b.s_l_activity from member a, s_link b where a.m_no = b.m_no and username = ? and s_no = ?";
    connection.query(sql, [username, ajax_no], function(err, result){

    if(ajax_check === "0"){
      var sql3 = "update s_link set s_l_activity = 0 where s_no = ? and m_no = ?";
      connection.query(sql3, [ajax_no, m_no], function(err, update){
        if(err){
          console.log(err);
        } else {
          console.log(update);
          res.json(update);
        }


      });
    } else {
      var sql4 = "update s_link set s_l_activity = 1 where s_no = ? and m_no = ?";
      connection.query(sql4, [ajax_no, m_no], function(err, update){

        var sql5 = "select * from s_link where s_no = ? and m_no = ?";
        connection.query(sql5, [ajax_no, m_no], function(err, results){
          if(err){
            console.log(err);
          } else {
            res.json(update);
          }
        });
      });
    }
      connection.release();
    });
  });
    });
  });
});


//마이프로필 변경
route.post('/myProfile', function(req, res) {
  var m_nickname = req.body.m_nickname;
  var m_introduce = req.body.m_introduce;
  var m_language = req.body.m_language;
  var m_nation = req.body.m_nation;
  var m_no = req.body.m_no;
  var Otherm_no = req.body.result_m_no;
  var username = req.body.username;
  console.log(req.body);

  if(m_no === Otherm_no){
    pool.getConnection(function(err, connection){
      var sql = "update member set m_nickname = ?, m_introduce = ? , m_langage = ? , m_nation = ? where m_no = ?";
      connection.query(sql, [m_nickname, m_introduce, m_language, m_nation, m_no], function(err, result){
        if(err){
          console.log(err);
        } else {
          console.log(result);
          res.redirect('/profile/'+ username);
        }
        connection.release();
      });
    });
  } else {
    res.render('login/mypageUpdateError');
  }


});

  return route;
};
