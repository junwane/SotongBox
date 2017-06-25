var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');
var multer = require('multer');

var app = express();
var http = require('http').Server(app);
http.listen('4000');
var io = require('socket.io')(http);

var index = require('./routes/index');
var users = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static',express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'asdfc34$##22',
    resave : false,
    saveUninitialized: true,
    store: new MySQLStore({
      host:'localhost',
      port: 3306,

      user: 'root',
      password: '111111',
      database: 'sotong'
    })
}));
app.use(flash());
// app.use('/', index);
app.use('/users', users);






var passport = require('./config/mysql/passport')(app);
var box = require('./routes/box')(multer,passport,io);
var chat = require('./routes/chat')(passport,io);
var rank = require('./routes/rank')(passport,io);
var card = require('./routes/card')(passport,io);
app.use('/box', box);
app.use('/chat', chat);
app.use('/card', card);
var login = require('./routes/login')(passport,io);
app.use('/', login);
var Class = require('./routes/class')(multer,passport,io);
app.use('/class', Class);
app.use('/rank', rank);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
