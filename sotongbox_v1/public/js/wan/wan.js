$(document).ready(function() {
  $('.boxlistimg').on('click', function() {
    var sb_no = $(this).attr("id");
    location.href = 'box/Inner/' + sb_no;
  });

  $('.parentBox').on('click', '.boxlistimg', function() {
    var sb_no = $(this).attr("id");
    location.href = 'box/Inner/' + sb_no;
  });

  $('.cardlistimg').on('click', function() {
    var sc_no = $(this).attr("id");
    location.href = '../cardInner/' + sc_no;
  });

  $('.maincardlistimg').on('click', function() {
    var sc_no = $(this).attr("id");
    location.href = '/box/cardInner/' + sc_no;
  });

  $('.postulateConsent').on('click', function() {
    var m_no = $(this).attr("id");
    var sb_no = $('#sb_no').val();

  });

  $('.postulateDecline').on('click', function() {
    var m_no = $(this).attr("id");
    var sb_no = $('#sb_no').val();

  });

  $('.boxcheck').change(function() {
    var check1 = $("#boxcategory option:selected").val();
    var check2 = $("#boxlist option:selected").val();

    $.ajax({
      url: '/box/choice',
      type: 'post',
      dataType: 'json',
      data: {
        check1: check1,
        check2: check2
      },
      success: function(data) {
        $('.box').remove();
        var element = "";
        for (var i = 0; i < data.length; i++) {

          element = '<div class="photo-album-item-wrap col-4-width box">' +
            '<div class="photo-album-item" data-mh="album-item">' +
            '<div class="ui-block video-item">' +
            '<div class="video-player boxlistimg" id = ' + data[i].sb_no + ' >' +
            '<img src=' + data[i].sb_img + ' alt="photo">' +
            '</div>'

            +
            '<div class="ui-block-content video-content">' +
            '<a href="box/Inner/' + data[i].sb_no + '" class="h6">' + data[i].sb_name + '</a>' +
            '<ul class="widget w-friend-pages-added notification-list friend-requests">' +
            '<span class="chat-message-item">' + data[i].sb_open + '</span>' +
            '<li class="inline-items">' +
            '<div class="author-thumb">' +
            '<img src="/static/images/users/' + data[i].m_img + '" alt="author" class="avatar" width="40px" height="40px">' +
            '</div>' +
            '<div class="notification-event">' +
            '<a href="/profile/' + data[i].username + '" class="h6 notification-friend">' + data[i].m_nickname + '</a>' +
            '<span class="chat-message-item">레벨' + data[i].m_level + '</span>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '</div>'

            +
            '<div class="ui-block-content video-content">' +
            '<div class="comments-shared">' +
            '<a class="post-add-icon inline-items">' +
            '<i class="fa fa-file-text-o" aria-hidden="true"></i>' +
            '<span>&nbsp;' + data[i].cardnum + '</span>' +
            '</a>'

            +
            '<a class="post-add-icon inline-items">' +
            '<i class="fa fa-smile-o" aria-hidden="true"></i>' +
            '<span>&nbsp;' + data[i].subscribenum + '</span>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
          $(".parentBox").append(element);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  });


});
