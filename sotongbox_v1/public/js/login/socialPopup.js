// $(document).ready(function(){
//
// });

function facebookConnectPopupOpen(){
  var url = "/connect/facebook";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=850, height=400, top=0,left=20";
  var title = "페이스북 계정연결";
  window.open(url, title, status);
}

function twitterConnectPopupOpen(){
  var url = "/connect/twitter";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=850, height=400, top=0,left=20";
  var title = "트위터 계정연결";
  window.open(url, title, status);
}

function googleConnectPopupOpen(){
  var url = "/connect/google";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=850, height=400, top=0,left=20";
  var title = "구글 계정연결";
  window.open(url, title, status);
}

function naverConnectPopupOpen(){
  var url = "/connect/naver";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=850, height=400, top=0,left=20";
  var title = "네이버 계정연결";
  window.open(url, title, status);
}

window.close();
