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

function openCard(frm) {
  var url = "chat/";
  var title = "chat";
  var status = "";
  window.open("", title, ",width=650, height=390, top=0,left=20,resizable=no,toolbar=no,location=no,status=no,directories=no,scrollbars=no,menubar=no");
  frm.target = title;
  frm.method = "post";
  frm.action = url;
  frm.submit();
}


$("#userSearch").on("click", function() {
  event.preventDefault();
  var username = document.getElementById("username").value;

  $.ajax({
    url: "/chat/usersearch",
    type: "post",
    dataType: "json",
    data: {
      username: username
    },
    success: function(result) {
      if (result[0].m_nickname == null) {
        var a = "일치하는 아이디가 없습니다.";
        $("#resultUser div").remove();
        $("#resultUser").append("<div class='col-xl-12 col-lg-6 col-md-12 col-sm-12 col-xs-12'><div class='ui-block'>" + a + "</div></div>");
      } else {
        var m_nickname = result[0].m_nickname;
        var m_img = result[0].m_img;
        var m_no = result[0].m_no;
        $("#resultUser div").remove();
        $("#resultUser").append("<form name='form'><div class='col-xl-12 col-lg-6 col-md-12 col-sm-12 col-xs-12'>" +
          "<div class='ui-block'>" +
          "<div class='birthday-item inline-items'>" +
          "<div class='author-thumb'>" +
          "<img src='" + m_img + "' width='50px' height='50px'>" +
          "</div>" +
          "<input name='take_m_no' value='" + m_no + "' type='hidden'>" +
          "<input name='take_m_nickname' value='" + m_nickname + "' type='hidden'>" +
          "<input name='take_m_img' value='" + m_img + "' type='hidden'>" +
          "<div class='birthday-author-name'>" +
          "<a href='#' class='h6 author-name'>" + m_nickname + "</a>" +
          "<div class='birthday-date'></div>" +
          "</div>" +
          "<button type='submit' class='btn btn-sm bg-blue' onClick='javascript:openCard(this.form);''>메세지 보내기</button>" +
          "</div>" +
          "</div>" +
          "</div></form>");
      }
    },
    error: function(err) {
      resultEmail.html("에러");
    }
  });
});

$('#make_button').on("click", function() {
  $('#uploadForm').show();
});

$("#courseMake").on("click", function() {


  var b_title = document.getElementById("b_title").value;
  var b_me_no = document.getElementById("b_me_no").value;
  var b_content = document.getElementById("b_content").value;
  var b_index = document.getElementById("b_index").value;
  var c_no = document.getElementById("c_no").value;

  $.ajax({
    url: "/class/Inner/" + c_no + "/courseMake",
    type: "post",
    dataType: "json",
    data: {
      b_title: b_title,
      b_me_no: b_me_no,
      b_content: b_content,
      b_index: b_index
    },
    success: function(rows) {

      var index = rows[0].b_index;
      var str_index = index.substr(68, 11);
      rows[0].b_index = str_index;

      $("#List").append("<ul class='kim-notification-list'>" +
        "<li>" +
        "<div style='margin-left:10px'>" +
        "<img src='http://img.youtube.com/vi/" + rows[0].b_index + "/1.jpg'></img>" +
        "</div>" +
        "<div class='notification-event'>" +
        "<a href='#' class='class-js-open-popup' data-popup-target='." + rows[0].b_no + "'>" +
        "<p style='margin-left:20px'>" + rows[0].b_title + "</p>" +
        "</div>" +
        "</li>" +
        "</ul>");
      $('#uploadForm').hide();
      $('body').removeAttr("class", "overlay-enable");
      window.location.reload();
    },
    error: function(err) {
      window.alert("실패");
    }
  });
});


$(".scrollup").on("click", function() {
  $(".mCustomScrollBox").scrollTop($(".mCustomScrollBox")[0].scrollTop);
});


$(".sendReply").on("click", function() {
  event.preventDefault();

  var form = $(this).parent();
  var b_no = form.find("input[name=reply_b_no]").val();
  var m_no = form.find("input[name=reply_m_no]").val();
  var b_r_content = form.find(".b_r_content").val();

  var form2 = $(this).parent().parent();

  var commentList = form2.find("ul[name=commentList]");


  $.ajax({
    url: "/class/Inner/reply",
    type: "post",
    dataType: "json",
    data: {
      b_no: b_no,
      m_no: m_no,
      b_r_content: b_r_content
    },
    success: function(rows) {

      var m_nickname = rows[0].m_nickname;
      var m_img = rows[0].m_img;
      var b_r_content = rows[0].b_r_content;
      var b_r_register = rows[0].b_r_register;



      form2.find("ul[name=commentList]").append("<li>" +
        "<div class='post__author author vcard inline-items'>" +
        "<img src='" + m_img + "' alt='author' class='mCS_img_loaded'>" +
        "<div class='author-date'>" +
        "<a class='h6 post__author-name fn' href='#'>" + m_nickname + "</a>" +
        "<div class='post__date'>" +
        "<time class='published' datetime='2017-03-24T18:18'>" + b_r_register + "</time>" +
        "</div>" +
        "</div>" +
        "<a href='#' class='more'><svg class='olymp-three-dots-icon'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#olymp-three-dots-icon'></use></svg></a>" +
        "</div>" +
        "<p>" + b_r_content + "</p>" +
        "</li>");


      $(".b_r_content").val("");
      $(".mCustomScrollBox").scrollTop($(".mCustomScrollBox")[0].scrollHeight);

    },
    error: function(err) {
      window.alert("실패");
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

$('.cardcheck').change(function() {
  var check1 = $("#cardcategory option:selected").val();
  var check2 = $("#cardlist option:selected").val();

  $.ajax({
    url: "/card/choice",
    type: "post",
    dataType: "json",
    data: {
      check1: check1,
      check2: check2
    },
    success: function(data) {
      $('.ajax_card').remove();
      var element = "";
      for (var i = 0; i < data.length; i++) {

        element = '<div class="col-xl-4 ajax_card">' +
          '<div class="ui-block video-item">' +

          '<div class="video-player maincardlistimg" id = "'+data[i].sc_no+'">' +
          '<img src="'+data[i].sc_thumbnail+'" alt="photo" style="height:260px;">' +
          '</div>' +

          '<div class="ui-block-content2 video-content">' +
          '<a href="/box/cardInner/'+data[i].sc_no+'" class="title author-name fn">'+data[i].sc_title+'</a>' +
          '<time class="published">'+data[i].sc_content+'</time>' +

          '<ul class="widget w-friend-pages-added notification-list friend-requests">' +
          '<li class="inline-items">' +
          '<div class="author-thumb">' +
          '<img src="'+data[i].m_img+'" alt="author" width="40px" height="40px">' +
          '</div>' +
          '<div class="notification-event">' +
          '<a href="#" class="h6 notification-friend">'+data[i].m_nickname+'</a>' +
          '<span class="chat-message-item">레벨'+data[i].m_level+'</span>' +
          '</div>' +
          '</li>' +
          '</ul>' +

          '</div>' +

          '<div class="post-additional-info inline-items">' +

          '<a href="#" class="post-add-icon inline-items">' +
          '<svg class="olymp-add-post-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/static/icons/icons.svg#olymp-like-post-icon"></use></svg>' +

          '<span>'+data[i].niceNum+'</span>' +
          '</a>' +

          '<a href="#" class="post-add-icon inline-items">' +
          '<svg class="olymp-comments-post-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/static/icons/icons.svg#olymp-comments-post-icon"></use></svg>' +

          '<span>'+data[i].replynum+'</span>' +
          '</a>' +

          '</div>' +

          '<div class="control-block-button post-control-button">' +
          '<a href="#" class="btn btn-control">' +
          '<svg class="olymp-like-post-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/static/icons/icons.svg#olymp-like-post-icon"></use></svg>' +
          '<div class="ripple-container"></div>' +
          '</a>' +

          '<a href="#" class="btn btn-control">' +
          '<svg class="olymp-share-icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/static/icons/icons.svg#olymp-share-icon"></use></svg>' +
          '</a>' +

          '</div>' +

          '</div>' +
          '</div>'


        $('.card_parents').after(element);
      }
    },
    error: function(err) {
      window.alert("실패");
    }
  });
});

$('.classcheck').change(function() {
  var check1 = $("#classcategory option:selected").val();
  var check2 = $("#classlist option:selected").val();

  $.ajax({
    url: "/class/Inner/choice",
    type: "post",
    dataType: "json",
    data: {
      check1: check1,
      check2: check2
    },
    success: function(result) {
      $('.ajax_class').remove();
      var element = "";
      for (var i = 0; i < result.length; i++) {

        element = '<div class="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-6 ajax_class">' +
          '<div class="ui-block">' +
          '<div class="friend-item fav-page">' +
          '<div class="friend-header-thumb">' +
          '<a href="/class/Inner/' + result[i].c_no + '"><img src="' + result[i].c_img + '" alt="friend" width="318px" height="122px"></a>' +
          '</div>' +

          '<div class="friend-item-content" style="height:320px;">' +

          '<div class="more">' +
          '<svg class="olymp-three-dots-icon"><use xlink:href="icons/icons.svg#olymp-three-dots-icon"></use></svg>' +
          '<ul class="more-dropdown">' +
          '<li>' +
          '<a href="#">Report Profile</a>' +
          '</li>' +
          '<li>' +
          '<a href="#">Block Profile</a>' +
          '</li>' +
          '<li>' +
          '<a href="#">Turn Off Notifications</a>' +
          '</li>' +
          '</ul>' +
          '</div>' +
          '<div class="friend-avatar">' +
          '<div class="author-thumb">' +
          '<img src="' + result[i].m_img + '" alt="author" width="92px" height="92px">' +
          '</div>' +
          '<div class="author-content">' +
          '<a href="/profile/<%=result[i].username%>" class="h5 author-name">' + result[i].c_title + '</a>' +
          '<div class="country"></div>' +
          '</div>' +
          '</div>' +

          '<div class="swiper-container">' +

          '<div class="swiper-slide">' +
          '<div class="friend-count" data-swiper-parallax="-500">' +
          '<a href="#" class="friend-count-item">' +
          '<div class="h6">' + result[i].coursecount + '</div>' +
          '<div class="title">강의 수</div>' +
          '</a>' +
          '<a href="#" class="friend-count-item">' +
          '<div class="h6">' + result[i].studentcount + '</div>' +
          '<div class="title">수강생 수</div>' +
          '</a>' +
          '<a href="#" class="friend-count-item">' +
          '<div class="h6">' + result[i].replycount + '</div>' +
          '<div class="title">수강평 수</div>' +
          '</a>' +
          '</div>' +

          '<div class="row">' +
          '<div class="col-xl-11 col-lg-6 col-md-6 col-sm-6 col-xs-6">' +

          '</div>' +
          '</div>' +
          '</div>' +

          '<div class="swiper-slide">' +
          '<p class="friend-about" data-swiper-parallax="-500">' +
          '</p>' +
          '</div>'
        if (result[i].star == 0 || result[i].star == null) {
          element = element + '<p class="star_rating" >' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '</p>';
        } else if (result[i].star == 1) {
          element = element + '<p class="star_rating" >' +
            '<a class="on">★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '</p>';
        } else if (result[i].star == 2) {
          element = element + '<p class="star_rating" >' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '</p>';
        } else if (result[i].star == 3) {
          element = element + '<p class="star_rating" >' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a >★</a>' +
            '<a >★</a>' +
            '</p>';
        } else if (result[i].star == 4) {
          element = element + '<p class="star_rating" >' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a >★</a>' +
            '</p>';
        } else if (result[i].star == 5) {
          element = element + '<p class="star_rating" >' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '<a class="on">★</a>' +
            '</p>';
        }
        element = element + '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>';


        $('.class_parents').after(element);


      }

    },
    error: function(err) {
      window.alert("실패");
    }
  });
});
