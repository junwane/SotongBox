$(document).ready(function(){
  $('#cardReplyRegister').on('click', function(){
    var m_no = $('#m_no').val();
    var sc_no = $('#sc_no').val();
    var sc_r_content = $('.cardReplyContent').val();
    var replyNum = $('#replyNum').html();
    replyNum++;

    $.ajax({
      url : '/box/card/reply',
      type : 'post',
      dataType : 'json',
      data : { m_no : m_no, sc_no : sc_no, sc_r_content : sc_r_content },
      success : function(data){
        var element =   "<li class = 'cardReplyList'>"+
                          "<div class='post__author author vcard inline-items'>"+
                            "<img src="+ data[0].m_img +" alt='author'>"+
                            "<div class='author-date'>"+
                              "<a class='h6 post_author-name fn' href='#'>"+ data[0].m_nickname +"</a>"+
                              "<div class='post_date'>"+
                                "<time class='published' datetime='2017-06-14T18:00'>"+
                                  ""+ data[0].sc_r_register +""+
                                "</time>"+
                              "</div>"+
                            "</div>"+
                            "<a href='#' class='more'>"+
                              "<svg class='olymp-three-dots-icon'>"+
                                "<use xlink:href='#olymp-three-dots-icon'></use>"+
                              "</svg>"+
                            "</a>"+
                          "</div>"+
                          "<p>"+ data[0].sc_r_content +"</p>"+
                          "<p>"+
                            "<a href='#' class='post-add-icon inline-items'>"+
                              "<svg class='olymp-heart-icon'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='/static/icons/icons.svg#olymp-heart-icon'></use></svg>"+
                              "<span>"+ data[0].niceNum +"</span>"+
                            "</a>"+
                          "</p>"+
                        "</li>";

        $('.comments-list').append(element);
        $('.cardReplyContent').val("");
        $('#replyNum').html(replyNum);
      },error : function(err){
        console.log(err);
      }
    });
  });

  $('.moreReplyList').on('click',function(){
    var showReplyNum = $('#showReplyNum').val();
    var sc_no = $('#sc_no').val();

    showReplyNum = (Number(showReplyNum)+5);

    $.ajax({
      url : '/box/card/moreReply',
      type : 'post',
      dataType : 'json',
      data : { sc_no : sc_no },
      success : function(data){
        if( data.length < showReplyNum){
          showReplyNum = data.length;
        }
        $('.cardReplyList').remove();
        var element = "";
        for(var i = 0 ; i < showReplyNum ; i++){
          element += "<li class = 'cardReplyList'>"+
                      "<div class='post__author author vcard inline-items'>"+
                        "<img src="+ data[data.length-(showReplyNum-i)].m_img +" alt='author'>"+
                        "<div class='author-date'>"+
                          "<a class='h6 post_author-name fn' href='#'>"+ data[data.length-(showReplyNum-i)].m_nickname +"</a>"+
                          "<div class='post_date'>"+
                            "<time class='published' datetime='2017-06-14T18:00'>"+
                              data[data.length-(showReplyNum-i)].sc_r_register +
                            "</time>"+
                          "</div>"+
                        "</div>"+
                        "<a href='#' class='more'>"+
                          "<svg class='olymp-three-dots-icon'>"+
                            "<use xlink:href='#olymp-three-dots-icon'></use>"+
                          "</svg>"+
                        "</a>"+
                      "</div>"+
                      "<p>"+ data[data.length-(showReplyNum-i)].sc_r_content +"</p>"+
                      "<p>"+
                        "<a href='#' class='post-add-icon inline-items'>"+
                          "<svg class='olymp-heart-icon'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='/static/icons/icons.svg#olymp-heart-icon'></use></svg>"+
                          "<span>"+ data[data.length-(showReplyNum-i)].niceNum +"</span>"+
                        "</a>"+
                      "</p>"+
                    "</li>"
        }
        $('#showReplyNum').val(showReplyNum);
        $('.comments-list').append(element);
      },error : function(err){
        console.log(err);
      }
    });
  });

  $('.cardComment').on('click', function(){
    var check = $(this).attr('id');
    var m_no = $('#m_no').val();
    var sc_no = $('#sc_no').val();

    $.ajax({
      url : '/box/card/comment',
      type : 'post',
      dataType : 'json',
      data : { check : check, m_no : m_no, sc_no : sc_no },
      success : function(data){
        if(data == 'err'){
          alert('이미 좋아요한 상태입니다.');
        }else{
          $('.friends-harmonic').remove();
          $('.names-people-likes').remove();

          var element = "<ul class='friends-harmonic'>"

          for(var i = 0 ; i < data.length ; i++){
            if(i == 4) break;
            element += "<img alt = 'a' src="+ data[i].m_img +" class='avatar' width='20px' height='20px'>";
          }
          element += "</ul>"+
                     "<div class='names-people-likes'>"+
                       "<a href='#'>"+
                          data[0].m_nickname +
                       "</a>외 <br>"+
                        (data.length-1) +"명이 좋아함"+
                     "</div>";

          $('.post-additional-info').prepend(element);
        }
      },error : function(err){
        console.log(err);
      }
    });
  });

  $(document).on('click', '.sc_reply', function(){
    var sc_r_no = $(this).attr('id');
    var m_no = $('#m_no').val();

    $.ajax({
      url : '/box/card/reply/comment',
      type : 'post',
      dataType : 'json',
      data : { sc_r_no : sc_r_no, m_no : m_no },
      success : function(data){
        if(data == 'err'){
          alert('이미 좋아요 한 상태입니다.');
        }else{
          $('.sc_r_niceNum').remove();
          var element = "<span class = 'sc_r_niceNum'>"+ data[0].niceNum +"</span>";
          $('.sc_reply').append(element);
         }
      },error : function(err){
        console.log(err);
      }
    });
  });

});
