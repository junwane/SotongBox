//
//   function emailChecked(){ //email 형식 체크
//
//   this.boolean = true;
//   var exptext = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
//   if (exptext.test($("#emailVal").val())!=true){
//   this.boolean = false;
//   }
//  return this.boolean;     // boolean 값을 반환 . 이메일 형식이 아니면 false
// }
//
//  // function displayNameChecked(){ //닉네임 null 체크
//  //   this.boolean = true;
//  //   var text = $("#displayNameVal").val();
//  //   if(text === ""){ // 스페이스바 치면 안되네?
//  //     this.boolean = false;
//  //   }
//  //   return this.boolean;
//  // }
//
//     $(document).ready(function(){
//       $("#emailConfirm").on("click", function(){
//         var email = $("#emailVal").val();
//         var resultEmail = $("#resultEmail");
//         $.ajax({
//           url : "http://localhost:3003/emailConfirm",
//           type : "post",
//           dataType : "json",
//           data : {email:email},
//           success : function(result){
//             if(result > 0){
//               var email_boolean = new emailChecked();
//               if(email_boolean.boolean === false){
//                 resultEmail.html("이메일 형식이 올바르지 않습니다.");
//               } else {
//               resultEmail.html("이미 있는 아이디입니다.");
//               }
//             } else {
//               var email_boolean = new emailChecked();
//               if(email_boolean.boolean === false){
//                 resultEmail.html("이메일 형식이 올바르지 않습니다.");
//               } else {
//                 resultEmail.html("사용 가능 합니다.");
//               }
//               // if(e_true === 0){
//               //   resultEmail.html("이메일 형식을 입력해주세요.");
//               // } else {
//               //   resultEmail.html("사용 가능 합니다.");
//               // }
//
//             }
//           },
//           error : function(err){
//             resultEmail.html("이메일을 입력해주세요");
//           }
//         });
//       });
//
//
//
//
//       // $("#displayNameConfirm").on("click", function(){
//       //   var displayName = $("#displayNameVal").val();
//       //   var resultDisplayName = $("#resultDisplayName");
//       //   $.ajax({
//       //     url : "http://localhost:3003/displayNameConfirm",
//       //     type : "post",
//       //     dataType : "json",
//       //     data : {displayName:displayName},
//       //     success : function(result){
//       //       if(result > 0){
//       //         var displayName_boolean = new displayNameChecked();
//       //         alert(displayName_boolean.boolean);
//       //         if(displayName_boolean.boolean === false){
//       //           resultDisplayName.html("닉네임을 입력해주세요");
//       //         } else {
//       //           resultDisplayName.html("이미 있는 닉네임 입니다.");
//       //         }
//       //
//       //       } else {
//       //         var displayName_boolean = new displayNameChecked();
//       //         if(displayName_boolean.boolean === false){
//       //           resultDisplayName.html("닉네임을 입력해주세요");
//       //         } else {
//       //           resultDisplayName.html("사용 가능합니다");
//       //         }
//       //       }
//       //     }
//       //   });
//       // });
//
//       $("#save").on("click", function(){
//         var email_bool = new emailChecked();
//         if($("#emailVal").val() == ""){
//           alert("이메일을 입력해주세요");
//           $("#emailVal").focus();
//           return false;
//         }
//         else if($("#pass").val() == ""){
//          alert("패스워드를 입력하세요");
//          $("#pass").focus();
//          $("#pass").val() = "";
//          return false;
//        }
//        else if($("#pass").val() !== $("#passConfirm").val()){
//          alert("패스워드가 맞지 않습니다.");
//          $("#pass").focus();
//          $("#pass").val() = "";
//          $("#passConfirm").val() = "";
//          return false;
//        }
//         else if(!$("#pass").val().match(/\d+/g) || ! $("#pass").val().match(/[a-z]+/gi)){
//          alert("패스워드는 반드시 영문과 숫자를 1개 이상 조합하여 사용하십시오.");
//          $("#pass").focus();
//          $("#pass").val() = "";
//          return false;
//        }
//         // else if($("#displayNameVal").val() == ""){
//         //   alert("닉네임을 입력해주세요");
//         //   $("#displayNameVal").focus();
//         //   return false;
//         // }
//         else if(email_bool.boolean === false){
//           alert("이메일 형식이 올바르지 않습니다.");
//           $("#emailVal").focus();
//           return false;
//         }
//         else{
//           location.href="/sendEmail";
//         }
//       });
//     });
//
//     // function parentSubmit(){ //팝업창(자식창)에서 부모창으로 submit방법
//     //   window.opener.name = "parentPage"; //부모창의 이름설정
//     //   document.category.target = "parentPage"; // 타겟을 부모창으로 설정
//     //   document.category.submit();
//     //   self.close();
//     // }
