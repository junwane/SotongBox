
  if ($('#OtherUser').val() === $('#NowUser').val()) {
    $('.OtherUserView').removeAttr('readonly');
    $('.OtherUserView').removeAttr('disabled');
  } else {
    $('.OtherUserView').attr('readonly', true);
    $('.OtherUserView').attr('disabled', true);
    $('#profileMod').attr('hidden', true);
  }
