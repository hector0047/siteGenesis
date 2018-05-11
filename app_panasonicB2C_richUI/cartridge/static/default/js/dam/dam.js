var set_id = $(".viewer").attr('data-mediaSet');
	
 amp.init({
        client_id: "pcec",
        di_basepath: ('https:' == document.location.protocol ? 'https://' : 'http://') + "i1.adis.ws/"
    });

    amp.get([{"name":set_id,"type":"s"}],function(data){
        var items = [];
		// added array for Youtube items
		var YoutubeItems = [];
		// added array for normal image items
		var ImageItems = [];
		
		// added function to find out image name from url
		function getImageName(itemsrc){
			var splitUrl = Array();
			splitUrl = itemsrc.split("/");
			return splitUrl[splitUrl.length - 1];
		}
		
		// added a function which will check does image name will have video id or not
		function ItemIsYoutubeVideo(item) {
			var itemImageName = getImageName(item.src);
			var regex = /(.*)\_(VID)\_(ALT)(\d+)(\_)/;
			var regexObj = new RegExp(regex);
			
			if(regexObj.test(itemImageName)) {
				var y = regexObj.exec(itemImageName);
				var z = itemImageName.split(y[0]);
				return z[1];
			} else {
				return false;
			}
		}
		var ItemIsYoutubeVideoFlag = false;
        for(var i = 0; i < data[set_id].items.length; i++){
            var item = data[set_id].items[i];
			ItemIsYoutubeVideoFlag = ItemIsYoutubeVideo(item);
			if(ItemIsYoutubeVideoFlag) {
				item.videoid = ItemIsYoutubeVideoFlag;
				YoutubeItems.push(item);
			} else {
				ImageItems.push(item);
			}		
				items.push(item);
            
        }
		// rendering main section
        data[set_id].items = ImageItems;
        var a = amp.genHTML(amp.di.set( data[set_id],{'template': new Array('$PDP-Hero-Image-Desktop$')}), $("#viewer_main")[0], false);
        for(var i = 0; i < data[set_id].items.length; i++){
            var item = data[set_id].items[i];
            if( item.set){
                item.type="img";
            }
        }
		
		// adding a code for adding Place holdet for youtube videos in carasoul main section
		var youtubeVideoCount = 0;
		//alert("dam");
		//alert(12345);

   	 	while(youtubeVideoCount < YoutubeItems.length) {			
			//$('#main #DMC-G7HK_MSET').append("<li>" + YoutubeItems[youtubeVideoCount].videoid + "</li>");
			$("#viewer_main #"+ set_id).append("<li><div class='amp-yt-holder' data-amp-ytholderid='" + YoutubeItems[youtubeVideoCount].videoid + "' id=" + YoutubeItems[youtubeVideoCount].videoid + "></div></li>");
			//$('#main #DMC-G7HK_MSET').append('<li><iframe width="560" height="315" src="https://www.youtube.com/embed/' + YoutubeItems[youtubeVideoCount].videoid + '" frameborder="0" allowfullscreen></iframe></li>');
			youtubeVideoCount = youtubeVideoCount + 1;
		}
		
		

		
		
		// rendering carasoul section
		data[set_id].items = items;
        amp.genHTML(amp.di.set( data[set_id],{'template': new Array('$PDP-Carousel-Thumbnail-Desktop$')}), $("#carousel")[0], false);
        $('#nav img').ampImage({preload:'visible'})
        $('#nav #' + set_id).ampCarousel({
            start:1,
            height:100,
            easing:"ease-in-out",
            animSpeed:500,
            loop:false
        });
        var children = null;
        $('#viewer_main #' + set_id).bind('ampcarouselcreated', function(){
            children =  $('#viewer_main #' + set_id + ' div').children();
        })

        $('#viewer_main #' + set_id).bind('ampcarouselcreated ampcarouselchange',function(e, data){
			
			// stopping all videos
			var $yts = $('.amp-yt-holder');
		    for(var i = 0;i<$yts.length;i++){
				if(typeof(player[$yts[i].id]) != "undefined") {
					player[$yts[i].id].stopVideo();	
				}				
			}
			
			
            var i = data.index - 1, child = children.eq(i);
            var spin = child.find('.amp-spin');
            if(spin.length > 0){
                $('.spin').show().delay(500).fadeIn();
            }else{
                $('.spin').hide().fadeOut();
            }

            var zoom = child.find('.amp-zoom-container');
            if(zoom.length > 0){
                $('.zoom').show().delay(500).fadeIn();
            }else{
                $('.zoom').hide().fadeOut();
            }

            $('#nav #' + set_id + ' div').children().removeClass('current');
            $('#nav #' + set_id + ' div').children().eq(i).addClass('current');

            //$('.message').text((data.index >= 4 ? data.index - 3 : data.index + 6) + " / " +children.length)

        })



        $('#viewer_main #' + set_id).ampCarousel({
            width:370,
            height:180,
            start:1,
            loop:false
        });

        $('#nav #' + set_id).ampNav({
            on:"goTo",
            action:"select",
            selector:"#viewer_main #" + set_id
        });


        $('#viewer_main #bag_spin, #viewer_main #boot_spin').ampSpin({
            preload:'visible',
            width:370,
            height:370
        });

        $('#viewer_main img').ampZoom({translations:'sm=CM',preload:{
            image:'visible',
            zoomed:'visible'
        }});

        $('.zoom').click(function(){
            $('.amp-visible .amp-zoom').ampZoom('toggle');
        })

        var playing = false;
        $('.spin').click(function(){
            if(playing){
                $('.amp-visible .amp-spin').ampSpin('pause');
            }else{
                $('.amp-visible .amp-spin').ampSpin('play');
            }
            playing = !playing;
        })

        $('#nav .prev').bind('click',function(e) {
            $('#nav #' + set_id).ampCarousel('prev');
        });

        $('#nav .next').bind('click',function(e) {
            $('#nav #' + set_id).ampCarousel('next');
        });

    });       
    
    
 // 2. This code loads the IFrame Player API code asynchronously.
    if(youtubeApiReadyForDam == 0) {
    	var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
    }
    

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player = new Array();
    if(youtubeApiReadyForDam == 1) {
    	onYouTubeIframeAPIReady();	
    }
    
    function onYouTubeIframeAPIReady() {
    	var delay=5000; //1 second

    	setTimeout(function() {
    	  //your code to be executed after 1 second
    	}, delay);
    var $yts = $('.amp-yt-holder');
    
          // Using global var j to prevent recreation of players
          for(var i = 0;i<$yts.length;i++){
    player[$yts[i].id] = new YT.Player($yts[i].id, {
        height: '300',
        width: '385',
        videoId: $yts[i].id,
        playerVars: { 'autoplay': 0},       
        events: {
       'onReady': onPlayerReady,
       'onStateChange': onPlayerStateChange
        }
      }); 
      
   }
          youtubeApiReadyForDam = 1;
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      //event.target.playVideo();
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
      
    }
    function stopVideo() {
      
    }