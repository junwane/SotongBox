var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}))
app.get('/template', function(req, res){
  res.render('temp', {time:Date()});
});
app.get('/', function(req, res){
  res.send('여기는 홈페이지다 슈발');
});
app.get('/form', function(req, res){
  res.render('form');
});
app.post('/form_receiver',function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  res.send(title+','+description);
});
app.get('/form_receiver', function(req, res){
  var title = req.query.title;
  var description = req.query.description;
  res.send(title+','+description);
});
app.get('/topic/:id', function(req, res){
  var topics = [
    '진세은 짱짱 맨',
    '이유진 짱짱 걸',
    '사랑해 ㅎㅎ'
  ];
  var output = `
    <a href='/topic?id=0'>진세은 짱짱 맨</a><br>
    <a href='/topic?id=1'>이유진 짱짱 걸</a><br>
    <a href='/topic?id=2'>사랑해 ㅎㅎ</a><br>
    ${topics[req.params.id]}
  `
  res.send(output);
})
app.get('/topic/:id/:mode', function(req, res){
  res.send(req.params.id+','+req.params.mode)
})

app.get('/dynamic', function(req, res){
  var lis = '';
  for(var i=0; i<5; i++){
    lis = lis + '<li>coding</li>';
  }
  var time = Date();
  var output = `
  <!DOCTYPE html>
  <html>
    <head>
        <meta charset="utf-8">
        <title></title>
    </head>
    <body>
      Hello 유진!
      <ul>
        ${lis}
      </ul>
      ${time}
    </body>
  </html>`
  res.send(output);
});
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">');
});
app.get('/login', function(req, res){
  res.send('로그인 해줭~');
});
app.listen(3000, function(){
  console.log('Conneted 3000 port!!!!!!!!');
});
