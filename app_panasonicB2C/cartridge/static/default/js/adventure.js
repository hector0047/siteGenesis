var videos = [];
var spartanVideoCount = 0;

$(document).ready(function(){
    // Asynchronously load Youtube API
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    $('.video-player').slick({
        dots: true,
        arrows: false,
        slidesToShow: 1,
        adaptiveHeight: true
    });

    $('.product-carousel').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3
    });

    $('.player-overlay').click(function() {
        $('.slick-active .overlay').click();
        $(this).hide();
    });

    var sectionWidth = $("#wrapper").width();
    var sectionHeight = Math.ceil((720 * sectionWidth)/1280);
    $('.adventure-video').css('height', sectionHeight + 'px');
    $('.video-wrapper .overlay img').css('height', sectionHeight + 'px');

    $('.overlay').click(function(){
        startVideo($(this), sectionHeight, sectionWidth);
    });
});

function startVideo($overlay, sectionHeight, sectionWidth) {
    var $video = $overlay.next();
    var videoID = $overlay.data('overlayid');

    console.log('sectionwidth: ', sectionWidth);


    if(videos[videoID] == null) {
        videos[videoID] = createPlayer($video.data('youtubeid'), $video.attr('id'), sectionHeight, sectionWidth);
    }
    videos[videoID].playVideo();
    setTimeout(function(){ // hide youtube play button
        $overlay.hide();
    }, 1500);
}

function onYouTubePlayerAPIReady() {
    var video1 = $('#spartan-video').data('youtubeid-1');
    createPlayer(video1, 'spartan-video', '300', '300');
}

function createPlayer(youtubeID, domID, height, width) {
    var video = new YT.Player(domID, {
        height: height,
        width: width,
        videoId: youtubeID,
        playerVars: {
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            wmode: "opaque"
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    return video;
}

function onPlayerReady(event) {
    if ($(event.target.c).hasClass('video')) {
        event.target.playVideo();
    }
}

function onPlayerStateChange(event) {
    if ($(event.target.c).hasClass('video') && event.data === 0) {
        var videoID = $(event.target.c).data('videoid');
        var $overlay = $('.slick-slide .overlay:not(.slick-cloned .overlay)');

        $($overlay[videoID]).show();

        if(videoID >= 3) {
            $('.slick-dots li button')[0].click();
            startVideo($($overlay[0]));
        } else {
            $('.slick-dots li button')[videoID + 1].click();
            startVideo($($overlay[videoID + 1]));
        }
    }

    if (($(event.target.f).attr('id') == 'spartan-video') && event.data === 0) {
        var video1 = $(event.target.f).data('youtubeid-1');
        var video2 = $(event.target.f).data('youtubeid-2');
        if (spartanVideoCount == 0) {
            event.target.loadVideoById(video2);
            spartanVideoCount = 1;
        } else {
            event.target.loadVideoById(video1);
            spartanVideoCount = 0;
        }
        event.target.playVideo();
    }
}
