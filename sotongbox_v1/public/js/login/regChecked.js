$(document).ready(function(){




  $("#selectAll").click(function(){

    $("input:checkbox[name='select[]']").each(function(e){
      if($("#selectAll").is(":checked") === true){
        $(this).prop("checked", true);


      } else {
        $(this).prop("checked", false);
      }
    });
  });



  $('#cancel').click(function(){
    window.close();
  });

  $('#register').click(function(){
    if($("#selectAll").is(":checked") === true){
      location.href="/auth/register";
    } else if($("#select1").is(":checked") === true && $("#select2").is(":checked") === true){
      location.href="/auth/register";
    }
      else {
      alert("필수항목 체크 해주세요!");
    }
  });


});
