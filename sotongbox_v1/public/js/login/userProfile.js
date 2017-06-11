var url = "";
function openfacebook(){
  var url = "https://www.facebook.com/sharer/sharer.php";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=600, height=400, top=0,left=20";
  var title = "로그인";
  window.open(url, title, status);
}

function opentwitter(){
  var url = "https://twitter.com/intent/tweet";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=600, height=400, top=0,left=20";
  var title = "로그인";
  window.open(url, title, status);
}


$(document).ready(function(){
  var gender = $("#genderCheck").val();

  if(gender === $("#man").val()){
    $("#man").attr("checked", true);
  } else if (gender === $('$woman').val()){
    $("#woman").attr("checked", true);
  }
});
//
//     window.onload = function(){
//       hello.on('auth.login', function(auth) {
//
//       // Call user information, for the given network
//       hello(auth.network).api('me').then(function(r) {
//           // Inject it into the container
//           var label = document.getElementById('profile_' + auth.network);
//           if (!label) {
//               label = document.createElement('div');
//               label.id = 'profile_' + auth.network;
//               document.getElementById('profile').appendChild(label);
//           }
//           label.innerHTML = '<img src="' + r.thumbnail + '" /> Hey ' + r.name;
//       });
//   });
//
//   hello.init({
//     facebook: "1840733199510901",
//     twitter: "3B7AG1uxos0XHOuEgtVDcOBsL",
//     google: "777905994972-3a9e6a0j500t5dfurqe17a411i0i34rd.apps.googleusercontent.com"
// }, {redirect_uri: 'http://localhost:3003/member/callback',
//
//  });
//     };
//
//     hello('facebook').logout({force:true}).then(function() {
//     	alert('Signed out');
//     }, function(e) {
//     	alert('Signed out error: ' + e.error.message);
//     });
//
//     hello('twitter').logout({force:true}).then(function() {
//       alert('Signed out');
//     }, function(e) {
//       alert('Signed out error: ' + e.error.message);
//     });
//
//     hello('google').logout({force:true}).then(function() {
//       alert('Signed out');
//     }, function(e) {
//       alert('Signed out error: ' + e.error.message);
//     });
//
//     hello('naver').logout({force:true}).then(function() {
//       alert('Signed out');
//     }, function(e) {
//       alert('Signed out error: ' + e.error.message);
//     });
