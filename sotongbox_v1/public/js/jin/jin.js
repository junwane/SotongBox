$('#userfile').on('change', function() {

  window.alert("실행됨");

  ext = $(this).val().split('.').pop().toLowerCase(); //확장자

  //배열에 추출한 확장자가 존재하는지 체크
  if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
    resetFormElement($(this)); //폼 초기화
    window.alert('이미지 파일이 아닙니다! (gif, png, jpg, jpeg 만 업로드 가능)');
  } else {
    file = $('#userfile').prop("files")[0];
    blobURL = window.URL.createObjectURL(file);
    $('#image_preview img').attr('src', blobURL);
    $('#image_preview').show(); //업로드한 이미지 미리보기
    $('.buttonWrap').hide();
    $(this).hide(); //파일 양식 감춤
  }
});

$('#image_preview a').bind('click', function() {
  resetFormElement($('#userfile')); //전달한 양식 초기화
  $('#userfile').show(); //파일 양식 보여줌
  $('.buttonWrap').show();
  $(this).parent().hide(); //미리 보기 영역 감춤
  return false; //기본 이벤트 막음
});


// 폼요소 초기화
function resetFormElement(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  //리셋하려는 폼양식 요소를 폼(<form>) 으로 감싸고 (wrap()) ,
  //요소를 감싸고 있는 가장 가까운 폼( closest('form')) 에서 Dom요소를 반환받고 ( get(0) ),
  //DOM에서 제공하는 초기화 메서드 reset()을 호출
  e.unwrap(); //감싼 <form> 태그를 제거
}
