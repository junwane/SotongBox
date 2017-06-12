module.exports = function(){
  var time = new Date();
  var y = time.getFullYear();
  var m = time.getMonth()+1;
  if(m<10){
    m = '0'+m;
  }
  var d = time.getDate();
  if(d<10){
    d = '0'+d;
  }
  time = y+m+d;
  var t = time.substring(2, 8);
  
  return t;
}
