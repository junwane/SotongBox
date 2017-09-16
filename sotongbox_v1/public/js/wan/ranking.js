$(document).ready(function(){
  var nowDate = new Date();
  var y = nowDate.getFullYear();
  var m = nowDate.getMonth()+1;
  if(m<10){
    m = '0'+m;
  }
  var d = nowDate.getDate();
  if(d<10){
    d = '0'+d;
  }
  nowDate = y+'-'+m+'-'+d;

  init();

  function init(){
    $.ajax({
      url : '/rank/week',
      type : 'post',
      dataType : 'json',
      data : { nowDate : nowDate },
      success : function(data){
        $('.rankMenu').remove();
        $('.rankList').remove();

        var element_1 = "<div class='more rankMenu'>"+
                          "주간 <i class='fa fa-sort-desc' aria-hidden='true'></i>"+
                        "</div>"
        var element_2 = '';

        for(var i = 0 ; i < data.length ; i++){
          element_2  += "<li class='js-open-popup rankList' >"+
                              "<div class='playlist-thumb'>"+
                                  "<img src="+data[i].m_img+" alt='thumb-composition'>"+
                              "</div>"+
                              "<div class='composition'>"+
                                  "<a href='#' class='composition-name'>"+data[i].m_nickname+"</a>"+
                                  "<a href='#' class='composition-author'>레벨"+data[i].m_level+"</a>"+
                              "</div>"+
                              "<div class='composition-time'>"+
                                  "<i class='fa fa-file-text-o' aria-hidden='true'></i>"+
                                  "<time class='published'>"+data[i].wpoint+"p</time>"+
                              "</div>"+
                          "</li>"
        }

        $('.parentRankMenu').append(element_1);
        $('.m_ranking').append(element_2);
      },error : function(err){
        console.log(err);
      }
    });
  }

  $('#week').on('click', function(){
    $.ajax({
      url : '/rank/week',
      type : 'post',
      dataType : 'json',
      data : { nowDate : nowDate },
      success : function(data){
        console.log(data);
        $('.rankMenu').remove();
        $('.rankList').remove();

        var element_1 = "<div class='more rankMenu'>"+
                          "주간 <i class='fa fa-sort-desc' aria-hidden='true'></i>"+
                        "</div>"
        var element_2 = '';

        for(var i = 0 ; i < data.length ; i++){
          element_2  += "<li class='js-open-popup rankList' >"+
                              "<div class='playlist-thumb'>"+
                                  "<img src="+data[i].m_img+" alt='thumb-composition'>"+
                              "</div>"+
                              "<div class='composition'>"+
                                  "<a href='#' class='composition-name'>"+data[i].m_nickname+"</a>"+
                                  "<a href='#' class='composition-author'>레벨"+data[i].m_level+"</a>"+
                              "</div>"+
                              "<div class='composition-time'>"+
                                  "<i class='fa fa-file-text-o' aria-hidden='true'></i>"+
                                  "<time class='published'>"+data[i].wpoint+"p</time>"+
                              "</div>"+
                          "</li>"
        }

        $('.parentRankMenu').append(element_1);
        $('.m_ranking').append(element_2);

      },error : function(err){
        console.log(err);
      }
    });
  });

  $('#day').on('click', function(){
    $.ajax({
      url : '/rank/day',
      type : 'post',
      dataType : 'json',
      data : { nowDate : nowDate },
      success : function(data){
        console.log(data);
        $('.rankMenu').remove();
        $('.rankList').remove();

        var element_1 = "<div class='more rankMenu'>"+
                          "일간 <i class='fa fa-sort-desc' aria-hidden='true'></i>"+
                        "</div>"
        var element_2 ='';

        for(var i = 0 ; i < data.length ; i++){
          element_2  += "<li class='js-open-popup rankList'>"+
                              "<div class='playlist-thumb'>"+
                                  "<img src="+data[i].m_img+" alt='thumb-composition'>"+
                              "</div>"+
                              "<div class='composition'>"+
                                  "<a href='#' class='composition-name'>"+data[i].m_nickname+"</a>"+
                                  "<a href='#' class='composition-author'>레벨"+data[i].m_level+"</a>"+
                              "</div>"+
                              "<div class='composition-time'>"+
                                  "<i class='fa fa-file-text-o' aria-hidden='true'></i>"+
                                  "<time class='published'>"+data[i].point+"p</time>"+
                              "</div>"+
                          "</li>"
        }

        $('.parentRankMenu').append(element_1);
        $('.m_ranking').append(element_2);
      },error : function(err){
        console.log(err);
      }
    });
  });

  $('#month').on('click', function(){
    $.ajax({
      url : '/rank/month',
      type : 'post',
      dataType : 'json',
      data : { nowDate : nowDate },
      success : function(data){
        $('.rankMenu').remove();
        $('.rankList').remove();

        var element_1 = "<div class='more rankMenu'>"+
                          "월간 <i class='fa fa-sort-desc' aria-hidden='true'></i>"+
                        "</div>"
        var element_2 = '';

        for(var i = 0 ; i < data.length ; i++){
          element_2  += "<li class='js-open-popup rankList' >"+
                              "<div class='playlist-thumb'>"+
                                  "<img src="+data[i].m_img+" alt='thumb-composition'>"+
                              "</div>"+
                              "<div class='composition'>"+
                                  "<a href='#' class='composition-name'>"+data[i].m_nickname+"</a>"+
                                  "<a href='#' class='composition-author'>레벨"+data[i].m_level+"</a>"+
                              "</div>"+
                              "<div class='composition-time'>"+
                                  "<i class='fa fa-file-text-o' aria-hidden='true'></i>"+
                                  "<time class='published'>"+data[i].mpoint+"p</time>"+
                              "</div>"+
                          "</li>"
        }

        $('.parentRankMenu').append(element_1);
        $('.m_ranking').append(element_2);
      },error : function(err){
        console.log(err);
      }
    });
  });

});
