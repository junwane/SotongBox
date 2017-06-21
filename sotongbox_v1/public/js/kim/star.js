var fave1 = document.getElementsByClassName('faveComment');

function faves(star) {
  for (i = 0; i <= star; i++) {
    fave1[i].style.backgroundPosition = ' -3519px 0';
    fave1[i].style.transition = 'background 1s steps(55)';
  }
}

function offfaves(star) {
  for (i = 0; i <= star; i++) {
    fave1[i].style.backgroundPosition = '';
    fave1[i].style.transition = '';
  }
}

function stay() {
  for (i = 0; i <= fave1.length; i++) {
    fave1[i].setAttribute('onmouseover', ' ');
    fave1[i].setAttribute('onmouseout', ' ');
  }
}



var starOn = "<div class='faveCommentView' style='background-position: -3519px 0px; transition: background 1s steps(55, end);'></div>";
var starOff = "<div class='faveCommentView'></div>";

var starGradeOn = "<div class='fave' style='background-position: -3519px 0px; transition: background 1s steps(55, end);'></div>";
var starGradeOff = "<div class='fave'></div>";


$('.starCheck').each(function(){
        var elements = "";
        var starSize = parseInt($(this).attr("data-star"));
        for(var i=0; i<5; i++) {
          if(i < starSize) {
            elements += starOn;
          } else {
            elements += starOff;
          }
        }
        console.log(elements);
        $(this).append(elements);
});

$('.star_grade').each(function(){
        var elements = "";
        var starSize = parseInt($(this).attr("data-star"));
        for(var i=0; i<5; i++) {
          if(i < starSize) {
            elements += starGradeOn;
          } else {
            elements += starGradeOff;
          }
        }
        console.log(elements);
        $(this).append(elements);
});
