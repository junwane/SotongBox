$(document).ready(function() {
    //$('.Main').show();
    //$('.Upload').show();
    //$('.Gallery').show();

    $('.Main').show();

    $('.mainBtnUpload').click(function() {
        $('.Main').hide();
        $('.Upload').show();
    });

    $('.mainBtnGallery').click(function() {
        $('.Main').hide();
        $('.Gallery').show();
        loadImages();
    });

    $('.uploadBtnUpload').click(function() {
        navigator.camera.getPicture(
            function (imageURI) { 
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                var param = {};
                options.params = param;
                options.chunkedMode = false;
                var ft = new FileTransfer();
                ft.upload(imageURI,
                    'http://172.19.1.33:8080/GalleryApp/uploadImage.jsp',
                    function(r) {

                        var response = r.response;
                        var result = JSON && JSON.parse(response) || $.parseJSON(response);
                        if(result.result == "success") {
                            window.alert('업로드 되었습니다.');
                            $('.Upload').hide();
                            $('.Gallery').show();
                            loadImages();
                        }
                        else {
                            window.alert('오류가 발생하였습니다.(#1)');
                        }
                    },
                    function(error){
                        //Failed
                        window.alert("An error has occurred: Code = " + error.code);
                        window.alert('오류가 발생하였습니다.');
                    },
                    options
                ); 
            },

            function (message) {
                window.alert('오류가 발생하였습니다.(#2)');
            },

            {
                quality: 40,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            }
        );
    });

    $('.uploadBtnCancel').click(function() {
        if(window.confirm('업로드를 취소하시겠습니까?')) {
            $('.Upload').hide();
            $('.Main').show();
        }
    });

    $('.galleryBtnMain').click(function() {
        $('.Gallery').hide();
        $('.Main').show();
    });

    $('.galleryBtnUpload').click(function() {
        $('.Gallery').hide();
        $('.Upload').show();
    });

    var loadImages = function() {
        var target = $('.Images').empty();

        $.ajax({
            url: 'http://172.19.1.33:8080/GalleryApp/load.jsp',
            data: {},
            dataType: 'jsonp',
            success: function(data) {

                if(data.result == "success") {
                    var cnt = data.data.length;

                    for(var i=0; i<cnt; i++) {
                        var imageName = data.data[i].imageName;
                        var asd = $('<img />').attr('src', 'http://172.19.1.33:8080/image/' // 파일 경로 집어넣기
                        + imageName).appendTo(target);
                        //window.alert(asd.attr('src'));
                    }
                    if(cnt == 0)
                        $('<p></p>').text('업로드된 이미지가 없습니다.').appendTo(target);

                    $('.Gallery > p').text('총 ' + i + '점의 이미지가 업로드되었습니다.');
                }

                else {
                    window.alert('오류가 발생하였습니다.(#3)');
                }
            },
            error: function(data) {
                window.alert('오류가 발생하였습니다.(#4)');
            }
        });
    };
});