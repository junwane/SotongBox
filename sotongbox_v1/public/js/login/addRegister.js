$(document).ready(function(){
  $('#userImage').on('change', function() {

    ext = $(this).val().split('.').pop().toLowerCase(); //확장자

    //배열에 추출한 확장자가 존재하는지 체크
    if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
      resetFormElement($(this)); //폼 초기화
      window.alert('이미지 파일이 아닙니다! (gif, png, jpg, jpeg 만 업로드 가능)');
    } else {
      file = $('#userImage').prop("files")[0];
      blobURL = window.URL.createObjectURL(file);
      $('#image_preview img').attr('src', blobURL);
      $('#image_preview').show(); //업로드한 이미지 미리보기
    }
  });


  $('#image_preview a').bind('click', function() {
    resetFormElement($('#userfile')); //전달한 양식 초기화
    $('#userfile').slideDown(); //파일 양식 보여줌
    $(this).parent().slideUp(); //미리 보기 영역 감춤
    return false; //기본 이벤트 막음
  });


  $("#save").on("click", function(){
    window.opener.name = "parentPage"; //부모창의 이름설정
    document.reg.target = "parentPage"; // 타겟을 부모창으로 설정
    document.reg.action = "/addRegister";
    alert("회원가입 완료!");
    document.reg.submit();
    self.close();
    window.opener.close();
  });

  $("#displayNameVal").on("keyup", function(){
    var displayName = $("#displayNameVal").val();
    var resultDisplayName = $("#resultDisplayName");
    $.ajax({
      url : "http://localhost:3003/displayNameConfirm",
      type : "post",
      dataType : "json",
      data : {displayName:displayName},
      success : function(result){
        if(result > 0){
          var displayName_boolean = new displayNameChecked();
          alert(displayName_boolean.boolean);
          if(displayName_boolean.boolean === false){
            resultDisplayName.html("닉네임을 입력해주세요");
          } else {
            resultDisplayName.html("이미 있는 닉네임 입니다.");
          }

        } else {
          var displayName_boolean = new displayNameChecked();
          if(displayName_boolean.boolean === false){
            resultDisplayName.html("닉네임을 입력해주세요");
          } else {
            resultDisplayName.html("사용 가능합니다");
          }
        }
      }
    });
  });


  function displayNameChecked(){ //닉네임 null 체크
    this.boolean = true;
    var text = $("#displayNameVal").val();
    if(text === ""){ // 스페이스바 치면 안되네?
      this.boolean = false;
    }
    return this.boolean;
  }
});
