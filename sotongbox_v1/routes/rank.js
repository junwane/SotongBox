module.exports = function(passport,io){
  var express = require('express');
  var pool = require('../config/mysql/db')();
  var router = express.Router();

  router.post('/day', function(req, res, next){
    var nowDate = req.body.nowDate;
    pool.getConnection(function(err, connection){
      var sql = "select m.m_nickname as m_nickname,"+
                        " m.m_level as m_level,"+
                        "sum(p1.p_point) as point, "+
                        "(select count(*)+1"+
                        " from point as p2 "+
                        " where p2.p_date = ?"+
                        " and p2.p_point > p1.p_point ) Ranking"+
                " from point as p1, member as m"+
                " where p1.p_date = ? and p1.m_no = m.m_no"+
                " group by p1.m_no"+
                " order by Ranking"+
                " limit 0,6";
      connection.query(sql, [nowDate, nowDate], function(err, data){
        res.json(data);
        connection.release();
      });
    });
  });

  router.post('/week', function(req, res, next){
    var nowDate = req.body.nowDate;
    pool.getConnection(function(err, connection){
      var sql = "select m.m_nickname as m_nickname,"+
                       " m.m_level as m_level,"+
                       "p1.wpoint as wpoint,"+
                       "(select count(*)+1"+
                       " from (select m_no, sum(p_point) as wpoint"+
                             " from point"+
                             " where p_date between DATE_FORMAT(DATE_SUB(?, INTERVAL (DAYOFWEEK(?)-1) DAY), '%Y/%m/%d')"+
                                          " and DATE_FORMAT(DATE_SUB(?, INTERVAL (DAYOFWEEK(?)-7) DAY), '%Y/%m/%d')"+
                             " group by m_no) as p2"+
                             " where p2.wpoint > p1.wpoint)Ranking"+
                " from (select m_no, sum(p_point) as wpoint"+
                      " from point"+
                      " where p_date between DATE_FORMAT(DATE_SUB(?, INTERVAL (DAYOFWEEK(?)-1) DAY), '%Y/%m/%d')"+
                                      " and DATE_FORMAT(DATE_SUB(?, INTERVAL (DAYOFWEEK(?)-7) DAY), '%Y/%m/%d')"+
                      " group by m_no) as p1, member as m"+
                " where p1.m_no = m.m_no"+
                " group by p1.m_no"+
                " order by Ranking"+
                " limit 0,6";
      connection.query(sql, [nowDate, nowDate, nowDate, nowDate, nowDate, nowDate, nowDate, nowDate], function(err, data){
        res.json(data);
        connection.release();
      });
    });
  });

  router.post('/month', function(req, res, next){
    var nowDate = req.body.nowDate;
    pool.getConnection(function(err, connection){
      var sql = "select m.m_nickname,"+
                       " m.m_level as m_level,"+
                       "p1.mpoint,"+
                       "(select count(*) + 1"+
                       " from (select m_no, p_date, sum(p_point) as mpoint"+
                              " from point"+
                              " where month(p_date) = month(?)"+
                              " group by m_no) as p2"+
                       " where p2.mpoint > p1.mpoint)Ranking"+
                " from (select m_no, p_date, sum(p_point) as mpoint"+
                      " from point"+
                      " where month(p_date) = month(?)"+
                      " group by m_no) as p1, member as m"+
                " where p1.m_no = m.m_no"+
                " group by p1.m_no"+
                " order by Ranking"+
                " limit 0,6";
      connection.query(sql, [nowDate,nowDate], function(err, data){
        res.json(data);
        connection.release();
      });
    });
  });

  return router;
}
