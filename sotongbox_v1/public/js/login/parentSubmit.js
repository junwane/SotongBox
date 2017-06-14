function parentSubmit(){ //팝업창(자식창)에서 부모창으로 submit방법
  window.opener.name = "parentPage"; //부모창의 이름설정
  document.login.target = "parentPage"; // 타겟을 부모창으로 설정
  document.login.submit();
  window.opener.close();
  window.close();
}
