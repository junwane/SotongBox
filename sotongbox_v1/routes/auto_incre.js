module.exports = function(id, name){
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

  var seq = '0000';
  var m_no = name+t;
  if(id.length == 1){
    seq = seq.substring(0,3);
    seq += id;
  }else if(id.length == 2){
    seq = seq.substring(1,3);
    seq += id;
  }else if(id.length == 3){
    seq = seq.substring(2,3);
    seq += id;
  }else if(id.length == 4){
    seq = id;
  }
  m_no = m_no+seq;

  return m_no;
};
