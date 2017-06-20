module.exports = function(id, name){
  var nowDate = require('./nowDate.js');

  var t = nowDate();
  var seq = '0000';
  var no = t;
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
  no = no+seq;

  return no;
};
