// All Scripts in this file will be applicable only for Smaller devices.

	$(document).on('ready', function() {
	//Mobile Main Nav Menu Script
			 $( ".mobnav.mobTabMainMenu" ).click(function() {
				    $( "#mobileMenuWrpper" ).slideToggle('fast');
					$(".mobnav").toggleClass("mobnavMenuactive");
					$('.mobileMenu').find('.level-2').hide('fast');
		            $(".headerSmalSearch").toggleClass("hide");
		            $('body').toggleClass("nonscrollBody");
		            $('html').toggleClass("nonscrollBody"); 
			});
				   $(".mobileIcn").parent().append("<span class='headernavicn'></span>");
					$(".menu-category div.level-2").parent().addClass('MenuCatTittle');
				  
				  $('.panasonic_device .MenuCatTittle a.level-1, .panasonic_device a#GlobalHeaderAbout, .panasonic_device .footer-menu-links .subTitle.ss_button a, .panasonic_device .primary-image').click(function(event){
				    event.preventDefault();
				    //do whatever
				  });  
					
	//Mobile Drop Down Menu Script
		  $('.mobileMenu li').click(function() {
    		if ($('.mobileMenu li').hasClass('curr_menu_item')){
	 			 $(this).find('div.level-2').slideToggle();
       			 $(this).removeClass('curr_menu_item');
       			}else{
       			 $(this).find('div.level-2').slideToggle();
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
			 if($("body").hasClass('panasonic_device')){
					$('.pt_cart .cart-footer .cart-coupponcode-heading').removeClass('active');
					$('.billing-coupon-code').addClass('mobilehide');
					$('.pt_checkout .checkout-billing .billingErrorEoupncntr').addClass('hide');
					//CheckOut Page Custome MobileScript
					$('.step-1').text($('.step-1').text().replace('Step 1:', '1.'));
					$('.step-2').text($('.step-2').text().replace('Step 2:', '2.'));
					$('.step-3').text($('.step-3').text().replace('Step 3:', '3.'));
					$('.checkout-progress-indicator').find('.active').append('<div class="arrow-right"></div>');
					$('.checkout-progress-indicator').find('.step-2.active').append('<div class="arrow-right arrow-left"></div>');
					$('.mobilestick').addClass('checkdiv'); 
			   }else{
				 	$('.mobilestick').removeClass('checkdiv'); 
		   		}		
			
		
		if( $('.cart-coupon-code .error').length > 0 ){
			$('.cart-coupon-code').css("display", "block");
			$('.cart-coupponcode-heading').addClass("active");
			}
		
		 
		$(".gift-message-text textarea").text(function(index, currentText) {
		    return currentText.substr(0, 250);
		});
		
		if($('.productinfoyncheight').length>0){
			$(".productinfoyncheight").syncHeight();
		}
		
		$( ".mobilecatbanner" ).parent( ".content-slot.slot-grid-header" ).css( "margin", "0px" );
		$(".cat-land-shopall:first").addClass('bordermobileCat');
		$(".block-headline").append("<div class='pdpfeatureIcn'></div>");
		$('h2.block-headline').click(function() {
			if (!$(this).hasClass("active")) {
				$('.pdpfeatureIcn').removeClass('ftractive');
				$('h2.block-headline').removeClass('active');
				$(".PDPFeaturecontent").slideUp('');
				$(this).next(".PDPFeaturecontent").slideDown('');
				$(this).addClass('active');
				$(this).find('.pdpfeatureIcn').addClass('ftractive');
				var the_pixlee_iframe = $('iframe[id*=pixlee_widget_iframe]'); 
				//loadpixleewidget($('#pid').val());
				if (iOSSafariCheck()) {
					the_pixlee_iframe.height('100%'); 
				} else { 
					the_pixlee_iframe.width('100%'); 
				} 
			}
			else{
				$(this).next(".PDPFeaturecontent").slideUp('');
				$(this).removeClass('active');
				$(this).find('.pdpfeatureIcn').removeClass('ftractive');
				}
		});	
		
		function loadpixleewidget(productid){
			var url = app.util.appendParamsToUrl(app.urls.getPixleeWidget, {pid:productid,format:'ajax'});
			app.ajax.load({
				url: url,
				callback:  function (data){
					if(data!=null && $('#pixlee_container').length==1){
						$('#gallery-community-gallery').replaceWith(data);
					}else if(data!=null){
						if($('#pixlee_container').length==0){
							$(data).insertAfter('#gallery-community-gallery');
						}
					}
					var the_pixlee_iframe = $('iframe[id*=pixlee_widget_iframe]'); 
					if (iOSSafariCheck()) {
						the_pixlee_iframe.height('100%'); 
					} else { 
						the_pixlee_iframe.width('100%'); 
					} 
				}
			});
			
		}
		
		function iOSSafariCheck() {
	        var isIOSSafari = false;
	        (function(a) {
	            var iOS = !!a.match(/iPad/i) || !!a.match(/iPhone/i);
	            var webkit = !!a.match(/WebKit/i);
	            var iOSSafari = iOS && webkit && !a.match(/CriOS/i);
	            if (iOSSafari) {
	                isIOSSafari = true;
	            }
	        })(navigator.userAgent || navigator.vendor || window.opera);
	        return isIOSSafari;
	    }
		 
});	