$('#userfile').on('change', function() {

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

function openCard(frm){
    var url = "chat/";
    var title = "chat";
    var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=600, height=280, top=0,left=20";
    window.open("",title,status);
    frm.target = title;
    frm.method = "post";
    frm.action = url;
    frm.submit();
}

$("#userSearch").on("click",function(){
  event.preventDefault();
 var username = document.getElementById("username").value;

  $.ajax({
    url : "http://localhost:4000/chat/usersearch",
    type : "post",
    dataType : "json",
    data : {username:username},
    success : function(result){
      if(result[0].m_nickname==null){
        var a = "일치하는 아이디가 없습니다.";
          $("#resultUser div").remove();
          $("#resultUser").append("<div class='col-xl-12 col-lg-6 col-md-12 col-sm-12 col-xs-12'><div class='ui-block'>"+a+"</div></div>");
      }else{
      var m_nickname = result[0].m_nickname;
      var m_img = result[0].m_img;
      var m_no = result[0].m_no;
      $("#resultUser div").remove();
      $("#resultUser").append("<form name='form'><div class='col-xl-12 col-lg-6 col-md-12 col-sm-12 col-xs-12'>"
                    +"<div class='ui-block'>"
                    +"<div class='birthday-item inline-items'>"
                    +"<div class='author-thumb'>"
                    +"<img src='"+m_img+"' width='50px' height='50px'>"
                    +"</div>"
                    +"<input name='take_m_no' value='"+m_no+"' type='hidden'>"
                    +"<input name='take_m_nickname' value='"+m_nickname+"' type='hidden'>"
                    +"<input name='take_m_img' value='"+m_img+"' type='hidden'>"
                    +"<div class='birthday-author-name'>"
                    +"<a href='#' class='h6 author-name'>"+m_nickname+"</a>"
                    +"<div class='birthday-date'></div>"
                    +"</div>"
                    +"<button type='submit' class='btn btn-sm bg-blue' onClick='javascript:openCard(this.form);''>메세지 보내기</button>"
                    +"</div>"
                    +"</div>"
                    +"</div></form>");
      }
    },
    error : function(err){
      resultEmail.html("에러");
    }
  });


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

$('#keyword').focus(function() {
  $('#keyword').on('keypress', function(event) {
    if (event.keyCode == 32) {
      event.preventDefault();
      var input = document.getElementById("keyword").value;
      var temp = input;
      if (document.getElementById("tag").value == "") {
        var tag = "#" + temp;
      } else {
        var tag = document.getElementById("tag").value + "#" + temp;
      }
      document.getElementById("tag").value = tag;
      document.getElementById("keyword").value = "";
    }

    if (event.keyCode == 45 && document.getElementById("keyword").value == "") {
      event.preventDefault();
      var tag = document.getElementById("tag").value;
      var index1 = tag.lastIndexOf('#');
      var index2 = tag.length;

      var tag2 = tag.substr(index1, index2);
      var result = tag.replace(tag2, '');

      document.getElementById("tag").value = result;
    }
  });
});
