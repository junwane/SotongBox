//Global var to avoid any conflicts
var CRUMINA = {};

(function ($) {

   // USE STRICT
   "use strict";


   //----------------------------------------------------/
   // Predefined Variables
   //----------------------------------------------------/
   var $window = $(window),
      $document = $(document),
      $body = $('body'),
      swipers = {},
      $progress_bar = $('.skills-item'),
        $sidebar = $('.fixed-sidebar');


    /* -----------------------------
     * Equal height elements
     * Script file: theme-plugins.js
     * Documentation about used plugin:
     * http://brm.io/jquery-match-height/
     * ---------------------------*/
   CRUMINA.equalHeight = function () {
      $('.js-equal-child').find('.theme-module').matchHeight({
         property: 'min-height'
      });
   };

   /* -----------------------------
    * Top Search bar function
    * Script file: selectize.min.js
    * Documentation about used plugin:
    * https://github.com/selectize/selectize.js
    * ---------------------------*/
    CRUMINA.TopSearch = function () {
        $('.js-user-search').selectize({
            persist: false,
            maxItems: 2,
            valueField: 'name',
            labelField: 'name',
            searchField: ['name'],
            options: [
                {image: 'img/avatar30-sm.jpg', name: 'Marie Claire Stevens', message:'12 Friends in Common', icon:'olymp-happy-face-icon'},
                {image: 'img/avatar54-sm.jpg', name: 'Marie Davidson', message:'4 Friends in Common', icon:'olymp-happy-face-icon'},
                {image: 'img/avatar49-sm.jpg', name: 'Marina Polson', message:'Mutual Friend: Mathilda Brinker', icon:'olymp-happy-face-icon'},
                {image: 'img/avatar36-sm.jpg', name: 'Ann Marie Gibson', message:'New York, NY', icon:'olymp-happy-face-icon'},
                {image: 'img/avatar22-sm.jpg', name: 'Dave Marinara', message:'8 Friends in Common', icon:'olymp-happy-face-icon'},
                {image: 'img/avatar41-sm.jpg', name: 'The Marina Bar', message:'Restaurant / Bar', icon:'olymp-star-icon'}
            ],
            render: {
                option: function(item, escape) {
                    return '<div class="inline-items">' +
                        (item.image ? '<div class="author-thumb"><img src="' + escape(item.image) + '" alt="avatar"></div>' : '') +
                     '<div class="notification-event">' +
                              (item.name ? '<span class="h6 notification-friend"></a>' + escape(item.name) + '</span>' : '') +
                              (item.message ? '<span class="chat-message-item">' + escape(item.message) + '</span>' : '') +
                     '</div>'+
                           (item.icon ? '<span class="notification-icon"><svg class="' + escape(item.icon) + '"><use xlink:href="icons/icons.svg#' + escape(item.icon) + '"></use></svg></span>' : '') +
                        '</div>';
                },
                item: function(item, escape) {
                    var label = item.name;
                    return '<div>' +
                        '<span class="label">' + escape(label) + '</span>' +
                        '</div>';
                }
            }
        });
    };
    /* -----------------------------
     * Material design js effects
     * Script file: material.min.js
     * Documentation about used plugin:
     * http://demos.creative-tim.com/material-kit/components-documentation.html
     * ---------------------------*/
    CRUMINA.Materialize = function () {
        $.material.init();

        $('.checkbox > label').on('click', function () {
            $(this).closest('.checkbox').addClass('clicked');
        })
    };


    /* -----------------------------
     * Bootstrap components init
     * Script file: theme-plugins.js, tether.min.js
     * Documentation about used plugin:
     * https://v4-alpha.getbootstrap.com/getting-started/introduction/
     * ---------------------------*/
    CRUMINA.Bootstrap = function () {
        //  Activate the Tooltips
        $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

        // And Popovers
        $('[data-toggle="popover"]').popover();


        /* -----------------------------
         * Replace select tags with bootstrap dropdowns
         * Script file: theme-plugins.js
         * Documentation about used plugin:
         * https://silviomoreto.github.io/bootstrap-select/
         * ---------------------------*/
        $('.selectpicker').selectpicker();


        /* -----------------------------
         * Date time picker input field
         * Script file: daterangepicker.min.js, moment.min.js
         * Documentation about used plugin:
         * https://v4-alpha.getbootstrap.com/getting-started/introduction/
         * ---------------------------*/
        var date_select_field = $('input[name="datetimepicker"]');
        if (date_select_field.length) {
            var start = moment().subtract(29, 'days');

            date_select_field.daterangepicker({
                startDate: start,
                autoUpdateInput: false,
                singleDatePicker: true,
                showDropdowns: true,
                locale: {
                    format: 'DD/MM/YYYY'
                }
            });
            date_select_field.on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY'));
            });
        }


    };


    /* -----------------------------
     * Lightbox popups for media
     * Script file: jquery.magnific-popup.min.js
     * Documentation about used plugin:
     * http://dimsemenov.com/plugins/magnific-popup/documentation.html
     * ---------------------------*/
    CRUMINA.mediaPopups = function () {
        $('.play-video').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });
        $('.js-zoom-image').magnificPopup({
            type: 'image',
            removalDelay: 500, //delay removal by X to allow out-animation
            callbacks: {
                beforeOpen: function () {
                    // just a hack that adds mfp-anim class to markup
                    this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                    this.st.mainClass = 'mfp-zoom-in';
                }
            },
            closeOnContentClick: true,
            midClick: true
        });
        $('.js-zoom-gallery').each(function () {
            $(this).magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: {
                    enabled: true
                },
                removalDelay: 500, //delay removal by X to allow out-animation
                callbacks: {
                    beforeOpen: function () {
                        // just a hack that adds mfp-anim class to markup
                        this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                        this.st.mainClass = 'mfp-zoom-in';
                    }
                },
                closeOnContentClick: true,
                midClick: true
            });
        });
    };

    /* -----------------------------
     * Sliders and Carousels
     * Script file: swiper.jquery.min.js
     * Documentation about used plugin:
     * http://idangero.us/swiper/api/
     * ---------------------------*/

   CRUMINA.initSwiper = function () {
      var initIterator = 0;
      var $breakPoints = false;
      $('.swiper-container').each(function () {

         var $t = $(this);
         var index = 'swiper-unique-id-' + initIterator;

         $t.addClass('swiper-' + index + ' initialized').attr('id', index);
         $t.find('.swiper-pagination').addClass('pagination-' + index);

         var $effect = ($t.data('effect')) ? $t.data('effect') : 'slide',
            $crossfade = ($t.data('crossfade')) ? $t.data('crossfade') : true,
            $loop = ($t.data('loop') == false) ? $t.data('loop') : true,
            $showItems = ($t.data('show-items')) ? $t.data('show-items') : 1,
            $scrollItems = ($t.data('scroll-items')) ? $t.data('scroll-items') : 1,
            $scrollDirection = ($t.data('direction')) ? $t.data('direction') : 'horizontal',
            $mouseScroll = ($t.data('mouse-scroll')) ? $t.data('mouse-scroll') : false,
            $autoplay = ($t.data('autoplay')) ? parseInt($t.data('autoplay'), 10) : 0,
            $autoheight = ($t.hasClass('auto-height')) ? true: false,
            $slidesSpace = ($showItems > 1) ? 20 : 0;

         if ($showItems > 1) {
            $breakPoints = {
               480: {
                  slidesPerView: 1,
                  slidesPerGroup: 1
               },
               768: {
                  slidesPerView: 2,
                  slidesPerGroup: 2
               }
            }
         }

         swipers['swiper-' + index] = new Swiper('.swiper-' + index, {
            pagination: '.pagination-' + index,
            paginationClickable: true,
            direction: $scrollDirection,
            mousewheelControl: $mouseScroll,
            mousewheelReleaseOnEdges: $mouseScroll,
            slidesPerView: $showItems,
            slidesPerGroup: $scrollItems,
            spaceBetween: $slidesSpace,
            keyboardControl: true,
            setWrapperSize: true,
            preloadImages: true,
            updateOnImagesReady: true,
            autoplay: $autoplay,
            autoHeight: $autoheight,
            loop: $loop,
            breakpoints: $breakPoints,
            effect: $effect,
            fade: {
               crossFade: $crossfade
            },
            parallax: true,
            onSlideChangeStart: function (swiper) {
                var sliderThumbs = $t.siblings('.slider-slides');
               if (sliderThumbs.length) {
                        sliderThumbs.find('.slide-active').removeClass('slide-active');
                  var realIndex = swiper.slides.eq(swiper.activeIndex).attr('data-swiper-slide-index');
                        sliderThumbs.find('.slides-item').eq(realIndex).addClass('slide-active');
               }
            }
         });
         initIterator++;
      });

        //swiper arrows
        $('.btn-prev').on('click', function () {
            var sliderID = $(this).closest('.slider-slides').siblings('.swiper-container').attr('id');
            swipers['swiper-' + sliderID].slidePrev();
        });

        $('.btn-next').on('click', function () {
            var sliderID = $(this).closest('.slider-slides').siblings('.swiper-container').attr('id');
            swipers['swiper-' + sliderID].slideNext();
        });

        // Click on thumbs
        $('.slider-slides .slides-item').on('click', function () {
            if ($(this).hasClass('slide-active')) return false;
            var activeIndex = $(this).parent().find('.slides-item').index(this);
            var sliderID = $(this).closest('.slider-slides').siblings('.swiper-container').attr('id');
            swipers['swiper-' + sliderID].slideTo(activeIndex + 1);
            $(this).parent().find('.slide-active').removeClass('slide-active');
            $(this).addClass('slide-active');

            return false;
        });
   };


   /* -----------------------
    * Progress bars Animation
    * --------------------- */
    CRUMINA.progresBars = function () {
        $progress_bar.appear({force_process: true});
        $progress_bar.on('appear', function () {
            var current_bar = $(this);
            if (!current_bar.data('inited')) {
                current_bar.find('.skills-item-meter-active').fadeTo(300, 1).addClass('skills-animate');
                current_bar.data('inited', true);
            }
        });
    };



   /* -----------------------------
    * Isotope sorting
    * ---------------------------*/

   CRUMINA.IsotopeSort = function () {
      var $container = $('.sorting-container');
      $container.each(function () {
         var $current = $(this);
         var layout = ($current.data('layout').length) ? $current.data('layout') : 'masonry';
         $current.isotope({
            itemSelector: '.sorting-item',
            layoutMode: layout,
            percentPosition: true
         });

         $current.imagesLoaded().progress(function () {
            $current.isotope('layout');
         });

         var $sorting_buttons = $current.siblings('.sorting-menu').find('li');

         $sorting_buttons.on('click', function () {
            if ($(this).hasClass('active')) return false;
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            var filterValue = $(this).data('filter');
            if (typeof filterValue != "undefined") {
               $current.isotope({filter: filterValue});
               return false;
            }
         });
      });
   };

   /* -----------------------------
    * Toggle functions
    * ---------------------------*/

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href"); // activated tab
        if('#events' === target){
            $('.fc-state-active').click();
        }
    });

   // Toggle aside panels
   $(".js-sidebar-open").on('click', function () {
        $(this).toggleClass('active');
        $(this).closest($sidebar).toggleClass('open');
        return false;
    } );

   // Close on "Esc" click
    $window.keydown(function (eventObject) {
        if (eventObject.which == 27 && $sidebar.is(':visible')) {
            $sidebar.removeClass('open');
        }
    });

    // Close on click outside elements.
    $document.on('click', function (event) {
        if (!$(event.target).closest($sidebar).length && $sidebar.is(':visible')) {
            $sidebar.removeClass('open');
        }
    });

    // Toggle inline popups

    var $popup = $('.window-popup');

    $(".kim-js-open-popup").on('click', function (event) {
        var target_popup = $(this).data('popup-target');
        var current_popup = $popup.filter(target_popup);
        var offset = $(this).offset();
        current_popup.addClass('open');
        current_popup.css('top', offset.top);
        // console.log(offset.top - (current_popup.innerHeight() / 2));
        console.log(offset.top);
        console.log(current_popup.innerHeight());
        $body.addClass('overlay-enable');
        return false;
    });

    //카테고리선택 팝업

      $(document).ready(function(){

        var currentUser = $("#cateUser").val();
        var categorySelectedUser = $(".cate_choice_m");
        var check = $("#cate_selectedCheck").val();

        categorySelectedUser.each(function(index, elem){
          console.log( $(elem).val() );
        });

        console.log(currentUser);
        console.log(categorySelectedUser.length);

        var a = "no";

        if(categorySelectedUser.length===0 && check == "1"){
           a = "no";
        }else if(categorySelectedUser.length===0  && check == null){
           a = "yes";
        }

        for(var i=0; i < categorySelectedUser.length ; i++){
          if(categorySelectedUser[i].value === currentUser){
            a = "yes";
            break;
          } else {
            a = "no";
          }
        }



        console.log(a);

        if( a === "no"){
          $(".create-category").addClass('open');
          $(".create-category").css('top', 70);
          // console.log(offset.top - (current_popup.innerHeight() / 2));

          $body.addClass("overlay-enable");

          $body.click(function(event){
            event.stopImmediatePropagation();
          });
        }


        $("#categorySumbit").on("click", function(){

          var checkedCount = $(".categories:checked");
            if(checkedCount.length < 3){
              // $("#categoryCheck").html("최소 3개 이상 선택하시오.");
              alert("최소 3개 이상 선택해주세요.");
              return false;
            } else {
              check.val("1");

            }

          });


      });




    //팝업 끄기
    // $(".kim-js-close-popup").on('click', function () {
    //     $(this).closest($popup).removeClass('open');
    //     $body.removeClass('overlay-enable');
    //     return false;
    // });


    //메인 사진 로케이션
    $(document).ready(function(){
      $('.mainCardImage').on('click', function(){
        var sc_no = $(this).attr("id");
        location.href='/box/cardInner/'+sc_no;
      });

      $('.mainBoxImage').on('click', function(){
        var sc_no = $(this).attr("id");
        location.href='/box/Inner/'+sc_no;
      });
    });


    $(".jin-js-open-popup").on('click', function (event) {
          var target_popup = $(this).data('popup-target');
          var current_popup = $popup.filter(target_popup);
          var offset = $(this).offset();
          current_popup.addClass('open');
          current_popup.css('top', offset.top);
          // console.log(offset.top - (current_popup.innerHeight() / 2));
          console.log(offset.top);
          console.log(current_popup.innerHeight());
            var http = new XMLHttpRequest();
         var url;
         http.open('HEAD', 'https://source.unsplash.com/random');
         http.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
          url = this.responseURL;
          // $('#randomImg').attr('type', hidden);
          $('#randomImg').attr('value', url);
        }
      };
      http.send();
          $body.addClass('overlay-enable');
          return false;
      });

    // 이메일 인증하라는 팝업 생성
    $(".email-close-popup").on('click', function(){
      var target_popup = $(this).data('popup-target');
      var current_popup = $popup.filter(target_popup);
      var offset = $(this).offset();
      current_popup.addClass('open');
      current_popup.css('top', offset.top);
      // console.log(offset.top - (current_popup.innerHeight() / 2));
      console.log(offset.top);
      console.log(current_popup.innerHeight());
      $body.addClass('overlay-enable');
      return false;
    });


      $(".jin-js-open-popup").on('click', function (event) {
          var target_popup = $(this).data('popup-target');
          var current_popup = $popup.filter(target_popup);
          var offset = $(this).offset();
          current_popup.addClass('open');
          current_popup.css('top', offset.top);
          // console.log(offset.top - (current_popup.innerHeight() / 2));
          console.log(offset.top);
          console.log(current_popup.innerHeight());
            var http = new XMLHttpRequest();
         var url;
         http.open('HEAD', 'https://source.unsplash.com/random');
         http.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
          url = this.responseURL;
          // $('#randomImg').attr('type', hidden);
          $('#randomImg').attr('src', url);
        }
      };
      http.send();
          $body.addClass('overlay-enable');
          return false;
      });

      //회원가입팝업
      $(".register_popup").on('click', function(){
         $(".create-event").removeClass("open");
         $(".create-user").addClass("open");
         $(".create-user").css('top', 25.80000114440918);
         $body.addClass('overlay-enable');
      });

      //비밀번호 찾기 팝업
      $(".findpass_popup").on('click', function(){
         $(".create-event").removeClass("open");
         $(".create-findpass").addClass("open");
         $(".create-findpass").css('top', 25.80000114440918);
         $body.addClass('overlay-enable');
      });

      //email 체크
      $("#emailVal").keyup(function(){
        var email = $("#emailVal").val();
        var resultEmail = $("#resultEmail");
        $.ajax({
          url : "http://localhost:3003/emailConfirm",
          type : "post",
          dataType : "json",
          data : {email:email},
          success : function(result){
           if(result > 0){
             var email_boolean = new emailChecked();
             if(email_boolean.boolean === false){
               resultEmail.html("이메일 형식이 올바르지 않습니다.");
             } else {
             resultEmail.html("이미 있는 아이디입니다.");
              $("#save").prop('disabled', true);

             }

           } else {
             var email_boolean = new emailChecked();
             if(email_boolean.boolean === false){
               resultEmail.html("이메일 형식이 올바르지 않습니다.");
             } else {
               resultEmail.html("사용 가능 합니다.");
               $("#save").prop('disabled', false);
             }

           }
          },
          error : function(err){
            resultEmail.html("이메일을 입력해주세요");
          }
        });


      });

      //회원가입 클릭 시 이메일 인증팝업 넘어감
      $("#save").on("click", function(e){
        var email_bool = new emailChecked();
          if($("#emailVal").val() === ""){
            alert("이메일을 입력해주세요");
            $("#emailVal").focus();
            return false;
          }
          else if($("#pass").val() === ""){
           alert("패스워드를 입력하세요");
           $("#pass").focus();
           $("#pass").val() = "";
           return false;
         }
         else if($("#passConfirm").val() === ""){
          alert("패스워드를 입력하세요");
          $("#passConfirm").focus();
          $("#passConfirm").val() = "";
          return false;
        }
         else if($("#pass").val() !== $("#passConfirm").val()){
           alert("패스워드가 맞지 않습니다.");
           $("#pass").focus();
           $("#pass").val() = "";
           $("#passConfirm").val() = "";
           return false;
         }
          else if(!$("#pass").val().match(/\d+/g) || ! $("#pass").val().match(/[a-z]+/gi)){
           alert("패스워드는 반드시 영문과 숫자를 1개 이상 조합하여 사용하십시오.");
           return false;
         }
          else if(email_bool.boolean === false){
            alert("이메일 형식이 올바르지 않습니다.");
            $("#emailVal").focus();
            return false;
          }
          else{
            alert("이메일 전송됨.");
            $(".create-user").removeClass("open");
            $(".create-emailpopup").addClass("open");
            $(".create-emailpopup").css('top', 25.80000114440918);
            $body.addClass('overlay-enable');
          }
        });



      //비밀번호 찾기 클릭 시 비밀번호 찾기 팝업으로 넘어감

      //카드 내부 팝업
      $("#cardInner").on('click', function(){
        var position = $(window).scrollTop(); // 현재 스크롤바의 위치값을 반환
        $(".create-cardInner").addClass("open");
        $(".create-cardInner").css('top', position);
        $body.addClass('overlay-enable');

      });
      $("#findpass").on('click', function(e){
        $(".create-user").removeClass("open");
        $(".create-findpass").addClass("open");
        $(".create-findpass").css('top', 25.80000114440918);
        $body.addClass('overlay-enable');
      });

    // Close on "Esc" click
    $window.keydown(function (eventObject) {
        if (eventObject.which == 27) {
            $popup.removeClass('open');
            $body.removeClass('overlay-enable');
         $('.profile-menu').removeClass('expanded-menu');
         $('.popup-chat-responsive').removeClass('open-chat');
        }
    });

    // Close on click outside elements.
    $document.on('click', function (event) {
        if (!$(event.target).closest($popup).length) {
            $popup.removeClass('open');
            $body.removeClass('overlay-enable');
         $('.profile-menu').removeClass('expanded-menu');
         $('.popup-chat-responsive').removeClass('open-chat');
        }
    });

    // Close active tab on second click.
    $('[data-toggle=tab]').on('click', function(){
        if ($(this).hasClass('active') && $(this).closest('ul').hasClass('mobile-app-tabs')){
            $($(this).attr("href")).toggleClass('active');
            $(this).removeClass('active');
            return false;
        }
    });





    $(".js-open-choose-from-my-photo").on('click', function () {
        $('.choose-from-my-photo').addClass('open');
        $('.update-header-photo').removeClass('open');
    });

   $(".js-expanded-menu").on('click', function () {
      $('.profile-menu').toggleClass('expanded-menu');
      return false
   });

   $(".js-chat-open").on('click', function () {
      $('.popup-chat-responsive').toggleClass('open-chat');
      return false
   });
    $(".js-chat-close").on('click', function () {
        $('.popup-chat-responsive').removeClass('open-chat');
        return false
    });
      /* -----------------------------
    * On DOM ready functions
    * ---------------------------*/

   $document.ready(function () {
        CRUMINA.Bootstrap();
        CRUMINA.Materialize();
        CRUMINA.initSwiper();
        CRUMINA.progresBars();
      CRUMINA.IsotopeSort();

        // Run scripts only if they included on page.

        if (typeof $.fn.selectize !== 'undefined'){
            CRUMINA.TopSearch();
        }
        if (typeof $.fn.matchHeight !== 'undefined'){
            CRUMINA.equalHeight();
        }
        if (typeof $.fn.magnificPopup !== 'undefined'){
            CRUMINA.mediaPopups();
        }
        if (typeof $.fn.gifplayer !== 'undefined'){
            $('.gif-play-image').gifplayer();
        }
        if (typeof $.fn.mediaelementplayer !== 'undefined'){
            $('#mediaplayer').mediaelementplayer({
                "features": ['prevtrack', 'playpause', 'nexttrack', 'loop', 'shuffle', 'current', 'progress', 'duration', 'volume']
            });
        }
   });

})(jQuery);

function emailChecked(){ //email 형식 체크

this.boolean = true;
var exptext = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
if (exptext.test($("#emailVal").val())!=true){
this.boolean = false;
}
return this.boolean;     // boolean 값을 반환 . 이메일 형식이 아니면 false
}
