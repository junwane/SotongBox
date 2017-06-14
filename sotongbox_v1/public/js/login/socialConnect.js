var s_no;
var check = '0';
$("#facebook").click(function(e){
  s_no = 2;
  if($("#facebook").is(":checked")){
    facebookConnectPopupOpen();
    check = '1';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        // console.log(result.); profile.username를 가져와야함
        // $("#twitterURL").html("https://twitter.com/"+ );
        $("#facebookConnect").html("Faccbook에 연결됨");
        $("#facebookText").addClass("FsocialTEXT");
        $(".FsocialTEXT").css("color","black");
     },
      error : function(err){

      }
    });
  } else {
    check = '0';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        alert("계정연결이 비활성화 되었습니다.");
        $("#FaccbookConnect").html("Faccbook에 연결되지 않음");
        $(".FsocialTEXT").css("color","");
        $("#FaccbookText").removeClass("FsocialTEXT");
     },
      error : function(err){

      }
    });
  }
});

$("#twitter").click(function(e){
  s_no = 3;
  if($("#twitter").is(":checked")){
    twitterConnectPopupOpen();
    check = '1';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        // console.log(result.); profile.username를 가져와야함
        // $("#twitterURL").html("https://twitter.com/"+ );
        $("#twitterConnect").html("Twitter에 연결됨");
        $("#twitterText").addClass("TsocialTEXT");
        $(".TsocialTEXT").css("color","black");
     },
      error : function(err){

      }
    });
  } else {
    check = '0';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        alert("계정연결이 비활성화 되었습니다.");
        $("#twitterConnect").html("Twitter에 연결되지 않음");
        $(".TsocialTEXT").css("color","");
        $("#twitterText").removeClass("TsocialTEXT");
     },
      error : function(err){

      }
    });
  }
});

$("#google").click(function(e){
  s_no = 4;
  if($("#google").is(":checked")){
    googleConnectPopupOpen();
    check = '1';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        // console.log(result.); profile.username를 가져와야함
        // $("#twitterURL").html("https://twitter.com/"+ );
        $("#googleConnect").html("Google에 연결됨");
        $("#googleText").addClass("GsocialTEXT");
        $(".GsocialTEXT").css("color","black");
     },
      error : function(err){

      }
    });
  } else {
    check = '0';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        alert("계정연결이 비활성화 되었습니다.");
        $("#googleConnect").html("Google에 연결되지 않음");
        $(".GsocialTEXT").css("color","");
        $("#googleText").removeClass("GsocialTEXT");
     },
      error : function(err){

      }
    });
  }
});

$("#naver").click(function(e){
  s_no = 5;
  if($("#naver").is(":checked")){
    naverConnectPopupOpen();
    check = '1';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        // console.log(result.); profile.username를 가져와야함
        // $("#twitterURL").html("https://twitter.com/"+ );
        $("#naverConnect").html("Naver에 연결됨");
        $("#naverText").addClass("NsocialTEXT");
        $(".NsocialTEXT").css("color","black");
     },
      error : function(err){

      }
    });
  } else {
    check = '0';
    $.ajax({
      url : "http://localhost:3003/socialConfirmCheck",
      type : "post",
      data : {s_no : s_no, check:check},
      dataType : "json",
      success : function(result){
        alert("계정연결이 비활성화 되었습니다.");
        $("#naverConnect").html("Naver에 연결되지 않음");
        $(".NsocialTEXT").css("color","");
        $("#naverConnect").removeClass("NsocialTEXT");
     },
      error : function(err){

      }
    });
  }
});
