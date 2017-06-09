module.exports = function(multer, passport) {

  var express = require('express');
  var pool = require('../config/mysql/db')();
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

  function auto_incre(id, name) {
    var time = new Date();
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    if (m < 10) {
      m = '0' + m;
    }
    var d = time.getDate();
    if (d < 10) {
      d = '0' + d;
    }
    time = y + m + d;
    var t = time.substring(2, 8);


    var seq = '0000';
    var a = name + t;
    if (id.length == 1) {
      seq = seq.substring(0, 3);
      seq += id;
    } else if (id.length == 2) {
      seq = seq.substring(1, 3);
      seq += id;
    } else if (id.length == 3) {
      seq = seq.substring(2, 3);
      seq += id;
    } else if (id.length == 4) {
      seq = id;
    }
    var m_no = a + seq;
    return m_no;
  }


  /* GET home page. */
  router.get('/boxInner', function(req, res, next) {
    res.render('index', {
      page: './boxInner.ejs',
      user: req.user
    });
  });
  router.get('/boxInnerTest', function(req, res, next) {
    res.render('index', {
      page: './boxInnerTest.ejs',
      user: req.user
    });
  });
  router.get('/', function(req, res, next) {
    res.render('index', {
      page: './box.ejs',
      user: req.user
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

    console.log("함보자", sb_img);
    pool.getConnection(function(err, connection) {
      if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

      var first_sql = 'select count(*) as sb_no from sotongbox';
      connection.query(first_sql, function(err, result) {
        var sb_no = "" + result[0].sb_no;
        var name = 'sb';
        var sb_no = auto_incre(sb_no, name);
        var datas = [sb_no, cate_no, m_no, sb_name, sb_img, sb_open];

        var second_sql = "INSERT INTO sotongbox(sb_no, cate_no, m_no, sb_name, sb_img, sb_open) VALUES (?,?,?,?,?,?);";
        connection.query(second_sql, [sb_no, cate_no, m_no, sb_name, sb_img, sb_open], function(err, result) {
          console.log("1");
          console.log(result);
          if (err) console.error("상자 만드는 중 에러 발생 err : ", err);

          var third_sql = "select * from sotongbox where sb_no=?";
          connection.query(third_sql, [sb_no], function(err, rows) {
            console.log("이너페이지로 넘기는 값", rows);

            var y = rows[0].sb_register.getFullYear();
            var m = rows[0].sb_register.getMonth()+1;
            if (m < 10) {
              m = '0' + m;
            }
            var d = rows[0].sb_register.getDate();
            if (d < 10) {
              d = '0' + d;
            }
            var day = String(y+' '+m+' '+d);

            res.render('index', {
              page: './boxInner.ejs',
              user: req.user,
              rows: rows[0],
              register : day

            });
            connection.release();
          });
        });
      });
    });
  });
  return router;
}
