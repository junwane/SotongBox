$('.boxlistimg').on('click', function(){
  var sb_no = $(this).attr("id");
  location.href='box/Inner/'+sb_no;
});

$('.cardlistimg').on('click', function(){
  var sc_no = $(this).attr("id");
  location.href='../cardInner/'+sc_no;
});
