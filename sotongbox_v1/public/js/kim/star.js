var fave1 = document.getElementsByClassName('fave');

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
