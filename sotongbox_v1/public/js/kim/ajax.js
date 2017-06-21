$("#commentSubmit").on('click', function(){
  var comment = $("#comment").val();
  var c_no = $("#c_no").val();
  var star = document.getElementsByClassName('faveComment');
  var num = 0; //별 갯수

for(var i=0;i<star.length;i++){
  if(star[i].style.backgroundPosition == '-3519px 0px'){
    num = num + 1;



  } else {
    break;
  }
}

 $.ajax({
   url : "http://localhost:4000/class/Inner/"+c_no+'/courseEvaluation',
   type : "post",
   dataType : "json",
   data : {comment:comment, num:num},
   success : function(result){
     var commentlist = "";
     for(var i=0;i<result.length;i++){
       var starNum = result[i].b_title.substring(1);
      commentlist = '<li>'+
         '<div class="post__author author vcard inline-items">'+
           '<img src="'+result[i].m_img+'" alt="author">'+

           '<div class="author-date">'+
             '<a class="h6 post__author-name fn" href="02-ProfilePage.html">'+result[i].m_nickname+'</a>'+
             '<div class="post__date">'+
               '<time class="published" datetime="2004-07-24T18:18">'+
                 ''+result[i].b_register+''+
               '</time>'+
             '</div>'+
             '<div class="starCheck newStarCheck" data-star='+result[i].b_title.substring(1)+'>'+

             '</div>'+
           '</div>'+
           '<a href="#" class="more"><svg class="olymp-three-dots-icon"><use xlink:href="icons/icons.svg#olymp-three-dots-icon"></use></svg></a>'+
         '</div>'+
         '<p>'+result[i].b_content+'</p>'+
      '</li>';


     }

     var totalCount = result[0].title_count;
     $("#totalCount").html(totalCount); //총 댓글 수

     var starGrade = result[0].starGrade; //총 평점
     $("#starGrade").html(starGrade);


     $('.comments-list').append(commentlist);

     var elements = "";
     for(i=0; i<5; i++) {
       var starOn = "<div class='faveCommentView' style='background-position: -3519px 0px; transition: background 1s steps(55, end);'></div>";
       var starOff = "<div class='faveCommentView'></div>";

       if(i < num) {
         elements += starOn;
       } else {
         elements += starOff;
       }
     }

     $('.newStarCheck').last().append(elements);


     //총 평점 별 구하기
     var element = "";
     var starSize = result[0].starGrade;
     var starGradeOn = "<div class='fave' style='background-position: -3519px 0px; transition: background 1s steps(55, end);'></div>";
     var starGradeOff = "<div class='fave'></div>";

     for(i=0; i<5; i++) {
       if(i < starSize) {
         element += starGradeOn;
       } else {
         element += starGradeOff;
       }
     }
     console.log(element);

     for(i=0; i<5; i++){
       $(".fave").remove();
     }
     $(".star_grade").append(element);



   },
   error : function(error){
     alert("에러");
   }

 });





});
