module.exports = function(app){
  var pool = require('./db')();
  var auto_incre = require('../../routes/auto_incre.js');
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
    done(null, user.s_l_id); //각 사용자의 식별자로 done함수의 s_l_id를 줌
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

  });
  passport.use(new LocalStrategy({
    usernameField : 'username', //post에서의 username
    passwordField : 'password', //post 에서의 password
    passReqToCallback : true
  }, function(req, username, password, done){
    console.log(username);
    pool.getConnection(function(err, connection){
  var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
  connection.query(sql, ['local:'+username], function(err, results){
    if(err){
      connection.release();

      return done(null, false, req.flash('message', "아이디 혹은 비밀번호가 틀립니다."));
    } else {
      if(results[0] === undefined){
        return done(null, false, req.flash('message', "아이디는 이메일 형식입니다."));
      }
      var user = results[0];
      console.log(user);
      return hasher({password:password, salt:user.m_sort}, function(err, pass, salt, hash){
        console.log(hash);
          if(hash === user.password){
            console.log('LocalStrategy', user);
            connection.release();
            done(null, user);

          }
          else if(user.m_sort === undefined){
            connection.release();
            done(null, false, req.flash('message', "아이디 혹은 비밀번호가 틀립니다."));
          }
          else{
            console.log("false");
            connection.release();
            done(null, false, req.flash('message', "아이디나 비밀번호가 틀립니다."));
          }

          }); // end of hasher
        } //end of else
      }); //end of connection
    }); //end of pool`

  }
));
  passport.use(new TwitterStrategy({
      consumerKey: '3B7AG1uxos0XHOuEgtVDcOBsL',
      consumerSecret: '21GZRLpisDFGT6EZqWWapEzcg2aynAL0XvmDnMIw2yV8gLmVsp',
      callbackURL: "/auth/twitter/callback",
      userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      passReqToCallback : true
  },
  function(req, token, tokenSecret, profile, done) {
    console.log(profile);
    var s_l_id = 'twitter:'+profile.id;
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
          var username = profile.emails[0].value;
          var m_nickname = profile.displayName;

        pool.getConnection(function(err, connection){
          var sql1 = 'select count(*) as id from member';
          connection.query(sql1, function(err, no){
            var id = ""+no[0].id;
            var name = 'm';
            var m_no = auto_incre(id,name);
            console.log(m_no);
            //회원번호 구함

            var addressSQL = "select m_address from member where username = ?";
            connection.query(addressSQL, [username], function(err, address){
              console.log(address);
              if(address.length > 0){
                console.log("현재 이메일있음");
                done(null, false, req.flash('message', "현재 이메일 있음"));
              } else {
                var sql2 = 'insert into member(m_no, username, m_nickname, m_address) values(?,?,?,?)';
                connection.query(sql2, [m_no, username, m_nickname, username], function(err, no){
                  console.log(no);
                });

                var sql3 = 'insert into s_link(m_no, s_no, s_l_id) values(?, 2, ?)';
                //2는 페북
                connection.query(sql3, [m_no, s_l_id], function(err, no){
                  console.log(no);
                });

                var sql6 = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
                connection.query(sql6, [s_l_id], function(err, resutls){
                if(err){
                  console.log(err);
                  done('Error');
                  connection.release();
                } else {
                  done(null, newuser);
                  connection.release();
                }
              });
              }
            });

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
      'name','timezone','updated_time','verified'],
      // 사용자 중에 email이 없다면 해당 SNS사이트에가서 이메일을 인증받아야함
      passReqToCallback : true
    },
    function(req, accessToken, refreshToken, profile, done) {
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
            var username = profile.emails[0].value;
            var m_nickname = profile.displayName;
            var url = profile.profileUrl;
          pool.getConnection(function(err, connection){
            var sql1 = 'select count(*) as id from member';
            connection.query(sql1, function(err, no){
              var id = ""+no[0].id;
              var name = 'm';
              var m_no = auto_incre(id,name);
              console.log(m_no);
              //회원번호 구함

                var addressSQL = "select m_address from member where username = ?";
                connection.query(addressSQL, [username], function(err, address){
                  console.log(address);
                  if(address.length > 0){
                    console.log("현재 이메일있음");
                    done(null, false, req.flash('message', "현재 이메일 있음"));
                  } else {
                    var sql2 = 'insert into member(m_no, username, m_nickname, m_address) values(?,?,?,?)';
                    connection.query(sql2, [m_no, username, m_nickname, url], function(err, no){
                      console.log(no);
                    });

                    var sql3 = 'insert into s_link(m_no, s_no, s_l_id) values(?, 2, ?)';
                    //2는 페북
                    connection.query(sql3, [m_no, s_l_id], function(err, no){
                      console.log(no);
                    });

                    var sql6 = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
                    connection.query(sql6, [s_l_id], function(err, resutls){
                    if(err){
                      console.log(err);
                      done('Error');
                      connection.release();
                    } else {
                      done(null, newuser);
                      connection.release();
                    }
                  });
                  }
                });


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
      callbackURL: "/auth/google/callback",
      passReqToCallback : true
    },
    function(req, accessToken, refreshToken, profile, done) {
      console.log(profile);
      var s_l_id = 'google:'+profile.id;
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
            var username = profile.emails[0].value;
            var m_nickname = profile.displayName;


          pool.getConnection(function(err, connection){
            var sql1 = 'select count(*) as id from member';
            connection.query(sql1, function(err, no){
              var id = ""+no[0].id;
              var name = 'm';
              var m_no = auto_incre(id,name);
              console.log(m_no);
              //회원번호 구함

              var addressSQL = "select m_address from member where username = ?";
              connection.query(addressSQL, [username], function(err, address){
                console.log(address);
                if(address.length > 0){
                  console.log("현재 이메일있음");
                  done(null, false, req.flash('message', "현재 이메일 있음"));
                } else {
                  var sql2 = 'insert into member(m_no, username, m_nickname, m_address) values(?,?,?,?)';
                  connection.query(sql2, [m_no, username, m_nickname, username], function(err, no){
                    console.log(no);
                  });

                  var sql3 = 'insert into s_link(m_no, s_no, s_l_id) values(?, 2, ?)';
                  //2는 페북
                  connection.query(sql3, [m_no, s_l_id], function(err, no){
                    console.log(no);
                  });

                  var sql6 = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
                  connection.query(sql6, [s_l_id], function(err, resutls){
                  if(err){
                    console.log(err);
                    done('Error');
                    connection.release();
                  } else {
                    done(null, newuser);
                    connection.release();
                  }
                });
                }
              });

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
          callbackURL: "/auth/naver/callback",
          passReqToCallback : true
    },
      function(req, accessToken, refreshToken, profile, done) {
        console.log(profile);
        var s_l_id = 'naver:'+profile.id;
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
              var username = profile.emails[0].value;
              var m_nickname = profile.displayName;

            pool.getConnection(function(err, connection){
              var sql1 = 'select count(*) as id from member';
              connection.query(sql1, function(err, no){
                var id = ""+no[0].id;
                var name = 'm';
                var m_no = auto_incre(id,name);
                console.log(m_no);
                //회원번호 구함

                var addressSQL = "select m_address from member where username = ?";
                connection.query(addressSQL, [username], function(err, address){
                  console.log(address);
                  if(address.length > 0){
                    console.log("현재 이메일있음");
                    done(null, false, req.flash('message', "현재 이메일 있음"));
                  } else {
                    var sql2 = 'insert into member(m_no, username, m_nickname, m_address) values(?,?,?,?)';
                    connection.query(sql2, [m_no, username, m_nickname, username], function(err, no){
                      console.log(no);
                    });

                    var sql3 = 'insert into s_link(m_no, s_no, s_l_id) values(?, 2, ?)';
                    //2는 페북
                    connection.query(sql3, [m_no, s_l_id], function(err, no){
                      console.log(no);
                    });

                    var sql6 = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ?';
                    connection.query(sql6, [s_l_id], function(err, resutls){
                    if(err){
                      console.log(err);
                      done('Error');
                      connection.release();
                    } else {
                      done(null, newuser);
                      connection.release();
                    }
                  });
                  }
                });

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
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
    passReqToCallback : true
  },
  function(req, token, tokenSecret, profile, done) {
    var uname = req.user.username;
    var s_l_id = 'twitter:'+profile.id;
    pool.getConnection(function(err, connection){
      var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ? and username = ?';
      connection.query(sql, [s_l_id, uname], function(err, results){
        if(results.length > 0){ //사용자가 존재한다면
          connection.release();
          console.log(results);
          done(null, results[0]);
        } else {
          var sql1 = "select * from member a, s_link b where a.m_no = b.m_no and username = ?";
          connection.query(sql1, [uname], function(err, account){

            var sql2 = "insert into s_link(m_no, s_no, s_l_id, s_l_activity) values(?,3,?,?)";
            connection.query(sql2, [account[0].m_no, s_l_id, 1], function(err, account){
              if(err){
                connection.release();
                return done(err);
              } else {
                connection.release();
                return done(null, account);
              }
            });
          });
        }

      });
    });
  }



));

// 구글 계정연결을 위한 패스포트
passport.use('google-authz', new GoogleStrategy({
  clientID: "777905994972-3a9e6a0j500t5dfurqe17a411i0i34rd.apps.googleusercontent.com",
  clientSecret: "vIbzliejJPAmlDg9MqXC-aBN",
  callbackURL: "/connect/google/callback",
  passReqToCallback : true
},
  function(req, token, tokenSecret, profile, done) {
  var uname = req.user.username;
  var s_l_id = 'google:'+profile.id;
  pool.getConnection(function(err, connection){
    var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ? and username = ?';
    connection.query(sql, [s_l_id, uname], function(err, results){
      if(results.length > 0){ //사용자가 존재한다면
        connection.release();
        console.log(results);
        done(null, results[0]);
      } else {
        var sql1 = "select * from member a, s_link b where a.m_no = b.m_no and username = ?";
        connection.query(sql1, [uname], function(err, account){

          var sql2 = "insert into s_link(m_no, s_no, s_l_id, s_l_activity) values(?,4,?,?)";
          connection.query(sql2, [account[0].m_no, s_l_id, 1], function(err, account){
            if(err){
              connection.release();
              return done(err);
            } else {
              connection.release();
              return done(null, account);
            }
          });
        });
      }

    });
  });
  }
));

// 네이버 계정연결을 위한 패스포트
passport.use('naver-authz', new NaverStrategy({
  clientID: "lNuI9pzW82EtKeXpNxg8",
  clientSecret: "gQ1NGQfwCt",
  callbackURL: "/connect/naver/callback",
  passReqToCallback : true
  },
  function(req, token, tokenSecret, profile, done) {
  var uname = req.user.username;
  var s_l_id = 'naver:'+profile.id;
  pool.getConnection(function(err, connection){
    var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ? and username = ?';
    connection.query(sql, [s_l_id, uname], function(err, results){
      if(results.length > 0){ //사용자가 존재한다면
        connection.release();
        console.log(results);
        done(null, results[0]);
      } else {
        var sql1 = "select * from member a, s_link b where a.m_no = b.m_no and username = ?";
        connection.query(sql1, [uname], function(err, account){

          var sql2 = "insert into s_link(m_no, s_no, s_l_id, s_l_activity) values(?,5,?,?)";
          connection.query(sql2, [account[0].m_no, s_l_id, 1], function(err, account){
            if(err){
              connection.release();
              return done(err);
            } else {
              connection.release();
              return done(null, account);
            }
          });
        });
      }

    });
  });
  }
));

// 페이스북 계정연결을 위한 패스포트
passport.use('facebook-authz', new FacebookStrategy({
  clientID: "1840733199510901",
  clientSecret: "ad245cb56ba5a1e2f7f8e07af2538235",
  callbackURL: "/connect/facebook/callback",
  profileFields:['id','email','displayName','gender','link','locale',
  'name','timezone','updated_time','verified'],
  passReqToCallback : true
  },
  function(req, token, tokenSecret, profile, done) {
  var uname = req.user.username;
  var s_l_id = 'facebook:'+profile.id;
  pool.getConnection(function(err, connection){
    var sql = 'select * from member a, s_link b where a.m_no = b.m_no and s_l_id = ? and username = ?';
    connection.query(sql, [s_l_id, uname], function(err, results){
      if(results.length > 0){ //사용자가 존재한다면
        connection.release();
        console.log(results);
        done(null, results[0]);
      } else {
        var sql1 = "select * from member a, s_link b where a.m_no = b.m_no and username = ?";
        connection.query(sql1, [uname], function(err, account){

          var sql2 = "insert into s_link(m_no, s_no, s_l_id, s_l_activity) values(?,2,?,?)";
          connection.query(sql2, [account[0].m_no, s_l_id, 1], function(err, account){
            if(err){
              connection.release();
              return done(err);
            } else {
              connection.release();
              return done(null, account);
            }
          });
        });
      }

    });
  });
  }
));


  return passport;
};
