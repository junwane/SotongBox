module.exports = function(app){
  var pool = require('./db')();
  var bkfd2Password = require('pbkdf2-password');
  var passport = require('passport');
  var TwitterStrategy = require('passport-twitter').Strategy;
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var GoogleStrategy = require('passport-google-oauth20').Strategy;
  var NaverStrategy = require('passport-naver').Strategy;
  var hasher = bkfd2Password();

  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.s_l_id); //각 사용자의 식별자로 done함수의 authId를 줌
  }); //username을 세션에 저장
  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    pool.getConnection(function(err, connection){
      var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
      connection.query(sql, [id], function(err, results){
        if(err){
          console.log(err);
          connection.release();
          done('There is no user.');
        } else {
          connection.release();
          done(null, results[0]);
        }
      });
    });


    // for(var i=0; i< users.length; i++){
    //   var user = users[i];
    //   if(user.authId === id){
    //      done(null, user);
    //   }
    // }
    // done('There is no user');
  });
  passport.use(new LocalStrategy(
    function(username, password, done){
      var uname = username; //post에서의 username
      var pwd = password; //post 에서의 password
      pool.getConnection(function(err, connection){
        var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
        connection.query(sql, ['local:'+uname], function(err, results){
          if(err){
            connection.release();

            return done('There is no user.');
          } else {
            var user = results[0];
            console.log(user);
            return hasher({password:pwd, salt:user.m_sort}, function(err, pass, salt, hash){
              console.log(hash);
                if(hash == user.password){
                  console.log('LocalStrategy', user);
                  connection.release();
                  done(null, user);
                  //done() 로그인 절차가 끝났을 때
                  // req.session.displayName = user.displayName;
                  // req.session.save(function(){
                  //   res.redirect('/welcome');
                  // });

                } else{
                  console.log("false");
                  connection.release();
                  done(null, false);
                }


            }); // end of hasher
          } //end of else
        }); //end of connection
      }); //end of pool`


      // for(var i=0; i< users.length; i++){
      //   var user = users[i];
      //   if(uname === user.username){
      //   return  hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
      //       if(hash === user.password){
      //         console.log('LocalStrategy', user);
      //         done(null, user); //done() 로그인 절차가 끝났을 때
      //         // req.session.displayName = user.displayName;
      //         // req.session.save(function(){
      //         //   res.redirect('/welcome');
      //         // });
      //       } else{
      //         done(null, false);
      //       }
      //     });
      //   }
      //   // if(uname === user.username && md5(pwd+salt) === user.password){ //입력한 값이 맞다면
      //   //   req.session.displayName = user.displayName; //user 객체의 닉네임을 세션에 저장
      //   //   return req.session.save(function(){
      //   //     res.redirect('/welcome');
      //   //   });
      //   // }
      // }
      // done(null, false); //for문의 맞는 사용자가 없을 때
    }// end of LocalStrategy function
  )); // end of LocalStrategy
  passport.use(new TwitterStrategy({
      consumerKey: '3B7AG1uxos0XHOuEgtVDcOBsL',
      consumerSecret: '21GZRLpisDFGT6EZqWWapEzcg2aynAL0XvmDnMIw2yV8gLmVsp',
      callbackURL: "/auth/twitter/callback",
      userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"//트위터에서 이메일 받는 법 와씌바 존나어렵네
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    var authId = 'twitter:'+profile.id;
    pool.getConnection(function(err, connection){
      var sql = 'select * from users where authId=?';
      connection.query(sql, [authId], function(err, results){
        if(results.length > 0){ //사용자가 존재한다면
          connection.release();
          done(null, results[0]);
        } else {
          var newuser = {
            'authId':authId,
            'username':profile.emails[0].value,
            'displayName':profile.displayName
          };
        pool.getConnection(function(err, connection){
          var sql = 'insert into users set ?';
          connection.query(sql, newuser, function(err, resutls){
            if(err){
              console.log(err);
              done('Error');
              connection.release();
            } else {
              done(null, newuser);
              connection.release();
            }
          });
        });
      }
      });
    });

  }
  ));
  passport.use(new FacebookStrategy({
      clientID: '1840733199510901',
      clientSecret: 'ad245cb56ba5a1e2f7f8e07af2538235',
      callbackURL: "/auth/facebook/callback",
      profileFields:['id','email','displayName','gender','link','locale',
      'name','timezone','updated_time','verified']
      // 사용자 중에 email이 없다면 해당 SNS사이트에가서 이메일을 인증받아야함
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var s_l_id = 'facebook:'+profile.id;
      pool.getConnection(function(err, connection){
        var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
        connection.query(sql, [s_l_id], function(err, results){
          if(results.length > 0){ //사용자가 존재한다면
            connection.release();
            done(null, results[0]);
          } else {
            var newuser = {
              's_l_id':s_l_id,
              'username': profile.emails[0].value,
              'm_nickname':profile.displayName
            };
          pool.getConnection(function(err, connection){
            var sql = 'insert into users set ?';
            connection.query(sql, newuser, function(err, resutls){
              if(err){
                console.log(err);
                done('Error');
                connection.release();
              } else {
                done(null, newuser);
                connection.release();
              }
            });
          });
        }
        });
      });
    }
  ));
  passport.use(new GoogleStrategy({
      clientID: '777905994972-3a9e6a0j500t5dfurqe17a411i0i34rd.apps.googleusercontent.com',
      clientSecret: 'vIbzliejJPAmlDg9MqXC-aBN',
      callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'google:'+profile.id;
      pool.getConnection(function(err, connection){
        var sql = 'select * from users where authId=?';
        connection.query(sql, [authId], function(err, results){
          if(results.length > 0){ //사용자가 존재한다면
            connection.release();
            done(null, results[0]);
          } else {
            var newuser = {
              'authId':authId,
              'username':profile.emails[0].value,
              'displayName':profile.displayName
            };
          pool.getConnection(function(err, connection){
            var sql = 'insert into users set ?';
            connection.query(sql, newuser, function(err, resutls){
              if(err){
                console.log(err);
                done('Error');
                connection.release();
              } else {
                done(null, newuser);
                connection.release();
              }
            });
          });
        }
        });
      });

    }
  ));

  //NaverStrategy
  passport.use(new NaverStrategy({
          clientID: 'lNuI9pzW82EtKeXpNxg8',
          clientSecret: 'gQ1NGQfwCt',
          callbackURL: "/auth/naver/callback"
    },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);

        var authId = 'naver:'+profile.id;
        pool.getConnection(function(err, connection){
          var sql = 'select * from users where authId=?';
          connection.query(sql, [authId], function(err, results){
            if(results.length > 0){ //사용자가 존재한다면
              connection.release();
              done(null, results[0]);
            } else {
              var newuser = {
                'authId':authId,
                'username':profile.emails[0].value,
                'displayName':profile.displayName
              };
            pool.getConnection(function(err, connection){
              var sql = 'insert into users set ?';
              connection.query(sql, newuser, function(err, resutls){
                if(err){
                  console.log(err);
                  done('Error');
                  connection.release();
                } else {
                  done(null, newuser);
                  connection.release();

                }
              });
            });
          }
          });
        });
      }
  ));

  // 트위터 계정연결 위한 패스포트
  passport.use('twitter-authz', new TwitterStrategy({
    consumerKey: "3B7AG1uxos0XHOuEgtVDcOBsL",
    consumerSecret: "21GZRLpisDFGT6EZqWWapEzcg2aynAL0XvmDnMIw2yV8gLmVsp",
    callbackURL: "/connect/twitter/callback",
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
  function(token, tokenSecret, profile, done) {
    var authId = 'twitter:'+profile.id;
    console.log(profile);
    console.log(done);
    pool.getConnection(function(err, connection){
      var sql = "select * from users where authId = ?";
      connection.query(sql, [authId], function(err, account){
          if (err) {
            connection.release();
            return done(err);
          }
          if (account) {
            connection.release();
            return done(null, account);
          }
      });
      // var account = new Account();
      // console.log(account);
      // account.domain = 'twitter.com';
      // account.uid = profile.id;
      // var t = { kind: 'oauth', token: token, attributes: { tokenSecret: tokenSecret } };
      // account.tokens.push(t);
      // return done(null, account);
    });




  }
));

// 구글 계정연결을 위한 패스포트
passport.use('google-authz', new GoogleStrategy({
  clientID: "777905994972-3a9e6a0j500t5dfurqe17a411i0i34rd.apps.googleusercontent.com",
  clientSecret: "vIbzliejJPAmlDg9MqXC-aBN",
  callbackURL: "/connect/google/callback"
},
function(token, tokenSecret, profile, done) {
  var authId = 'google:'+profile.id;
  console.log(profile);
  console.log(done);
  pool.getConnection(function(err, connection){
    var sql = "select * from users where authId = ?";
    connection.query(sql, [authId], function(err, account){
        if (err) {
          connection.release();
          return done(err);
        }
        if (account) {
          connection.release();
          return done(null, account);
        }
    });
    // var account = new Account();
    // console.log(account);
    // account.domain = 'twitter.com';
    // account.uid = profile.id;
    // var t = { kind: 'oauth', token: token, attributes: { tokenSecret: tokenSecret } };
    // account.tokens.push(t);
    // return done(null, account);
  });




}
));

// 네이버 계정연결을 위한 패스포트
passport.use('naver-authz', new NaverStrategy({
  clientID: "lNuI9pzW82EtKeXpNxg8",
  clientSecret: "gQ1NGQfwCt",
  callbackURL: "/connect/naver/callback"
},
function(token, tokenSecret, profile, done) {
  var authId = 'naver:'+profile.id;
  console.log(profile);
  console.log(done);
  pool.getConnection(function(err, connection){
    var sql = "select * from users where authId = ?";
    connection.query(sql, [authId], function(err, account){
        if (err) {
          connection.release();
          return done(err);
        }
        if (account) {
          connection.release();
          return done(null, account);
        }
    });
    // var account = new Account();
    // console.log(account);
    // account.domain = 'twitter.com';
    // account.uid = profile.id;
    // var t = { kind: 'oauth', token: token, attributes: { tokenSecret: tokenSecret } };
    // account.tokens.push(t);
    // return done(null, account);
  });




}
));

// 페이스북 계정연결을 위한 패스포트
passport.use('facebook-authz', new FacebookStrategy({
  clientID: "1840733199510901",
  clientSecret: "ad245cb56ba5a1e2f7f8e07af2538235",
  callbackURL: "/connect/facebook/callback",
  profileFields:['id','email','displayName','gender','link','locale',
  'name','timezone','updated_time','verified']
},
function(token, tokenSecret, profile, done) {
  var authId = 'facebook:'+profile.id;
  console.log(profile);
  console.log(done);
  pool.getConnection(function(err, connection){
    var sql = "select * from users where authId = ?";
    connection.query(sql, [authId], function(err, account){
        if (err) {
          connection.release();
          return done(err);
        }
        if (account) {
          connection.release();
          return done(null, account);
        }
    });
    // var account = new Account();
    // console.log(account);
    // account.domain = 'twitter.com';
    // account.uid = profile.id;
    // var t = { kind: 'oauth', token: token, attributes: { tokenSecret: tokenSecret } };
    // account.tokens.push(t);
    // return done(null, account);
  });

}
));


  return passport;
};
