function openLogin(){
  var url = "/auth/login";
  var status = "toolbar=no,location=no,status=no,directories=no,scrollbars=no,resizable=no,menubar=no,width=600, height=400, top=0,left=20";
  var title = "로그인";
  window.open(url, title, status);




}
opener.parent.location="/";
