$(document).ready(function(){
  var check = $('#subscribe').val();
  if(check == 1 || check == 3){
    $('.stateValue').html('카드 작성하기');
    $('.stateValue').attr('data-popup-target','.make-card');
  }else if(check == 0){
    $('.stateValue').html('수락 대기 중');
    $('.stateValue').unbind('click');
    $('.subscribemember').unbind('click');
    $('.stateValue').click(function(){
      alert("수락 대기 중입니다.");
    });
  }else if(check == 2){
    $('.stateValue').unbind('click');
    $('.subscribemember').unbind('click');
    $('.stateValue').click(function(){
      alert('구독신청이 완료 되었습니다.')
      $('.subscribe').submit();
    });
  }else if(check == 4){
    $('.stateValue').html('구독 정지');
  }

  if(check == 3){
    $('.subscribemem').attr('data-popup-target','.subscribeMemberInfo');
  }else{
    $('.subscribemem').attr('data-popup-target','.subscribeMemberUninfo');
  }

  $('.subscribemem').on('click', function(){
    var check = 'subscribeMember';
    var sb_no = $('#sb_no').val();

    $.ajax({
      url : '/box/subscribe/manager/'+sb_no,
      type : 'post',
      dataType : 'json',
      data : { check : check },
      success : function(data){
        $('.subscribeList').remove();
        var element = '<div class="ui-block subscribeList">';
        for(var i = 0 ; i < data.length ; i++){
          element += "<li><a href = '../../profile/"+ data[i].username+"' class = 'h4 post__author-name fn col-md-8'>"+data[i].nickname+"</a> <a class = 'h4 post__author-name fn subscribeCut' id = '"+data[i].m_no+"'> X </a></li>";
        }
        element += '</div>';
        $('.subscribeMemberInfo').append(element);
      },error : function(err){
        console.log(err);
      }
    });
  });

  $(document).on('click', '.subscribeManagement', function(){
    var check = $(this).attr('id');
    var sb_no = $('#sb_no').val();

    if(check == 'subscribeMember'){
      $.ajax({
        url : '/box/subscribe/manager/'+sb_no,
        type : 'post',
        dataType : 'json',
        data : { check : check },
        success : function(data){
          $('.subscribeList').remove();
          var element = '<div class="ui-block subscribeList">';
          for(var i = 0 ; i < data.length ; i++){
            element += "<li><a href = '../../profile/"+ data[i].username+"' class = 'h4 post__author-name fn col-md-8'>"+data[i].nickname+"</a> <a class = 'h4 post__author-name fn subscribeCut' id = '"+data[i].m_no+"'> X </a></li>";
          }
          element += '</div>';
          $('.subscribeMemberInfo').append(element);
        },error : function(err){
          console.log(err);
        }
      });
    }else{
      $.ajax({
        url : '/box/subscribe/manager/'+sb_no,
        type : 'post',
        dataType : 'json',
        data : { check : check },
        success : function(data){
          $('.subscribeList').remove();
          var element = '<div class="ui-block subscribeList">';
          for(var i = 0 ; i < data.length ; i++){
            element += "<li>"+
                        "<a class = 'h4 post__author-name fn col-md-8'>"+data[i].nickname+"</a>"+
                        "<button class = 'btn btn-secondary postulat' value = 'consent' id = "+data[i].m_no+">수락</button>"+
                        "<button class = 'btn btn-secondary postulat' value = 'decline'  id = "+data[i].m_no+">거절</button>"+
                      "</li>"
          }
          element += '</div>'
          $('.subscribeMemberInfo').append(element);
        },error : function(err){
          console.log(err);
        }
      });
    }
  });

  $(document).on('click', '.subscribeCut', function(){
    var m_cal = $(this);
    var m_no = $(this).attr('id');
    var sb_no = $('#sb_no').val();
    var subscribeNum = $('.subscribeInto').children().last().attr('value');
    subscribeNum -= 1;

    $.ajax({
      url : '/box/subscribeCut',
      type : 'post',
      dataType : 'json',
      data : { m_no : m_no, sb_no : sb_no },
      success : function(data){
        m_cal.parent().remove();
        $('.subscribeInto').children().last().attr('value', subscribeNum);
        $('.subscribeInto').children().last().html(" "+subscribeNum);
      },error : function(err){
        console.log(err);
      }
    });
  });

  $(document).on('click', '.postulat', function(){
    var m_cal = $(this);
    var check = $(this).attr('value');
    var m_no = $(this).attr('id');
    var sb_no = $('#sb_no').val();
    var subscribeNum = $('.subscribeInto').children().last().attr('value');
    if(check == 'consent'){
      subscribeNum ++ ;
    }

    $.ajax({
      url : '/box/subscribePostulat',
      type : 'post',
      dataType : 'json',
      data : { check : check, m_no : m_no, sb_no : sb_no },
      success : function(data){
        m_cal.parent().remove();
        $('.subscribeInto').children().last().attr('value', subscribeNum);
        $('.subscribeInto').children().last().html(" "+subscribeNum);
      },error : function(err){
        console.log(err);
      }
    });
  });

});
