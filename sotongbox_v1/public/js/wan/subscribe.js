$(document).ready(function(){
  var check = $('#subscribe').val();
  if(check == 1 ){
    $('.stateValue').html('카드 작성하기');
  }else if(check == 0){
    $('.stateValue').html('수락 대기 중');
  }else{
    $('.stateValue').html('상자 구독하기');
  }
});
