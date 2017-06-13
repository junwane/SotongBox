$(document).ready(function(){
  var check = $('#subscribe').val();
  if(check == 1 ){
    $('.stateValue').html('카드 작성하기');
    $('.stateValue').attr('data-popup-target','.make-card');
  }else if(check == 0){
    $('.stateValue').html('수락 대기 중');
    $('.stateValue').unbind('click');
    $('.stateValue').click(function(){
      alert("수락 대기 중입니다.");
    });
  }else{
    $('.stateValue').unbind('click');
    $('.stateValue').click(function(){
      alert('구독신청이 완료 되었습니다.')
      $('.subscribe').submit();
    });
  }
});
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
