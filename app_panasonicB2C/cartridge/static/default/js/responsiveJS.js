// All Scripts in this file will be applicable only for Smaller devices.

	$(document).on('ready', function() { 
	//Mobile Main Nav Menu Script
			 $( ".mobnav.mobTabMainMenu" ).click(function() {
				    $("#mobileMenuWrpper").slideToggle('');
					$(".mobnav").toggleClass("mobnavMenuactive");
					$('.mobileMenu').find('li div.level-2').hide('fast');
		            $(".headerSmalSearch").toggleClass("hide");
		            $('body').toggleClass("nonscrollBody");
		            $('html').toggleClass("nonscrollBody"); 
			});
				   $(".mobileIcn").parent().append("<span class='headernavicn'></span>");
					$(".menu-category div.level-2").parent().addClass('MenuCatTittle');
				  
				   $('.panasonic_device .MenuCatTittle a.level-1, .panasonic_device a#GlobalHeaderAbout, .panasonic_device .footer-menu-links .subTitle.ss_button a').click(function(event){
				    event.preventDefault();
				    //do whatever
				  });  
	//Mobile Drop Down Menu Script
		  $('.mobileMenu li').click(function() {
    		if ($('.mobileMenu li').hasClass('curr_menu_item')){
	 			 $(this).find('div.level-2').slideToggle('fast');
       			 $(this).removeClass('curr_menu_item');
       			}else{
       			 $(this).find('div.level-2').slideToggle('fast');
       			 $(this).addClass('curr_menu_item');
       			}
    		});
    		jQuery('.MenuCatTittle .level-2, .about_menu > .level-2').click(function(e){
    			e.stopPropagation();
			});
			
   		//Reseting Anchor tag to double tap for better Mobile experiance.
    	//  $(function($) {
		//		$('.home-banner a img, .mobile-homecategory a img, .mob-business-header a img, .mob-home-newproducts a img').click(function() {
    	//			$('.mobile-homecategory a img').click(function() {
		//	        return false;
		//	    }).dblclick(function() {
		//	        window.location = this.href;
		//	        return false;
		//	    });
		// });
		  
		  

	//Mobile Footer Menu Script.
		    $('.panasonic_device .ss_button').click(function() {
	    			if (!$(this).hasClass("activeFooter")) {
	    				$('.footerarwActive').removeClass('footerarwActive');
						$('.ss_button').removeClass('activeFooter');
						$(".ss_content").slideUp('');
						$(this).next(".ss_content").slideDown('');
						$(this).addClass('activeFooter');
						$(this).find('.footerMenuArrow').addClass('footerarwActive');
					}
				else{
						$(this).next(".ss_content").slideUp('');
						$(this).removeClass('activeFooter');
						$(this).find('.footerMenuArrow').removeClass('footerarwActive');
			
					}
				});
		

//Quick Fix for social media.
 $(".panasonic_device .home-bottom-social-ico li a").on("touchstart", function(e) {
 	  e.preventDefault();	
 	  window.open($(this).prop('href'),'_blank');
  });
  $(".home-bottom-social-ico li a").on("click", function(e) {
 	  e.preventDefault();	
 	  window.open($(this).prop('href'),'_blank');
  });
		
    });