/**
 *

 * All java script logic for the application.
 *    (c) 2009-2012 Demandware Inc.
 *    Subject to standard usage terms and conditions
 * The code relies on the jQuery JS library to
 * be also loaded.
 *    For all details and documentation:
 *    https://github.com/Demandware/Site-Genesis
 */
// semi-colon to assure functionality upon script concatenation and minification
;

// if jQuery has not been loaded, load from google cdn
if (!window.jQuery) {
	var s = document.createElement('script');
	s.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
	s.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
}

/** @namespace */
var app = (function (app, $) {
	//allows the use of $ within this function without conflicting with other JavaScript libraries which are using it (JQuery extension)
	document.cookie="dw=1";

	/******** private functions & vars **********/

	/**
	 * @private
	 * @function
	 * @description Cache dom elements which are being accessed multiple times.<br/>app.ui holds globally available elements.
	 */
	function initUiCache() {
		app.ui = {
			searchContainer : $(".global-search"),
			printPage		: $("a.print-page"),
			reviewsContainer: $("#pwrwritediv"),
			main			: $("#main"),
			primary			: $("#primary"),
			secondary		: $("#secondary"),
			// elements found in content slots
			slots : {
				subscribeEmail : $(".subscribe-email")
			}
		};
	}
	
	
	 function initEcomBridge() {
		ecommBridge.capability.hasQuickView = hasQuickview;
		ecommBridge.capability.hasWishList = hasWishlist;
		ecommBridge.capability.isTransactional = isTransactional;
		ecommBridge.site.locale = currentLocale;
		ecommBridge.site.currency.code = currencyCode;
		ecommBridge.site.currency.prefix = currencyIsPrefix ? currencySymbol : '';
		ecommBridge.site.currency.suffix = currencyIsPrefix ? '' : currencySymbol;
		ecommBridge.site.page = pageData;
		ecommBridge.user.name = user;
		}

	/**
	 * @private
	 * @function
	 * @description Apply dialogify event handler to all elements that match one or more of the specified selectors.
	 */
	function initializeEvents() {
		var controlKeys = ["8", "13", "46", "45", "36", "35", "38", "37", "40", "39"];

		$("body").on("click", ".dialogify, [data-dlg-options], [data-dlg-action]", app.util.setDialogify)
		.on("keydown", "textarea[data-character-limit]", function(e) {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data("character-limit"),
				charsUsed = text.length;

				if ((charsUsed >= charsLimit) && (controlKeys.indexOf(e.which.toString()) < 0)) {
					e.preventDefault();
				}
		})
		.on("change keyup mouseup", "textarea[data-character-limit]", function(e) {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data("character-limit"),
				//charsUsed = text.length,
				charleft = text.length,
				charsUsed = charsLimit - charleft,
				charsRemain = charsLimit - charsUsed;

			if(charsRemain < 0) {
				$(this).val( text.slice(0, charsRemain) );
				charsRemain = 0;
			}
			if($(this).next().hasClass('error')){
				$(this).siblings('div.char-count').find('.char-remain-count').html(charsUsed);
			}else{
				$(this).next('div.char-count').find('.char-remain-count').html(charsUsed);
			}

		})
		.on("click", ".reviewlink", function(e) {
	    	document.cookie="viewreviews=true;path=/";
	    });


		/**
		 * initialize search suggestions, pending the value of the site preference(enhancedSearchSuggestions)
		 * this will either init the legacy(false) or the beta versions(true) of the the search suggest feature.
		 * */
		if(app.clientcache.LISTING_SEARCHSUGGEST_LEGACY){
			app.searchsuggestbeta.init(app.ui.searchContainer, app.resources.SIMPLE_SEARCH);
		}else{
			app.searchsuggest.init(app.ui.searchContainer);
		}

		// print handler
		app.ui.printPage.on("click", function () { window.print(); return false; });


		// add show/hide navigation elements
		$('.secondary-navigation .toggle').click(function(){
			$(this).toggleClass('expanded').next('ul').toggle();
		});

		// add generic toggle functionality
		$('.toggle').next('.toggle-content').hide();
		$('.toggle').click(function(){
			$(this).toggleClass('expanded').next('.toggle-content').toggle();
		});

		// subscribe email box
		if (app.ui.slots.subscribeEmail.length > 0)	{
			app.ui.slots.subscribeEmail.focus(function () {
				var val = $(this.val());
				if(val.length > 0 && val !== app.resources.SUBSCRIBE_EMAIL_DEFAULT) {
					return; // do not animate when contains non-default value
				}

				$(this).animate({ color: '#999999'}, 500, 'linear', function () {
					$(this).val('').css('color','#333333');
				});
			}).blur(function () {
				var val = $.trim($(this.val()));
				if(val.length > 0) {
					return; // do not animate when contains value
				}

				$(this).val(app.resources.SUBSCRIBE_EMAIL_DEFAULT).css('color','#999999').animate({color: '#333333'}, 500, 'linear');

			});
		}


		// header menu animation
		var timerCount = 0;
		var leftPos = $('#wrapper').width() - $('#navigation').width();

		$('.pnsb2c-header-dropdown ul.level-dropdown > li').mouseenter(function(){
            curr_menu = $(this);
            curr_menu_child = $(this).find('.level-2');
            clearTimeout(timerCount);
            if(curr_menu_child.is(':visible') || curr_menu_child.length == 0){return false;}
            $('div.level-2').not($(this).find('div.level-2')).fadeOut(200);
            if($(this).find('> a').width() < 25){
            	$(this).addClass('leftalign');
            }
            $('.pnsb2c-header-dropdown ul.level-1 > li').removeClass('curr_menu_item');
            if(curr_menu.find('div.level-2').length > 0){
            	timerCount = setTimeout(function(){
            		if(!$('.menu-category').hasClass('flyoutmenu')){
            			curr_menu.find('div.level-2').css({'width': $('#wrapper').width(),'left': -leftPos});
            		}else{
            			leftPos =  (curr_menu.find('div.level-2').outerWidth() - curr_menu.width())/2
            			curr_menu.find('div.level-2').css({'margin-left': -leftPos});
            		}

                    curr_menu.find('div.level-2').fadeIn(50);
                    curr_menu.addClass('curr_menu_item');
                }, 200);
            }
        }).mouseleave(function(){
        	timerCount = setTimeout(function(){
        		$('div.level-2').fadeOut(200, function(){
        			$('#navigation ul.level-1 > li').removeClass('curr_menu_item');
        		});
            }, 500);
        });
		
		$(document).on("click", ".marketoSubscribe , .marketoSubscribe.sign_btn" ,function(e){ 
	          e.preventDefault();
	          var $this = $(this).closest('#email-alert-signup');
	          /* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
	          var email = $this.find('#marketo-email-address').val().toLowerCase();
	          /* PANC-1797 END    */ 
	          if($('.success-msg').length>0){$('.success-msg').hide();}
	          /* Farhans Dev Team : 12/10/2-15 11:00PM PANC-1473 */
	          if(email.length == 0 || email.indexOf(" ") == 0){
	                $this.find('.success-fail-msg .success-msg').hide();
	                $this.find('span.error').hide();
	                if($this.find('.success-fail-msg .emptyerror-msg').length == 0){
	                      $this.find('.success-fail-msg').append('<span class="error-msg emptyerror-msg" style="display:none;">'+app.resources.INVALID_EMAIL+'</span>');
	                }
	                if($($this).find('.error').length < 3 ){
	               		 $this.find('.success-fail-msg .emptyerror-msg').fadeIn(500);
	               
	         		}
	         		 return false;
	          /* PANC-1473 END    */ 
	          }
	          if(!$(this).closest('form').valid()){if($('.error-msg.emptyerror-msg').length>0){$('.error-msg.emptyerror-msg').hide();}return false;}
			  /* FArhan's Dev team PANC-1575 17/12/2015 4:50pm */	          
	          if($(this).hasClass('LPD-promotionbutton')){
	                var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscription, {email:email,"LPDMember" : "true", format:"ajax"});
	          }
	          else if($(this).hasClass('zs100'))
             {
	          	var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscription, {email:email,"ZS100BrandPage" : true, format:"ajax"});
	          }
	          else{
	                var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscription, {email:email,"shopPCECmember":true,format:"ajax"});
	          }
	          /* PANC-1575 END*/
	          app.ajax.getJson({
	                url: url,
	                callback: function(data) {
	                      $this.find('.success-fail-msg > span').fadeOut();
	                      if(data.success){
	                            $this.find('.success-msg').fadeIn();
	                      }else{
	                            $this.find('.error-msg').fadeIn(); 
	                      }
	                }
	          });
	    });
            
		
 /*Customer Profile checkbox optin and optout we need to call  EmailSubcriptions(Marketo)*/
	/*Commenting this as part of PANC-1771	        
		$(document).ready(function()
			     {
		    	    var flag1= $(this).find(':checkbox').is(':checked');
				    if($('#dwfrm_profile_customer_emailnew').val()!=null)
					{  
						 var email = $('#dwfrm_profile_customer_emailnew').val(); 
						 var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscriptionprofile, {email:email,"optin":flag1,"shopPCECmember":true,format:"ajax"});
						 app.ajax.getJson({
											url: url
										 });
				    } 					 
				 });
		   
			 $(document).on("change", ".input-checkbox" ,function(e)
			  { 
				 var flag1= $(this).is(':checked');				
			      if($('#dwfrm_profile_customer_emailnew').val()!=null)
				   {
					  var email = $('#dwfrm_profile_customer_emailnew').val(); 
					  var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscriptionprofile, {email:email,"optin":flag1,"shopPCECmember":true , format:"ajax"});
					  app.ajax.getJson({
										 url: url
									  });
				  } 
			   });	
	*/
      /*Billing page call  Marketo on Change*/
		    var prof; 
			 $(document).on("change", ".input-checkbox" ,function(e)
			   { 
				      var flag= $(this).is(':checked');
				      /* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
					  var email=$('#dwfrm_billing_billingAddress_email_emailAddress').val().toLowerCase();
					  /* PANC-1797 END */
					  var first=$('#dwfrm_billing_billingAddress_addressFields_firstName').val();
					  var last=$('#dwfrm_billing_billingAddress_addressFields_lastName').val();
					  if(email!=null && email!="")
					  {
					         var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscriptionBilling,{email:email,"optin":flag,"first":first,"last":last,"shopPCECmember":true,format:"ajax"});
					         app.ajax.getJson({
										         url: url
									          });
					         prof="true";
					  }
			  });	
			
			 /*
			 $(document).ready(function()
			  {
				 var flag= $(this).find(':checkbox').is(':checked');
				 var email=$('#dwfrm_billing_billingAddress_email_emailAddress').val();
				 var first=$('#dwfrm_billing_billingAddress_addressFields_firstName').val();
				 var last=$('#dwfrm_billing_billingAddress_addressFields_lastName').val();
				  if(email!=null && email!="")
					{ 
					   var login="profile";
					   var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscriptionBilling,{email:email,"optin":flag,"first":first,"last":last,"login":login,format:"ajax"});
				         app.ajax.getJson({
									         url: url
								          });
					}
			  });
			*/
			 
			 $('.continueOnBilling_marketo').on('click', function () 
			  {     
			  		/* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
				    var email=$("#dwfrm_billing_billingAddress_email_emailAddress").val().toLowerCase();
				    /* PANC-1797 END */
				    var flag=$("#dwfrm_billing_billingAddress_addToEmailList").attr("checked") ? true : false;
				    var first=$("#dwfrm_billing_billingAddress_addressFields_firstName").val();
					var last=$("#dwfrm_billing_billingAddress_addressFields_lastName").val();
					
					if(email!=null && email != "" && first!=null && last!=null)
				     {
				    	 var url = app.util.appendParamsToUrl(app.urls.marketoEmailSubscriptionBilling,{email:email,"optin":flag,"first":first,"last":last,"shopPCECmember":true,format:"ajax"});
				         app.ajax.getJson({
									         url: url
								          });
				     }
				}).change();
			
			 
		/*PANC-789 : BUSINESS link on the header
		 * $(document).find('.business_link').click(function(e){
			e.preventDefault();
			app.util.scrollBrowser($('#footer').offset().top);
		});*/

		var deviceAgent = navigator.userAgent.toLowerCase(),
	    	deviceType = deviceAgent.match(/(iphone|ipod|ipad|android|blackBerry)/);
	    if(deviceType){
	    	$('body').addClass('panasonic_device');
	    }

	    $('#wrapper a[target="_blank"]').on('click', function(e){
	    	e.stopPropagation();
	    });


	 /* Store locator event starts*/
		//PDP storelocator
		$('#pdpMain').on("click", "#add-to-cart.find-store-pdp", function (e) {
			  e.preventDefault();
			  if(app.enabledStorePickup){
				  var url  = $(this).attr('store-url');
				  intializeMapwindow(url);
			  }else{
				  return false;
			  }
		});
		//Footer click
		$('.footer_menu_content').on("click", ".footer-store-locator", function (e) {
			  e.preventDefault();
			  if(app.enabledStorePickup){
				  var url  = $(this).attr('href');
				  intializeMapwindow(url);
			  }else{
				  return false;
			  }
		});
		//Find store click function
		function intializeMapwindow(rurl){

			  var url =   rurl;
			  app.dialog.open({url: url, options: {open: function() {
                	  app.tooltips.init();
                	  app.validator.init();
                	  app.storeLocator.initiateDefaultMap();
                	  //Ajax call
	                  	$('.store-locator-main').on("click", ".find-store-btn button", function (e) {
	                  		e.preventDefault();
	                  		if($(this).closest('form').valid()){
	                  			 app.progress.show('.store-locator-main');
	                  			 app.ajax.load({
				          				url: app.urls.showStores,
				          				data:$(this).closest('form').serialize(),
				          				callback : function (data) {
				          					$('.store-locator-main').html($(data).filter('.store-locator-main').html());
				          					app.storeLocator.init();
				          					app.validator.init();
				          					app.progress.hide();
				          					$('.custom-scroll').slimScroll({
				          						height: '150px'
				          					});
				          				}
				          			});
	                  		}else{
	                  			return false;
	                  		}

	                  	});
					  },close: function() {
					                  //window.location.href = app.urls.cartShow;
					  },
					    width:1077,
					    height:'auto',
					    dialogClass:"store-overlay-pdp",
					    title: "Panasonic Store Locator"
					  }});
		}
		/* Store locator event ends*/
	}
	/**
	 * @private
	 * @function
	 * @description Adds class ('js') to html for css targeting and loads js specific styles.
	 */
	function initializeDom() {
		// add class to html for css targeting
		$('html').addClass('js');
		if (app.clientcache.LISTING_INFINITE_SCROLL){
			$('html').addClass('infinite-scroll');
		}
		// load js specific styles
		app.util.limitCharacters();
	} 
	/* Farhan's dev team PANC-1201 17/02/2016 12:45pm */
	function scrolltoorderstatus(){ 
    	if($('.login-order-track').find('.error-form').length > 0){
        	app.util.scrollBrowser($('.login-order-track').offset().top);
		}  else{
			$("#dwfrm_ordertrack").find("input[type=text]").val("");
		}
 	}
 	/* End of  PANC-1201 17/02/2016 12:45pm */
 	
	/**
	 * @property {Object} _app "inherits" app object via $.extend() at the end of this seaf (Self-Executing Anonymous Function)
	 */
	var _app = {
		containerId		: "content",
		ProductCache	: null,  // app.Product object ref to the current/main product
		ProductDetail	: null,
		clearDivHtml	: '<div class="clear"></div>',
		currencyCodes	: app.currencyCodes || {}, // holds currency code/symbol for the site

		/**
		 * @name init
		 * @function
		 * @description Master page initialization routine
		 */
		init: function () {

			if (document.cookie.length===0) {
				$("<span/>").addClass("browser-compatibility-alert").appendTo("#browser-cookie-check");
				$("<p/>").addClass("browser-error").html(app.resources.COOKIES_DISABLED).appendTo("#browser-cookie-check");
				$("#browser-cookie-check").show();
			}


			// init global cache
			initUiCache();

			// init global dom elements
			initializeDom();

			// init global events
			initializeEvents();

			// init specific global components
			app.tooltips.init();
			app.minicart.init();
			app.validator.init();
			app.components.init();
			app.searchplaceholder.init();
			app.mulitcurrency.init();
			app.uievents.init();
			// execute page specific initializations
			var ns = app.page.ns;
			if (ns && app[ns] && app[ns].init) {
				app[ns].init();
			}
			scrolltoorderstatus();

			/*for browsera test */
			$(document).ready(function(){
				runBrowseraTest();
			});
			/*for browsera test */

			$(window).resize(function(){
				app.dialogposition.init();
			});
		//Start JIRA PREV-43 : In RWD,  On Single click on cart icon in the header navigates to cart page.Added to check the device.
			var deviceAgent = navigator.userAgent.toLowerCase();
			var agentID = deviceAgent.match(/(iphone|ipod|ipad|android|blackBerry)/);
				if(agentID){
					$('body').addClass('panasonic_device');
		}
		//End JIRA PREV-43

		app.salesforce.init();
		//app.hometeam.init();
		app.latestNews.init();
		}
	};

	return $.extend(app, _app);
}(window.app = window.app || {}, jQuery));

/* HomeTeam Events */
/*
(function(app, $) {
	var body = document.body,
    	html = document.documentElement;

	function seeMoreLessEvent() {
		$('#see-more-less-btn').on('click', function() {
			var $this = $(this),
				faqs = $('#faq-container'),
				articles = faqs.find('article');

			for (var i = 3, len = articles.length; i < len; i++) {
				$(articles[i]).toggle();
			}

			if($(articles[i - 1]).css('display') === 'none') {
				$this.html('SEE MORE +');
				window.scrollTo(0, $('#faq-container').offset().top);
			} else {
				$this.html('SEE LESS -');
			}
		});
	}

	function leftNavigationScroll() {
		$(window).scroll(function() {
			var footerOffset = $('#footer').offset().top - $('#body-wrap').offset().top,
				pageOffset = window.pageYOffset,
				leftnavDivHeight = $('#left-navigation-container').css('height').split('px')[0] | 0,
				leftnavContainerTopPadding = $('#left-nav-wrapper').css('padding-top').split('px')[0] | 0;

			if(footerOffset <= pageOffset + leftnavDivHeight) {
				pageOffset = footerOffset - leftnavDivHeight - leftnavContainerTopPadding;
			}

			$('#left-navigation-container').css('top', pageOffset);
		});
	}

	function playVideo() {
		$('#video-container').on('click', function() {
			var $this = $(this),
				videoContent = $this.find('img');
				videoPath = videoContent.attr('data-videopath');

			videoContent.hide();
			videoPath = videoPath.indexOf('https:') != -1 ? videoPath.replace('https:','') :videoPath.replace('http:','');
			videoPath = window.location.protocol + videoPath;
			videoContent.parent().append('<iframe src="'+ videoPath +'" width="740" height="408" frameborder="0" allowfullscreen></iframe>');
		});
	}

	function secondLiveChatLink() {
		$('#live-chat-questions').on('click', function() {
			var livechatItem = $('#live-chat-item'),
				chatLink = livechatItem.find('a[id^="liveagent_button_online_"'),
				dummyDiv = livechatItem.find('div[id^="liveagent_button_offline_"');

			if (chatLink.css('display') === 'none') {
				dummyDiv.find('a').trigger('onclick');
			} else {
				chatLink.trigger('onclick');
			}
		});
	}

	app.hometeam = {
		init: function() {
			seeMoreLessEvent();
			leftNavigationScroll();
			playVideo();
			secondLiveChatLink();
		}
	}
}(window.app = window.app || {}, jQuery));
*/ 
(function(app, $) {
	function filterCallback(data) {
		$('.news-searchresults-list').remove();
		$('.news-searchresults-pager').remove();
		$('#empty-search').remove();
		$('#main').append(data);
		window.scrollTo(0, $('#news-search-form').offset().top);
	}

	function buildSearchQuery(yearFilter, contentFilter) {
		var search = location.search.substring(1),
			parameters = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, ' ') + '"}'),
			url;

		parameters.selectedDate = yearFilter;
		parameters.fdid = contentFilter;
		url = app.util.appendParamsToUrl(app.urls.filterByDate, parameters);

		return url;
	}

	function filterByDate() {
		$('#year-filter').on('change', function() {
			var yearFilter = $(this).find(':selected').val(),
				contentFilter = $('#content-filter').find(':selected').val(),
				url = buildSearchQuery(yearFilter, contentFilter);

			app.ajax.load({
				url: url,
				dataType: 'html',
				callback: filterCallback
			});
		});
	}

	function filterByContent() {
		$('#content-filter').on('change', function() {
			var contentFilter = $(this).find(':selected').val(),
				yearFilter = $('#year-filter').find(':selected').val(),
				url = buildSearchQuery(yearFilter, contentFilter);

			app.ajax.load({
				url: url,
				dataType: 'html',
				callback: filterCallback
			});
		});
	}

	function aboutusPaging() {
		$('#main').on('click', '#about-us-pagination .page-index', function(e) {
			e.preventDefault();

			var hrefParameters = $(this).attr('href').split('?')[1],
				yearFilter = $('#year-filter').find(':selected').val(),
				contentFilter = $('#content-filter').find(':selected').val(),
				parameters = JSON.parse('{"' + decodeURI(hrefParameters).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, ' ') + '"}');

			parameters.selectedDate = yearFilter;
			parameters.fdid = contentFilter;

			app.ajax.load({
				url: app.util.appendParamsToUrl(app.urls.filterByDate, parameters),
				dataType: 'html',
				callback: filterCallback
			});
		});
	}

	function sortingRules() {
		$('#sorting-rules').on('click', 'a[class^="article-"]', function(e) {
			e.preventDefault();

			var $this = $(this),
				hrefParameters = $this.attr('href').split('?')[1],
				yearFilter = $('#year-filter').find(':selected').val(),
				contentFilter = $('#content-filter').find(':selected').val(),
				parameters = JSON.parse('{"' + decodeURI(hrefParameters).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\+/g, ' ') + '"}');

			parameters.selectedDate = yearFilter;
			parameters.fdid = contentFilter;

			var sortingDirection = hrefParameters.substr(hrefParameters.lastIndexOf('psortd1=') + 8, 1);

			if (sortingDirection == 1) {
				$this.attr('href', $this.attr('href').replace('psortd1=1','psortd1=2'));
				$this.removeClass('sort--descending').addClass('sort--ascending');
			} else {
				$this.attr('href', $this.attr('href').replace('psortd1=2','psortd1=1'));
				$this.removeClass('sort--ascending').addClass('sort--descending');
			}

			app.ajax.load({
				url: app.util.appendParamsToUrl(app.urls.filterByDate, parameters),
				dataType: 'html',
				callback: filterCallback
			});
		});
	}

	app.latestNews = {
		init: function() {
			filterByDate();
			filterByContent();
			aboutusPaging();
			sortingRules();
		}
	}
}(window.app = window.app || {}, jQuery));
/**
@class app.storeLocator
*/
(function (app, $) {
	app.storeLocator = {
		init : function () {

		  //Load Google map API
		  if($('.sf-wrapper-inner .g-store').length > 0){
			   //$.getScript('//maps.googleapis.com/maps/api/js?sensor=false');
			  //Prevent other click
			  	 $('.store-click').click(function(e) {
	    		     e.preventDefault();
	    		  });
			  // map code starts
			  	   var bounds = new google.maps.LatLngBounds();
		    	   var myLatlng = new google.maps.LatLng(37.09024, -95.712891);
		    	   var myOptions = {center: myLatlng,zoom:10,mapTypeId: google.maps.MapTypeId.ROADMAP};
		    	   var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		      // custom marker icon
				    //var myMarkerIcon = new google.maps.MarkerImage(app.urls.markerImg);
				    var myMarkerIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|0f58a8|FFFFFF');
					var markers = [];
			  //Iterate all the store
			  jQuery('.sf-wrapper-inner .g-store').each(function(e){
				   var Store = $(this);
				   var myLatlng = new google.maps.LatLng(Store.attr('latitude'),Store.attr('longitude'));
				   var markerContent = Store.find('.gstore-hidden-infowindow').html();
				   myMarkerIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+(e+1)+'|0f58a8|FFFFFF');
				   var marker = new google.maps.Marker({
				        position: myLatlng,
				        map: map,
				        title: Store.attr('store-name'),
				        content: markerContent,
				        icon: myMarkerIcon
					});

				   	bounds.extend(myLatlng);
					markers.push(marker);
				});
			  	window.gmarkers = markers;
			  //open info windows
				var infowindow = new google.maps.InfoWindow({
					content: 'loading...'
				});

				for (var i = 0; i < markers.length; i++) {
					var marker = markers[i];
					marker.index = i;
					    // click events for the map and listings
					    google.maps.event.addListener(marker, 'click', function () {
						// where I have added .html to the marker object.
						infowindow.setContent(this.content);
						infowindow.open(map, this);
						map.setCenter(marker.getPosition());
						// scroll the pane to the top
					});
				}
			//rebind the map
				setTimeout( function() { map.fitBounds( bounds ); }, 1 );
				jQuery('.store-click').each(function(i){
					jQuery(this).bind('click',function(e){
						e.preventDefault();
						google.maps.event.trigger(markers[i],'click');
					});
				});


		  }
		},
		initiateDefaultMap : function () {
			//Initiate the default map
			   var bounds = new google.maps.LatLngBounds();
	    	   var myLatlng = new google.maps.LatLng(37.09024, -95.712891);
	    	   var myOptions = {center: myLatlng,zoom:4,mapTypeId: google.maps.MapTypeId.ROADMAP};
	    	   if($("#map_canvas").length > 0){
	    		   var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	    	   }
		}
	};

}(window.app = window.app || {}, jQuery));

/**
@class app.storefront
*/
(function (app, $) {
	var $cache = {};
	app.storefront = {
		init : function () {
			$cache = {
				slide : $('.slide'),
				slider : $('#homepage-slider'),
				wrapper : $('#wrapper')
			};

			/**
			 * @function
			 * @description Triggers the scroll event on a carousel element
			 * @param {Object} carousel
			 */
			function slideCarousel_initCallback(carousel) {

				// create navigation for slideshow
				var numSlides = $('#homepage-slider li').size();
				var slideShowNav = '<div class="jcarousel-control">';
				for( i=1; i <= numSlides; i++) {
					slideShowNav = slideShowNav + '<a href="#" class="link-'+i+'">' + i + '</a>';
				}
				slideShowNav = slideShowNav + '</div>';
				$('#homepage-slider .jcarousel-clip').append(slideShowNav);

			   $('.jcarousel-control a').bind('click', function(e) {
				   e.preventDefault();
			        carousel.scroll(parseInt($(this).text()));
			        return false;
			    });

			   $cache.slide.width($cache.wrapper.width());

			}
			/**
			 * @function
			 * @description Activates the visibility of the next element in the carousel
			 * @param {Object} carousel -- necessity needs TBD!
			 * @param {Object} item --  necessity needs TBD!
			 * @param {Number} idx Index of the item which should be activated
			 * @param {Object} state --  necessity needs TBD!
			 */
			function slideCarousel_itemVisible(carousel, item, idx, state) {
			    //alert('Item #' + idx + ' is visible');
				$('.jcarousel-control a').removeClass('active');
				$('.jcarousel-control').find('.link-'+idx).addClass('active');
				if($('.jcarousel-control').find('a').last().hasClass('active')){
				  setTimeout(function(){ carousel.scroll(1);},3000);
				}
			}

			function onBeforeAnimation_itemsCheck(carousel, item, idx, state){
				 if(!$('.homeFlashbanner').hasClass('loaded')){
					 $('.homeFlashbanner').addClass('loaded');
					 $('.homeFlashbanner #homepage-slider').fadeIn('slow');
					 $('.homeFlashbanner .loader').remove();
				 }
			}

			$cache.slider.jcarousel({
				scroll: 1,
				auto: 4,
				visible: 1,
				buttonNextHTML: null,
				buttonPrevHTML: null,
				itemFallbackDimension: '100%',
				initCallback: slideCarousel_initCallback,
				itemFirstInCallback: slideCarousel_itemVisible,
				itemLoadCallback :  onBeforeAnimation_itemsCheck,
				easing : "linear"
			});


			 $('.lazyload').each(function(i){
				  var $img = $(this).find('img');
				  $img.removeAttr('src');
				  $img.attr('src', $img.attr('data-lazysrc'));
				  $img.load(function(){
					  $(this).closest('.lazyload').addClass('loaded');
					  $(this).closest('.lazyload').show();
				  });
			 });

			if($cache.wrapper.find(".product-tile").length > 1){
				$cache.wrapper.find(".product-tile").syncHeight();
			}

			$cache.wrapper.find('.video-content .spriteico').click(function(){
				$(this).hide();
				var $videocont = $cache.wrapper.find('.video-content .content-slot-image-holder');
				var $videopath = $videocont.find('img').attr('data-videopath');
				$videopath = $videopath.indexOf('https:') != -1 ? $videopath.replace('https:','') :$videopath.replace('http:','');
				$videopath = window.location.protocol + $videopath;
				$videocont.append('<iframe src="'+ $videopath +'" width="100%" height="'+$videocont.find('img').height()+'" frameborder="0" allowfullscreen></iframe>');
			});

		}
	};

}(window.app = window.app || {}, jQuery));


/**
@class app.salesforce
*/
(function (app, $) {
	app.salesforce = {
		init : function () {

			//Category Change
			$('.contact-us-form-wrapper .email-form-holder form').on("change", ".cat-select", function (e) {
				e.preventDefault();
				var cgid =$(this).find(':selected').val();
				var url =  app.urls.showChatDropdowns;
				if(cgid != undefined && cgid != null && cgid.length>0){
					 url = app.util.appendParamsToUrl(url, {cgid:cgid});
				}else{

						if($(this).hasClass('no-sub-onlineitems')){
							  $(this).parent().find('.drop-error').text($(this).closest('td').attr('data-text'));
						  }
						return false;
					}
				//var json  = app.util.getQueryStringParams($('.contact-us-form-wrapper .email-form-holder form').serialize());
				//var json = app.salesforce.serializeObject($('.contact-us-form-wrapper .email-form-holder form'));
				app.progress.show($('.contact-us-form-wrapper .email-form-holder form'));
				app.ajax.load({
					url: url,
					callback : function (data) {
						if(($('.contact-us-form-wrapper .email-form-holder form .category-blk-holder')!= undefined && $('.contact-us-form-wrapper .email-form-holder form .category-blk-holder').length >0) && ($(data).find('.contact-us-form-wrapper .email-form-holder form .category-blk-holder')!= undefined && $(data).find('.contact-us-form-wrapper .email-form-holder form .category-blk-holder').length > 0)){
							$('.contact-us-form-wrapper .email-form-holder form .category-blk-holder').html($(data).find('.contact-us-form-wrapper .email-form-holder form .category-blk-holder').html());
							//app.salesforce.updateFormWithJsonData(json,$('.contact-us-form-wrapper .email-form-holder form'));
							app.uievents.init();
							//app.util.limitCharacters();
							app.progress.hide();
							//Making drop value null if no online category or products available
							if($('.cat-select.error') != undefined && $('.cat-select.error').length > 0){
								$('.cat-select.error').val('');
								$('.cat-select.error').closest('td').removeAttr("class");
								$('.cat-select.error').closest('td').removeAttr("data-required-text");
							}
					  }
					}
				});


			});

			//Open chat popup
			if(app.enableSalesforceChat ){
				$('.live-chat-link').unbind('click').on("click", function (e) {
					e.preventDefault();
					if($(this).hasClass('post-chat')){
						//First Check On-line
						if($('#'+app.SALESFORCE_POST_ONLINE_ID) != undefined && $('#'+app.SALESFORCE_POST_ONLINE_ID).length > 0 && $('#'+app.SALESFORCE_POST_ONLINE_ID).css('display') != 'none'){
							$('#'+app.SALESFORCE_POST_ONLINE_ID).unbind('click').click();
						}else{
							if(($('#'+app.SALESFORCE_POST_OFFLINE_ID) != undefined && $('#'+app.SALESFORCE_POST_OFFLINE_ID).length > 0) && ($('#'+app.SALESFORCE_POST_OFFLINE_ID+' a') != undefined && $('#'+app.SALESFORCE_POST_OFFLINE_ID+' a').length > 0)){
								$('#'+app.SALESFORCE_POST_OFFLINE_ID+' a').unbind('click').click();
							}else{
								return false;
							}
						}
					}else if($(this).hasClass('pre-chat')){
						//First Check On-line
						if($('#'+app.SALESFORCE_PRE_ONLINE_ID) != undefined && $('#'+app.SALESFORCE_PRE_ONLINE_ID).length > 0 && $('#'+app.SALESFORCE_PRE_ONLINE_ID).css('display') != 'none'){
							$('#'+app.SALESFORCE_PRE_ONLINE_ID).unbind('click').click();
						}else{
							if(($('#'+app.SALESFORCE_PRE_OFFLINE_ID) != undefined && $('#'+app.SALESFORCE_PRE_OFFLINE_ID).length > 0) && ($('#'+app.SALESFORCE_PRE_OFFLINE_ID+' a') != undefined && $('#'+app.SALESFORCE_PRE_OFFLINE_ID+' a').length > 0)){
								$('#'+app.SALESFORCE_PRE_OFFLINE_ID+' a').unbind('click').click();
							}else{
								return false;
							}
						}
					}
				});
			}
		},
		updateFormWithJsonData : function (json,form) {
			for(var key in json){
	            var attrKey = key;
	            var attrValue = json[key];
	            if(form.find('input[name='+attrKey+']').length > 0 && form.find('input[name='+attrKey+']').prop('tagName') != 'SELECT'){
	            	form.find('input[name='+attrKey+']').attr('value',attrValue);
	            }
	            //Stae value assign ajax
	            if(form.find('select[name='+attrKey+']').length > 0 && (form.find('select[name='+attrKey+']').prop('tagName') == 'SELECT') && (form.find('select[name='+attrKey+']').attr('flag') != undefined && form.find('select[name='+attrKey+']').attr('flag')=='state')){
	            	form.find('select[name='+attrKey+']').attr('value',attrValue);
	            	form.find('select[name='+attrKey+']').trigger('change');

	            }
	            //Text area assign ajax
	            if(form.find('textarea[name='+attrKey+']').length > 0 ){
	            	form.find('textarea[name='+attrKey+']').attr('value',attrValue);

	            }
	        }
		},
		serializeObject : function (form) {
			var o = {};
		    var a = form.serializeArray();
		    $.each(a, function() {
		        if (o[this.name] !== undefined) {
		            if (!o[this.name].push) {
		                o[this.name] = [o[this.name]];
		            }
		            o[this.name].push(this.value || '');
		        } else {
		            o[this.name] = this.value || '';
		        }
		    });
		    return o;
		}

	};

}(window.app = window.app || {}, jQuery));




/**
@class app.tooltip
*/
(function (app, $) {
    var $cache = {};
    app.tooltips = {
        /**
         * @function
         * @description Initializes the tooltip-content and layout
         */
        init : function () {

        	var tooltiptimer = {
        			id : null,
        			clear : function () {
        				if(tooltiptimer.id) {
        					window.clearTimeout(tooltiptimer.id);
        					delete tooltiptimer.id;
        				}
        			},
        			start : function (duration) {
        				tooltiptimer.id = setTimeout(function(){
        					 $con.find('.customtooltip-container').fadeOut(500, function(){
        		                	$(this).removeAttr('style').removeClass('visible');
        		                	$con.find('.customtooltip-container .customtooltip-info').html('');
        		                });
        				}, duration);
        			}
        		};

            var $con = $('body');

            if($con.find('.customtooltip-container').length == 0){
                $con.append('<div class="customtooltip-container"><span class="customtooltip-x"></span><div class="customtooltip-info"></div></div>');
                $con.find('.customtooltip-container').hide();
            }


            $con.find('.tooltip').unbind('click').on('click', function(e){
            	e.preventDefault();
            	if(!$(this).hasClass('current')){
	        		 $con.find('.customtooltip-container').removeClass('visible');
	                 $con.find('.customtooltip-container .customtooltip-info').html('');
            		 $(this).addClass('current');
            	}

                var $container = $con.find('.customtooltip-container'),
                    $left = e.pageX,
                    $top = $(this).offset().top + $(this).outerHeight(),
                    $leftCont = e.pageX + $container.outerWidth(),
                    $topCont = e.pageY + $(this).outerHeight() + $container.outerHeight();
                    if($container.hasClass('visible')){return false;}

                    $container.find('.customtooltip-info').html('').html($(this).find('.tooltip-content').html());
                    $container.find('.customtooltip-info')
                    $container.removeAttr('style').css({'left':$left,'top':$top});
                    if($leftCont <= $(window).width()){
                        if(app.util.elementInViewport($container.get(0), -($container.outerHeight() + 10))){
                            $container.removeAttr('style').css({'left':$left,'top':$top});
                        }else{
                            $container.removeAttr('style').css({'left':$left,'top':$top - ($container.outerHeight() + $(this).outerHeight())});
                        }
                    }else{
                        if(app.util.elementInViewport($container.get(0), -($container.outerHeight() + 10))){
                            $container.removeAttr('style').css({'left':$left - $container.outerWidth(),'top':$top});
                        }else{
                            $container.removeAttr('style').css({'left':$left - $container.outerWidth(),'top':$top - ($container.outerHeight() + $(this).outerHeight())});
                        }
                    }
                $container.addClass('visible').fadeIn();
            });

            $con.find('.customtooltip-x').unbind('click').on('click', function(e){
            	tooltiptimer.start(30);
            });

            $con.find('.customtooltip-container').on('mouseleave', function(e){
            	tooltiptimer.start(2000);
            }).on('mouseenter', function(e){
            	tooltiptimer.clear();
            });


            //.mousemove(function(e){
           	 // var $container = $con.find('.customtooltip-container'),
               //  $left = e.pageX,
               //  $top = e.pageY,
               //  $leftCont = e.pageX + $container.outerWidth(),
               //  $topCont = e.pageY + $(this).outerHeight() +  + $container.outerHeight();
           	//  if($container.hasClass('visible')){
           	//	  if($leftCont <= $(window).width()){
               //		  $container.css({'left':$left});
              //	  }else{
               //		  $container.css({'left':$left - $container.outerWidth()});
               //	  }
           	//  }
           	//  tooltiptimer.clear();
          // })
        }
    };

}(window.app = window.app || {}, jQuery));


/**
 @class app.product
 */
(function (app, $) {
	var $cache;

	/*************** app.product private vars and functions ***************/

	/**
	 * @private
	 * @function
	 * @description Loads product's navigation on the product detail page
	 */
	function loadProductNavigation() {
		var pidInput = $cache.pdpForm.find("input[name='pid']").last();
		var navContainer = $("#product-nav-container");
		// if no hash exists, or no pid exists, or nav container does not exist, return
		if (window.location.hash.length <= 1 || pidInput.length===0 || navContainer.length===0) {
			return;
		}

		var pid = pidInput.val();
		var hashParams = window.location.hash.substr(1);
		if (hashParams.indexOf("pid="+pid) < 0) {
			hashParams+="&pid="+pid;
		}

		var url = app.urls.productNav+(app.urls.productNav.indexOf("?") < 0 ? "?" : "&")+hashParams;
		app.ajax.load({url:url, target: navContainer});
	}

	/**
	 * @private
	 * @function
	 * @description Creates product recommendation carousel using jQuery jcarousel plugin
	 */
	function loadRecommendations() {
		var carousel = $("#carousel-recomendations");
		if(!carousel || carousel.length === 0 || carousel.children().length === 0) {
			return;
		}

		carousel.jcarousel(app.components.carouselSettings);
	}

	/**
	 * @function
	 * @description Sets the main image attributes and the href for the surrounding <a> tag
	 * @param {Object} atts Simple object with url, alt, title and hires properties
	 */
	function setMainImage(atts) {
		var imgZoom = $cache.pdpMain.find("a.main-image");
		if (imgZoom.length>0 && atts.hires && atts.hires!='' && atts.hires!='null') {
			imgZoom.attr("href", atts.hires);
		}

		imgZoom.find("img.primary-image").attr({
			"src" : atts.url,
			"alt" : atts.alt,
			"title" : atts.title
		});
	}

	/**
	 * @function
	 * @description helper function for swapping main image on swatch hover
	 * @param {Element} element DOM element with custom data-lgimg attribute
	 */
	function swapImage(element) {
		var lgImg = $(element).data("lgimg");
        if (lgImg) {
			var newImg = $.extend({}, lgImg);
			var imgZoom = $cache.pdpMain.find("a.main-image");
			var mainImage = imgZoom.find("img.primary-image");
			// store current image info
			lgImg.hires = imgZoom.attr("href");
			lgImg.url = mainImage.attr("src");
			lgImg.alt = mainImage.attr("alt");
			lgImg.title = mainImage.attr("title");
			// reset element's lgimg data attribute
			$(element).data(lgImg);
			// set the main image
			setMainImage(newImg);
        }
	}


	/**
	 * @function
	 * @description Enables the zoom viewer on the product detail page
	 */
	function loadZoom() {
		if(app.quickView.isActive() || !app.zoomViewerEnabled) { return; }

		//zoom properties
		var options = {
			zoomType: 'standard',
			alwaysOn : 0, // setting to 1 will load load high res images on page load
			zoomWidth : 450,
			zoomHeight : 350,
			position:'right',
			preloadImages: 0, // setting to 1 will load load high res images on page load
			xOffset: 25,
			yOffset:0,
			showEffect : 'show',
			hideEffect: 'hide'
		};

		// Added to prevent empty hires zoom feature (if images don't exist)
		var mainImage = $cache.pdpMain.find("a.main-image");
		var hiresImageSrc = mainImage.attr("href");
		if( hiresImageSrc && hiresImageSrc != '' && hiresImageSrc.indexOf('noimagelarge')<0 ) {
			mainImage.removeData("jqzoom").jqzoom(options);
		}
	}
	
	/**
	* @description Initialize Amplience Dynamic Images.
	*/
	var initAmpDI = function () {
		var amp = window.amp = window.amp || {};
		if ( 'dwInit' in amp && typeof amp.dwInit == 'function' ) {
			amp.dwInit.call(amp);
		}
	};
	/**
	 * @function
	 * @description replaces the images in the image container. for example when a different color was clicked.
	 */
	function replaceImages() {
		var newImages = $("#update-images");
		var imageContainer = $cache.pdpMain.find("div.product-image-container");

		imageContainer.html(newImages.html());
		newImages.remove();
		setMainImageLink();

		loadZoom();
		initAmpDI(); // call initAmpDI here
	}
	/**
	 * @function
	 * @description Adds css class (image-zoom) to the main product image in order to activate the zoom viewer on the product detail page.
	 */
	function setMainImageLink() {
		if (app.quickView.isActive() || app.isMobileUserAgent) {
			$cache.pdpMain.find("a.main-image").removeAttr("href");
		}
		else {
			$cache.pdpMain.find("a.main-image").addClass("image-zoom");
		}
	}
	/**
	 * @function
	 * @description Removes css class (image-zoom) from the main product image in order to deactivate the zoom viewer on the product detail page.
	 */
	function removeImageZoom() {
		$cache.pdpMain.find("a.main-image").removeClass("image-zoom");
	}

	/**
	 * @function
	 * @description pdp infinitescroll function
	 */
	function pdpinfinitescroll() {
		// getting the hidden div, which is the placeholder for the next page
		var loadingPlaceHolder = $cache.pdplazyload;
		// get url hidden in DOM
		var gridUrl = loadingPlaceHolder.attr('data-placeholder');
		var layloadcont = $cache.pdpMain.find('.pdplazyload');
		var currentdata = '';

		if($cache.footerTop != $('body #footer').offset().top){
			$cache.footerTop = $('body #footer').offset().top
		}

		$cache.stop = $cache.footerTop - $cache.headerheight;

		if($(this).scrollTop() >= $cache.start && $(this).scrollTop() < ($cache.stop - 100)){
			$cache.pdpMain.find('.pdp-left-holder').css('top', $(this).scrollTop() - $cache.start + 20);
		}else if($(this).scrollTop() <= ($cache.start - 30)){
			$cache.pdpMain.find('.pdp-left-holder').removeAttr('style');
		}

		if($('#pdp-reviews-block').length > 0 && app.util.elementInViewport($('#pdp-reviews-block').get(0), 250)){
			app.product.reviewsimg();
		}

		if(loadingPlaceHolder.hasClass('loading') || loadingPlaceHolder.hasClass('endscroll')){
			return false;
		}

		if($("#BVRRRatingSummaryNoReviewsWriteImageLinkID").length > 0){
			gridUrl = app.util.appendParamsToUrl(gridUrl, {'hidereviews':'true'});
		}

		if (loadingPlaceHolder.length == 1 && app.util.elementInViewport(loadingPlaceHolder.get(0), 250)) {
			// switch state to 'loading'
			// - switches state, so the above selector is only matching once
			// - shows loading indicator
			loadingPlaceHolder.addClass('loading');

			var pdpinfinitedata = function (html) {
				loadingPlaceHolder.removeClass('loading');
				if($(html).find('.pdplazyload').eq($('.pdplazyload').length).length != 0){
					currentdata = $(html).find('.pdplazyload').eq($('.pdplazyload').length).clone();
					$cache.pdpMain.find('.pnsb2c-pdp-right').append(currentdata);


					if($("#BVRRContainer").length > 0 && !$('.product-reviews-tabs').hasClass('loaded')){
						app.bvconfig.init();
					}

					$cache.pdpMain.find(".pdplazyload").fadeTo("slow", 1, function(){
						app.product.reviewsimg();
					});

					$('.product-reviews-tabs').addClass('loaded');
					if($(".pnsb2c-pdp-left").hasClass('loaddelay')){
						$(".pnsb2c-pdp-left .prod-info-ul li.active a").trigger('click');
						$(".pnsb2c-pdp-left").removeClass('loaddelay');
					}
					initializeEvents();
				}else{
					loadingPlaceHolder.addClass('endscroll');
					loadingPlaceHolder.hide();
				}
			};


			if(sessionStorage["pdp-cache_" + gridUrl]){
				pdpinfinitedata(sessionStorage["pdp-cache_" + gridUrl]);
			}else{
				jQuery.ajax({
					type: "GET",
					dataType: 'html',
					url: gridUrl,
					success: function(response) {
						// put response into cache
						try {
							sessionStorage["pdp-cache_" + gridUrl] = response;
						} catch (e) {
							// nothing to catch in case of out of memory of session storage
							// it will fall back to load via ajax
						}
						pdpinfinitedata(response);
					}
				});
			}
		}
	}


	//Load first item from lazyload by default
	function pdploadfirstitem(){
		if(!app.util.readCookie('viewreviews') || app.util.readCookie('viewreviews') == "false"){
			var gridUrl = $cache.pdplazyload.attr('data-placeholder');
			var pdpinfinitedata = function(response){
				var currentdata = $(response).find('.pdplazyload').eq($('.pdplazyload').length).clone();
				$cache.pdpMain.find('.pnsb2c-pdp-right').append(currentdata);
				$cache.pdpMain.find(".pdplazyload").fadeTo("slow", 1);
				var overviewimg = $('.pnsb2c-pdp-right .features-block img');
				overviewimg.on('load', function(){
					$(this).addClass('loaded');
				}).on('error', function(){
					$(this).addClass('loaded');
				});
			}
			if(sessionStorage["pdp-cache_" + gridUrl]){
				pdpinfinitedata(sessionStorage["pdp-cache_" + gridUrl]);
			}else{
				jQuery.ajax({
					type: "GET",
					dataType: 'html',
					url: gridUrl,
					success: function(response) {
						// put response into cache
						try {
							sessionStorage["pdp-cache_" + gridUrl] = response;
						} catch (e) {
							// nothing to catch in case of out of memory of session storage
							// it will fall back to load via ajax
						}
						pdpinfinitedata(response);
					}
				});
			}
		}
	}


	/**
	 * @private
	 * @function
	 * @description Initializes the DOM of the product detail page (images, reviews, recommendation and product-navigation).
	 */
	function initializeDom() {
		$cache.pdpMain.find('div.product-detail .product-tabs').tabs();
		if($('#pwrwritediv').length > 0) {
			var options = $.extend(true, {}, app.dialog.settings, {
				autoOpen : true,
				height : 750,
				width : 650,
				dialogClass : 'writereview',
				title : 'Product Review',
				resizable : false
			});

			app.dialog.create({
				target : app.ui.reviewsContainer,
				options : options
			});
		}

		loadRecommendations($cache.container);
		loadProductNavigation();
		setMainImageLink();
		if(!app.enableLazyLoad && $('#pdp-reviews-block').length > 0){
			app.product.reviewsimg();
		}
		$(window).on('scroll', function(){
			if(app.enableLazyLoad){
				pdpinfinitescroll();
			}else{
				if($cache.footerTop != $('body #footer').offset().top){
					$cache.footerTop = $('body #footer').offset().top
				}

				$cache.stop = $cache.footerTop - $cache.headerheight;

				if($(this).scrollTop() >= $cache.start && $(this).scrollTop() < ($cache.stop - 100)){
					$cache.pdpMain.find('.pdp-left-holder').css('top', $(this).scrollTop() - $cache.start + 20);
				}else if($(this).scrollTop() <= ($cache.start - 30)){
					$cache.pdpMain.find('.pdp-left-holder').removeAttr('style');
				}
			}

		});





		if ($cache.productSetList.length>0) {
			var unavailable = $cache.productSetList.find("form").find("button.add-to-cart[disabled]");
			var unavailable = $cache.productSetList.find("form").find("a.disabled");
			if (unavailable.length > 0) {
				$cache.addAllToCart.attr("disabled", "disabled");
				$cache.addAllToCart.addClass("disabled"); // this may be a set
				$cache.addToCart.attr("disabled", "disabled"); // this may be a bundle

			}else if($cache.addAllToCart.hasClass("disabled")){
					$cache.addAllToCart.removeClass("disabled");
			}
		}
		if(app.enableLazyLoad){
			pdploadfirstitem();
		}
		$cache.pdpMain.find(".accessories-block-li .block-head").each(function(){
			if(($(this).text() == "Featured ")){
				if(!$(this).hasClass('active')){
					$(this).addClass("active");
					$(this).next().slideDown("slow", function(){
						$('.block-content').each(function(){
							$(this).find(".product-tile").removeAttr('style');
							$(this).find(".product-tile").syncHeight();
						});
					});
				}
			}
		});
		app.tooltips.init();
	}
	/**
	 * @private
	 * @function
	 * @description Initializes the cache on the product detail page.
	 */
	function initializeCache() {
		$cache = {
			productId : $("#pid"),
			pdpMain : $("#pdpMain"),
			productContent : $("#product-content"),
			thumbnails : $("#thumbnails"),
			bonusProductGrid : $(".bonusproductgrid"),
			imageContainer : $(".product-primary-image"),
			productSetList : $("#product-set-list"),
			addToCart : $("#add-to-cart"),
			addAllToCart : $(".productset-add-to-cart"),
			pdpLeftAddToCart : $(".pnsb2c-pdp-left").find('form #add-to-cart'),
			pdplazyload : $('.pt_product-details .lazyload-placeholder')
		};
		$cache.detailContent = $cache.pdpMain.find("div.detail-content");
		$cache.pdpForm = $cache.pdpMain.find("form.pdpForm");
		$cache.swatches = $cache.pdpMain.find("ul.swatches");
		$cache.mainImageAnchor = $cache.imageZoom = $cache.imageContainer.find("a.main-image");
		$cache.mainImage = $cache.mainImageAnchor.find("img.primary-image");

		$cache.start = $cache.pdpMain.find('.pdp-left-holder').offset().top;
		$cache.footerTop = $('body #footer').offset().top;
		$cache.headerheight = $cache.pdpMain.find('.pdp-left-holder').outerHeight();
		$cache.stop = 0;
	}

	/**
	 * @private
	 * @function
	 * @description Initializes events on the product detail page for the following elements:<br/>
	 * <p>availability message</p>
	 * <p>add to cart functionality</p>
	 * <p>images and swatches</p>
	 * <p>variation selection</p>
	 * <p>option selection</p>
	 * <p>send to friend functionality</p>
	 */
	function initializeEvents() {

		app.product.initAddThis();

		$cache.pdpMain.find('a[target="_blank"]').on('click', function(e){
	    	e.stopPropagation();
	    });

		if($("ul.pdptiles-carousel").length > 0){
			$("ul.pdptiles-carousel:visible").each(function(){
				if($(this).find('li').length > 5){
					$(this).parent().addClass('jcarousel-auto');
					$(this).jcarousel($.extend({visible : 5}, app.components.carouselSettings));
				}
				$(this).find(".product-tile").removeAttr('style');
				$(this).find(".product-tile").syncHeight();
			});

			$('.block-content:visible').each(function(){
				$(this).find(".product-tile").removeAttr('style');
				$(this).find(".product-tile").syncHeight();
			});

		}

		$cache.pdpMain.find(".positivenumber").keypress(function (e) {
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
			}
		});
		//License agreement dialog in PDP
		var $drivers = $cache.pdpMain.find(".support-content-block .block-content-holder .block-content-head , .firmware-drivers-block .block-content-holder .block-content-head");
		$drivers.each(function(){
			if(($(this).text() == "Drivers and Downloads") || ($(this).text() == "FIRMWARE") || ($(this).text() == "DRIVERS") || ($(this).text() == "OTHER SOFTWARE DOWNLOADS")){
				var $Eula_selector = $(this).closest(".block-content-holder");
				$Eula_selector.find("a").not("a[href$='.pdf'], a[href$='.html']").unbind('click').on("click", function(e){
					e.preventDefault();
					$("#pdp-license-agreement").remove();
					$cache.pdpMain.find("a").removeClass('download-active');
					$(this).addClass('download-active');
					var dlg = app.dialog.create({target:$("#pdp-license-agreement"), options:{
						width:700,
						height:450,
						dialogClass : "pdplicense-dialog",
						title:"License Agreement",
						open: function(){
							$('.pdplicense-dialog #pdp-license-agreement').load(app.urls.LicenseAgreement, function(){
								 downloadfileevents();
							 });
						}
					}});

					dlg.dialog("open");	 // open after load to ensure dialog is centered
				}).on('contextmenu', function(){
					return false;
				});
			}
		});

		function downloadfileevents(){
			$('.pdplicense-dialog .accept-license').unbind('click').on('click', function(e){
				if($(this).is(':checked')){
					$('.pdplicense-dialog .apply-download-file').attr('download', $('.download-active').attr('href'));
					$('.pdplicense-dialog .apply-download-file').attr('href', $('.download-active').attr('href'));
				}else{
					$('.pdplicense-dialog .apply-download-file').removeAttr('download');
					$('.pdplicense-dialog .apply-download-file').attr('href','javascript:void(0)');
				}
			});

			$('.pdplicense-dialog .cancel-download-file').unbind('click').on('click', function(e){
				app.dialog.close();
			});

			$('.pdplicense-dialog .apply-download-file').unbind('click').on('click', function(e){
				if($(this).attr('download')){
					$('.pdplicense-dialog').addClass('downloading');
					setTimeout(function(){
						app.dialog.close();
					});
				}
			}).bind('contextmenu', function(){
				return false;
			});
		}

		if(app.enabledStorePickup){app.storeinventory.buildStoreList($('.product-number span').html());}
		// add or update shopping cart line item
		app.product.initAddToCart();
		//Added for product specification section new req
		if($cache.pdpMain.find('.more-specification-link-holder').length == 0){
			$cache.pdpMain.find('.collapse-all-pdp').hide();
		}
		$cache.pdpMain.on("change keyup", "form.pdpForm input[name='Quantity']", function (e) {
			/*Start JIRA PREV-55:Inventory message is not displaying for the individual product within the product set.
			 * Added var currentForm */
			var currentForm = $(this).closest("form[id]");
			/* Below availabilityContainer variable changed because of pdp inventry message position change */
			//var availabilityContainer = currentForm.find("div.availability");
			var availabilityContainer = $("div.availability");
			//Ajax for shipping
			/*app.ajax.load({
				url: app.util.appendParamsToUrl(app.urls.getProductShippingMessage, {pid:currentForm.find("#pid").val(), Quantity:$(this).val()}),
				callback : function (data) {
					availabilityContainer.find('.default-shippingmethod-msg').html($(data).filter('.default-shippingmethod-msg').html());
				}
			});*/
			//Setting left section qunatity
			$("#pdpMain").find('.pdp-left-content-quantity').val($(this).val());
			//Setting qunatity for MyRegistry
			if($("#pdpMain").find('#MyRegistryWidgetApiContainer').length > 0){
				var quantity = Number($(this).val());
				if((quantity > 1) || (quantity == 1))
					{
						$("#pdpMain").find('#MyRegistryWidgetApiContainer').attr('quantity',quantity);
					}else{
						$("#pdpMain").find('#MyRegistryWidgetApiContainer').attr('quantity',1);
					}
			}
			app.product.getAvailability(
			currentForm.find("#pid").val(),
			//END JIRA - PREV-55
				$(this).val(),
				function (data) {
					if (!data) {
						$cache.addToCart.removeAttr("disabled");
						availabilityContainer.find(".availability-qty-available").html();
						availabilityContainer.find(".availability-msg").show();
						//availabilityContainer.closest('.availability-block').find('.default-shippingmethod-msg').hide();
						return;
					}else{
						var avMsg = null;
						var avRoot = availabilityContainer.find(".availability-msg");
						//Reseting stock message
							avRoot.html('');
						// Look through levels ... if msg is not empty, then create span el
						if( data.levels.IN_STOCK> 0 ) {
							avMsg = avRoot.find(".in-stock-msg");
							if (avMsg.length===0) {
								avMsg = $("<p/>").addClass("in-stock-msg").appendTo(avRoot);
							}
							if( data.levels.PREORDER==0 && data.levels.BACKORDER==0 && data.levels.NOT_AVAILABLE==0 ) {
								// Just in stock
								avMsg.text(app.resources.IN_STOCK);
							} else {
								// In stock with conditions ...
								avMsg.text(data.inStockMsg);
							}
							//availabilityContainer.closest('.availability-block').find('.default-shippingmethod-msg').show();
						}
						if( data.levels.PREORDER> 0 ) {
							avMsg = avRoot.find(".preorder-msg");
							if (avMsg.length===0) {
								avMsg = $("<p/>").addClass("preorder-msg").appendTo(avRoot);
							}
							if( data.levels.IN_STOCK==0 && data.levels.BACKORDER==0 && data.levels.NOT_AVAILABLE==0 ) {
								// Just in stock
								avMsg.text(app.resources.PREORDER);
							} else {
								avMsg.text(data.preOrderMsg);
							}
							/*if( data.inStockDate != '' ) {
								avMsg = avRoot.find(".in-stock-date-msg");
								if (avMsg.length===0) {
									avMsg = $("<p/>").addClass("in-stock-date-msg").appendTo(avRoot);
								}
								avMsg.text(String.format(app.resources.IN_STOCK_DATE,data.inStockDate));

							}*/
						}
						if( data.levels.BACKORDER> 0 ) {
							avMsg = avRoot.find(".backorder-msg");
							if (avMsg.length===0) {
								avMsg = $("<p/>").addClass("backorder-msg").appendTo(avRoot);
							}
							if( data.levels.IN_STOCK==0 && data.levels.PREORDER==0 && data.levels.NOT_AVAILABLE==0 ) {
								// Just in stock
								if(data.isPreorderable !=null && data.isPreorderable !=undefined && data.isPreorderable){
									avMsg.text(app.resources.PREORDER);
								}else{
									avMsg.text(app.resources.BACKORDER);
								}
							} else {
								avMsg.text(data.backOrderMsg);
							}
						/*	if(data.inStockDate != '' && new Date(data.inStockDate).getFullYear() != 9999 && (new Date(data.inStockDate) > new Date())) {

								avMsg = avRoot.find(".in-stock-date-msg");
								if (avMsg.length===0) {
									avMsg = $("<p/>").addClass("in-stock-date-msg").appendTo(avRoot);
								}
								avMsg.text(String.format(app.resources.IN_STOCK_DATE,data.inStockDate));
							}*/
						}
						/*if((parseInt(data.statusQuantity) > parseInt(data.ats)) && data.inStockDate != '' && (new Date(data.inStockDate).getFullYear() != 9999) ) {
							avMsg = avRoot.find(".in-stock-date-msg");
							if (avMsg.length===0) {
								avMsg = $("<p/>").addClass("in-stock-date-msg").appendTo(avRoot);
							}
							avMsg.text(String.format(app.resources.IN_STOCK_DATE,data.inStockDate));
							//availabilityContainer.closest('.availability-block').find('.default-shippingmethod-msg').hide();
						}*/
						if( data.levels.NOT_AVAILABLE> 0 ) {
							avMsg = avRoot.find(".not-available-msg");
							if (avMsg.length===0) {
								avMsg = $("<p/>").addClass("not-available-msg").appendTo(avRoot);
							}
							if( data.levels.PREORDER==0 && data.levels.BACKORDER==0 && data.levels.IN_STOCK==0 ) {
								avMsg.text(app.resources.NOT_AVAILABLE);
							} else {
								avMsg.text(app.resources.REMAIN_NOT_AVAILABLE);
							}
							/*Start JIRA PREV-55:Inventory message is not displaying for the individual product within the product set.
							 Added var currentForm */
							currentForm.find(".add-to-cart").attr("disabled", "disabled");
							$cache.pdpLeftAddToCart.attr("disabled", "disabled");
							$cache.addAllToCart.attr("disabled", "disabled");// this may be set
							$cache.addAllToCart.addClass("disabled"); // this may be set
							//availabilityContainer.closest('.availability-block').find('.default-shippingmethod-msg').hide();
							}else{
							currentForm.find(".add-to-cart").removeAttr("disabled");
							$cache.pdpLeftAddToCart.removeAttr("disabled");
							if ($cache.productSetList.find("button.add-to-cart[disabled]").length==0 || $cache.productSetList.find("form").find("a.disabled").length == 0){
								$cache.addAllToCart.removeAttr("disabled", "disabled");
								$cache.addAllToCart.removeClass("disabled"); // this may be set
							}
							/*END JIRA - PREV-55*/
						}
						return;
					}
					$cache.addToCart.attr("disabled", "disabled");
					availabilityContainer.find(".availability-msg").hide();
					var avQtyMsg = availabilityContainer.find(".availability-qty-available");
					if (avQtyMsg.length===0) {
						avQtyMsg = $("<span/>").addClass("availability-qty-available").appendTo(availabilityContainer);
					}
					avQtyMsg.text(data.inStockMsg).show();

					var avQtyMsg = availabilityContainer.find(".availability-qty-available");
					if (avQtyMsg.length===0) {
						avQtyMsg = $("<span/>").addClass("availability-qty-available").appendTo(availabilityContainer);
					}
					avQtyMsg.text(data.backorderMsg).show();
				});

		});

		// Add to Wishlist and Add to Gift Registry links behaviors
		$cache.pdpMain.on("click", "a.wl-action", function (e) {
			e.preventDefault();

			var data = app.util.getQueryStringParams($("form.pdpForm").serialize());
			if (data.cartAction) {
				delete data.cartAction;
			}
			var url = app.util.appendParamsToUrl(this.href, data);
			url = this.protocol + "//" + this.hostname + ((url.charAt(0)==="/") ? url : ("/"+url));
			window.location.href = url;
		});

		$cache.pdpMain.on("hover", "ul.swatches a.swatchanchor", function () {
			//swapImage(this);
		});

		// productthumbnail.onclick()
		$cache.pdpMain.on("click", "img.productthumbnail", function () {
			var lgImg = $(this).data("lgimg");
			if($(this).closest("li").hasClass("selected")){
				return false;
			}
			// switch indicator
			$cache.pdpMain.find("div.product-thumbnails li.selected").removeClass("selected");
			$(this).closest("li").addClass("selected");

			setMainImage(lgImg);
			// load zoom if not quick view
			if( lgImg.hires != '' && lgImg.hires.indexOf('noimagelarge')<0 ){
				setMainImageLink();
				loadZoom();
			} else {
				removeImageZoom();
			}
		});

			// productthumbnail.onclick()
			/* Farhan's dev team PANC-1593 18/12/2015 12:45pm */
		$cache.pdpMain.on("click", ".video-link ,.support-video-link ", function (e) {
			if($(this).find('img').length>0){
				var lgImg = $(this).find('img').data("lgimg");
				// switch indicator
			$cache.pdpMain.find("div.product-thumbnails li.selected").removeClass("selected");
			$(this).closest("li").addClass("selected");
			}else{
				var lgImg = $(this).find('.supportvideo').data("lgimg");
			}
			var dlg = app.dialog.create({target:$("#pdp-video-dialog"), options:{
				width:800,
				height:450,
				dialogClass : "video",
				title:this.title
			}});

			var url = lgImg.videopath;
			url = url.indexOf('https:') != -1 ? url.replace('https:','') : url.replace('http:','');
			if(url.indexOf('?') == -1){
				url = window.location.protocol + url+"?rel=0&autoplay=1";
			}
			//Current Video URL : PANC-432
			var currentVideoUrl = url;
			dlg.dialog("open");	 // open after load to ensure dialog is centered
			var videoDialog = "";
			$(".ui-dialog #pdp-video-dialog").html("");
			if($(this).find('img').length>0){
				$cache.pdpMain.find(".video-link").each(function(){
						lgImg = $(this).find('img').data("lgimg");
						url = lgImg.videopath;
						url = url.indexOf('https:') != -1 ? url.replace('https:','') :url.replace('http:','');
						url = window.location.protocol + url;
						if(url.indexOf('?') == -1){
							url = url + "?rel=0&autoplay=1";
						}
	
						videoDialog = videoDialog  + "<div class='dialog-videorow'><div class='videothumbimg'><img src='" + lgImg.thumbpath + "'/></div><div  class='dialog-videolink'><a href='"+ url +"'>"+ lgImg.title +"</a></div></div>";
				});
			}else{
				$cache.pdpMain.find(".support-video-link").each(function(){
						lgImg = $(this).find('.supportvideo').data("lgimg");
						url = lgImg.videopath;
						url = url.indexOf('https:') != -1 ? url.replace('https:','') :url.replace('http:','');
						url = window.location.protocol + url;
						if(url.indexOf('?') == -1){
							url = url + "?rel=0&autoplay=1";
						}
	
						videoDialog = videoDialog  + "<div class='dialog-videorow'><div class='videothumbimg'><img src='" + lgImg.thumbpath + "'/></div><div  class='dialog-videolink'><a href='"+ url +"'>"+ lgImg.title +"</a></div></div>";
				});
			}

			videoDialog = "<div class='videodialog-right'>"+ videoDialog +"</div>";

			var videoDialog = '<div class="videodialog-left"><iframe src="'+ currentVideoUrl +'" width="500" height="350"></iframe></div>' + videoDialog;
			$(".ui-dialog #pdp-video-dialog").append(videoDialog);
			intializevideopalyer();
		});
		/*  PANC-1593 END */
		function intializevideopalyer(){
			$("#pdp-video-dialog .dialog-videorow a").unbind('click').on('click', function(e){
				e.preventDefault();
				$(this).closest('#pdp-video-dialog').find('.videodialog-left iframe').remove();
				$(this).closest('#pdp-video-dialog').find('.videodialog-left').append('<iframe src="'+ $(this).attr('href') +'" width="500" height="350"></iframe>')
			});

			$('.ui-dialog.video .ui-dialog-titlebar a').on('click', function(){
				$('#pdp-video-dialog').remove();
			});

			 $(document).keyup(function (e) {
		        if (e.keyCode == 27) {
		            $('#pdp-video-dialog').remove();
		        }
		    });
		}
		// dropdown variations
		$cache.pdpMain.on("change", ".product-options select", function (e) {
			/*Start JIRA PREV-66:Incorrect price displayed for the product set when options are selected for multiple individual products.
			Start JIRA PREV-67:Incorrect price displayed for the standard product when multiple options are selected.
			Added conditions for Product Set,Product Bundle and Normal Product*/
            var currentForm = $(this).closest("form");
            var currency = $('#currency').val();
            if(currentForm.hasClass("setProduct")){
                var salesPrice = currentForm.find(".add-sub-product .price-sales");
                var combinedPrice = Number($('option:selected', this).data('combined').replace(/[^0-9\.]+/g,"")) - Number($('option:selected', this).data('setprodprice').replace(/[^0-9\.]+/g,""));
				currentForm.find('.product-option').each(function(){
					combinedPrice = combinedPrice + Number($(this).find('option:selected').text().replace(/[^0-9\.]+/g,""));
				});
				salesPrice.text(currency+combinedPrice.toFixed(2));
                var setSalePrice = $("#pdpMain").find(".product-col-2.product-set").find(".product-add-to-cart").find(".product-price").find(".salesprice");
                var originalSetPrice = 0 ;
                $('.add-sub-product').find('.product-price').find('.price-sales').each(function( index ){
	                 var setlevelProductPrice = Number($(this).text().replace(/[^0-9\.]+/g,""));
	                 originalSetPrice = originalSetPrice + setlevelProductPrice;
                });

                setSalePrice.text(currency+(parseFloat(originalSetPrice.toFixed(2))));
           }
            else{
              if(!($(this).closest('.product-set-item').hasClass('product-bundle-item')) || ($('.product-add-to-cart').find('form').hasClass('normalProduct'))){
                 var salesPrice = $cache.pdpMain.find("div.product-add-to-cart .price-sales");
                 var currency = $('#currency').val();
                 if($('.product-add-to-cart').find('form').find('.product-options').find('select option:selected').length > 1){
                    var multiStandardProd = 0;
                    $('.product-add-to-cart').find('form').find('.product-options').find('select').each(function(){
                           multiStandardProd  = multiStandardProd + Number(($(this).find('option:selected').data('setprodprice')).replace(/[^0-9\.]+/g,""));
                    });
                    if($('#product-content').find('.product-price').first().find('.price-sales').length > 0 &&
                                  ($('#product-content').find('.product-price').first().find('.price-standard').length == 0)){
                           var totalSalePrice = multiStandardProd + Number($('#product-content').find('.product-price').first().find('.price-sales').text().replace(/[^0-9\.]+/g,""));
                    }
                    else{
                       if($('#product-content').find('.product-price').first().find('.price-standard').length > 0 &&
                                     ($('#product-content').find('.product-price').first().find('.price-sales').length == 0)){
                              var totalSalePrice = multiStandardProd + Number($('#product-content').find('.product-price').first().find('.price-standard').text().replace(/[^0-9\.]+/g,""));
                       }
                    }
                    if(($('#product-content').find('.product-price').first().find('.price-standard').length > 0) &&
                                  ($('#product-content').find('.product-price').first().find('.price-sales').length > 0)){
                           var totalSalePrice = multiStandardProd + Number($('#product-content').find('.product-price').first().find('.price-sales').text().replace(/[^0-9\.]+/g,""));
                    }
                    salesPrice.text(currency+(parseFloat(totalSalePrice.toFixed(2))));
                 }
                 else{
                    var selectedItem = $(this).children().filter(":selected").first();
                    var combinedPrice = selectedItem.data("combined");
                    salesPrice.text(combinedPrice);
                 }
               }
            }
            if($(this).closest('.product-set-item').hasClass('product-bundle-item')){
                  var bundleProduct = $(this).closest('.product-bundle-item');
                  var bundleInitialPrice = $('.product-col-2').find('.product-price').first().find('span.price-sales').text();
                  var numberPrice = Number(bundleInitialPrice.replace(/[^0-9\.]+/g,""));
                  var currency = $('#currency').val();
                  var bundleLevelPriceForOption = 0;
                  var price = '';
                  $('.product-bundle-item').each(function(){
                         if($(this).find('.product-options').find('select option:selected').length > 1){
                                var multiOptionsPrice = '';
                                var numMulti = 0;
                                $(this).find('.product-options').find('select').each(function(){
                                       multiOptionsPrice = $(this).find('option:selected').data('setprodprice');
                                       numMulti = numMulti + Number(multiOptionsPrice.replace(/[^0-9\.]+/g,""));
                                });
                                price = currency + numMulti;
                         }
                         else{
                                price = $(this).find('.product-options').find('select option:selected').data('setprodprice');
                         }

                         var numPrice = 0;
                         if(price != undefined){
                                numPrice = Number(price.replace(/[^0-9\.]+/g,""));
                         }
                         bundleLevelPriceForOption = bundleLevelPriceForOption + numPrice;
                  });
                  var totalBundlePrice = numberPrice + bundleLevelPriceForOption;
                  var bundleLevelPriceTotal = $('.bundle').find('.product-add-to-cart').find('.product-price').find('.price-sales');
                  bundleLevelPriceTotal.text(currency+(parseFloat(totalBundlePrice.toFixed(2))) );
            }
            /*End JIRA PREV-66,PREV-67*/
     });

		// prevent default behavior of thumbnail link and add this Button
		$cache.pdpMain.on("click", ".thumbnail-link, .addthis_toolbox a", false);
		$cache.pdpMain.on("click", "li.unselectable a", false);


		// handle drop down variation attribute value selection event
		$cache.pdpMain.on("change", ".variation-select", function(e){
			if ($(this).val().length===0) {return;}
			var qty = $cache.pdpForm.find("input[name='Quantity']").first().val(),
				listid = $cache.pdpForm.find("input[name='productlistid']").first().val(),
				productSet = $(this).closest('.subProduct'),
				params = {
					Quantity : isNaN(qty) ? "1" : qty,
					format : "ajax"
				};
			if( listid ) params.productlistid = listid;
			var target = (productSet.length > 0 && productSet.children.length > 0) ? productSet : $cache.productContent;
			var url = app.util.appendParamsToUrl($(this).val(), params);
			app.progress.show($cache.pdpMain);

			var hasSwapImage = $(this).find("option:selected").attr("data-lgimg") !== null;

			app.ajax.load({
				url: url,
				callback : function (data) {
					target.html(data);
					app.product.initAddThis();
					app.product.initAddToCart();
					if (hasSwapImage) {
						replaceImages();
					}
					$("#update-images").remove();
					app.tooltips.init();
				}
			});
		});

		// swatch anchor onclick()
		$cache.pdpMain.on("click", "div.product-detail a[href].swatchanchor", function (e) {
			e.preventDefault();

			var el = $(this);
			if( el.parents('li').hasClass('unselectable') || el.parents('li').hasClass('selected')) return;


			var hasSwapImage = (el.attr("data-lgimg") !== null);
			if(location.href.indexOf('supportpage=true')!=-1){
					var supportpage =true;
				} 
			var anchor = el,
				qty = $("#pdpMain").find("input[name='Quantity']").first().val(),
				listid = $cache.pdpForm.find("input[name='productlistid']").first().val(),
				productSet = $(anchor).closest('.subProduct'),
				params = {
					Quantity : isNaN(qty) ? "1" : qty,
					supportpage : true ? supportpage : ''
				
				};
				
			if( listid ) params.productlistid = listid;
			//var target = (productSet.length > 0 && productSet.children.length > 0) ? productSet : $cache.productContent;
			var targetnew = (productSet.length > 0 && productSet.children.length > 0) ? productSet : $cache.pdpMain;
			var pdpleftsection = $('.pdp-main .pdp-left-load');
			var pdpfeature = $('.pdp-main .features-block');
			var pdpspecification = $('.pdp-main .specifications-block');
			var pdpaccessories = $('.pdp-main .accessories-block');
			var pdpawards = $('.pdp-main .awards-block');
			var pdpownership = $('.pdp-main .ownership-block');


			var url = app.util.appendParamsToUrl(this.href, params);
			app.progress.show($cache.pdpMain);

			app.ajax.load({
				url: url,
				callback : function (data) {
					//target.html(data);
					targetnew.html($(data).filter('#pdpMain').html());

					if($(data).filter('#pdpMain').find('.lazyload-placeholder-variation').attr('data-placeholder')!= null && $(data).filter('#pdpMain').find('.lazyload-placeholder-variation').attr('data-placeholder')!= undefined){
						if(targetnew.parent().find('.lazyload-placeholder').length != 0){
							targetnew.parent().find('.lazyload-placeholder').attr('data-placeholder',$(data).filter('#pdpMain').find('.lazyload-placeholder-variation').attr('data-placeholder'));
						}else{
							targetnew.after("<div class='lazyload-placeholder' data-placeholder='"+ $(data).filter('#pdpMain').find('.lazyload-placeholder-variation').attr('data-placeholder') +"'></div>");
						}
					}

					$cache.pdplazyload.show();
					$cache.pdplazyload.removeClass('endscroll');
					//PANC-370 MYregistry js repload on ajax call
					if(app.enableMyRegistry && app.user.myRegistryJavaScriptUrl.length > 0){
						$.getScript(app.user.myRegistryJavaScriptUrl);
					}
					$.getScript("//cdn-saveit.wanelo.com/bookmarklet/3/save.js");
					app.product.initAddThis();
					app.product.initAddToCart();
					app.product.initializePDPEvents();
					app.uievents.init();
					if(app.enableLazyLoad){
						pdploadfirstitem();
					}

					if($('.pnsb2c-pdp-right #ReviewsSubmissionContainerWrapper').length > 0){
						$('.pnsb2c-pdp-right #ReviewsSubmissionContainerWrapper').remove();
					}
					if(app.bvconfig != undefined && app.bvconfig != null){
						app.bvconfig.init();
					}
					/*Temporary fix so it wont work in Chrome */
					var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
					
					if(app.squareTrade != undefined && app.squareTrade != null && ($('body').find('.configFilename-path').length > 0 && $('#pdpMain').find('.squaretrade_resale_pp').length > 0)){
						app.squareTrade.init();
					}
					if(app.enabledStorePickup){app.storeinventory.buildStoreList($('.product-number span').html());}
					if (hasSwapImage) {
						replaceImages();
					}
					app.tooltips.init();
					app.salesforce.init();
				}
			});
		});

		$cache.productSetList.on("click", "div.product-set-item li a[href].swatchanchor", function (e) {
			e.preventDefault();
			// get the querystring from the anchor element
			var el = $(this);
			if( el.parents('li').hasClass('unselectable') || el.parents('li').hasClass('selected')) return;
			
			var params = app.util.getQueryStringParams(this.search);
			var psItem = $(this).closest(".product-set-item");

			// set quantity to value from form
			var qty = psItem.find("form").find("input[name='Quantity']").first().val();
			params.Quantity = isNaN(qty) ? "1" : qty;

			var url = app.urls.getSetItem + "?" + $.param(params);

			// get container
			var ic = $(this).closest(".product-set-item");
			ic.load(url, function () {
				app.progress.hide();
				if ($cache.productSetList.find("button.add-to-cart[disabled]").length>0 || $cache.productSetList.find("form").find("a.disabled").length >0  ) {
					$cache.addAllToCart.attr("disabled","disabled");
					$cache.addAllToCart.addClass("disabled");// this may be a set
					$cache.addToCart.attr("disabled","disabled"); // this may be a bundle
				}
				else {
					$cache.addAllToCart.removeAttr("disabled");
					$cache.addToCart.removeAttr("disabled"); // this may be a bundle
					if($cache.addAllToCart.hasClass("disabled")){
						$cache.addAllToCart.removeClass("disabled"); // this may be a set
					}
				}

				app.product.initAddToCart(ic);
				app.tooltips.init();
			});
		});
		$("#product-set-list").on("click", "a.add-to-cart-setproduct", function (e) {
			e.preventDefault();
			var curranch= $(this);
			var form = $(this).closest("form");
			var qty = form.find("input[name='Quantity']");
			if(qty.length === 0 || isNaN(qty.val()) || parseInt(qty.val(), 10) === 0) {
				qty.val("1");
			}
			var data = form.serialize();
			addProductUrl = app.util.ajaxUrl(app.urls.addProduct);
			$.ajax({
					dataType : "html",
					url: addProductUrl,
					data: form.serialize()
				})
				.done(function (response) {
					// success
					miniCartHtml = response;
					app.minicart.show(miniCartHtml);
				})
				.fail(function (xhr, textStatus) {
					// failed
					var msg = app.resources.ADD_TO_CART_FAIL;
					$.validator.format(msg, itemid);
					if(textStatus === "parsererror") {
						msg+="\n"+app.resources.BAD_RESPONSE;
					} else {
						msg+="\n"+app.resources.SERVER_CONNECTION_ERROR;
					}
					window.alert(msg);
			})
			
		});
			
		$cache.addAllToCart.on("click", function (e) {
			e.preventDefault();
			//Event Tracking For Product Set
			if(app.enabledEventTracking && app.enabledgoogleAnalytics){
			    gAnalytics_events.addProductSet();
			}

			var psForms = $cache.productSetList.find("form").toArray(),
				miniCartHtml = "",
				addProductUrl = app.util.ajaxUrl(app.urls.addProduct);

			// add items to cart
			function addItems() {
				var form = $(psForms.shift());
				var itemid = form.find("input[name='pid']").val();

				$.ajax({
					dataType : "html",
					url: addProductUrl,
					data: form.serialize()
				})
				.done(function (response) {
					// success
					miniCartHtml = response;
				})
				.fail(function (xhr, textStatus) {
					// failed
					var msg = app.resources.ADD_TO_CART_FAIL;
					$.validator.format(msg, itemid);
					if(textStatus === "parsererror") {
						msg+="\n"+app.resources.BAD_RESPONSE;
					} else {
						msg+="\n"+app.resources.SERVER_CONNECTION_ERROR;
					}
					window.alert(msg);
				})
				.always(function () {
					if (psForms.length > 0) {
						addItems();
					}
					else {
						app.quickView.close();
						app.minicart.show(miniCartHtml);
					}
				});
			}
			addItems();
			return false;
		});

		//if product page loaded in http this will cause the send to a friend link to open in a new page rather than in a hop up.
		if( app.protocol == 'https' ){
			app.sendToFriend.initializeDialog($cache.pdpMain, "a.send-to-friend");
		}
		$cache.pdpMain.find("button.add-to-cart[disabled]").attr('title', $cache.pdpMain.find(".availability-msg").html() );


		//$cache.pdpMain.find(".specification-block .block-content").hide();

		$cache.pdpMain.find(".specification-block .block-head, .accessories-block-li .block-head, .faqs-block-li .block-head").unbind('click').on('click',function(e){
			e.preventDefault();
			if(!$(this).hasClass('active')){
				$(this).addClass("active");
				$(this).next().slideDown("slow", function(){
					$('.block-content').each(function(){
						$(this).find(".product-tile").removeAttr('style');
						$(this).find(".product-tile").syncHeight();
					});

					$("ul.pdptiles-carousel:visible").each(function(){
						if($(this).find('li').length > 5){
							$(this).parent().addClass('jcarousel-auto');
							$(this).jcarousel($.extend({visible : 5}, app.components.carouselSettings));
						}
					});
					if($(this).parent().hasClass("specification-block")){
						if($cache.pdpMain.find('.specification-block .block-head').length== $cache.pdpMain.find('.specification-block .block-head.active').length){
							$(".prod-specification-holder .collapse-all-pdp").addClass('selected');
							$(".prod-specification-holder .collapse-all-pdp").text("Collapse All");
							$cache.pdpMain.find(".more-specification-link-holder .more-specification-link").hide();
						}
					}

				});
			}else{
				$(this).removeClass("active");
				$(this).next().slideUp("slow", function(){
					if(($('.pdp-left-holder').offset().top + $('.pdp-left-holder').outerHeight()) > $('#footer').offset().top){
						$('.pdp-left-holder').css('top',  $('.pnsb2c-pdp-right > div').not('.hide').last().offset().top - $('.pdp-left-holder').outerHeight());
					}
					if($(this).parent().hasClass("specification-block")){
						if($cache.pdpMain.find('.specification-block .block-head').not('.specification-block .block-head.active').length == $cache.pdpMain.find('.specification-block .block-head').length){
							$(".prod-specification-holder .collapse-all-pdp").removeClass('selected');
							$(".prod-specification-holder .collapse-all-pdp").text("Expand All");
							$cache.pdpMain.find(".more-specification-link-holder .more-specification-link").show();
						}
					}

				});
				if( $(this).parent().hasClass("accessories-block-li")){
					$(".more-accessories-link-holder.see-all-link .more-accessories-link").removeClass('selected').show();
				}
			}
			if( $(this).parent().hasClass("accessories-block-li")){
				if($('.accesories-holder .accessories-block-li').length == $('.accesories-holder .accessories-block-li .active').length){
					$(".accessories-block").find(".see-all-link").hide();
				}
				else{
					$(".accessories-block").find(".see-all-link").show();
				}
			}
		});

		$cache.pdpMain.find(".more-accessories-link-holder.see-all-link .more-accessories-link").unbind('click').on('click', function(e){
			e.preventDefault();
			if(!$(this).hasClass('selected')){
				$(this).addClass('selected');
				$(".accessories-block-li .block-head").addClass('active');
				$(".accessories-block-li .block-content").slideDown("slow", function(){
					$('.block-content').each(function(){
						$(this).find(".product-tile").removeAttr('style');
						$(this).find(".product-tile").syncHeight();
					});
					$("ul.pdptiles-carousel:visible").each(function(){
						if($(this).find('li').length > 5){
							$(this).parent().addClass('jcarousel-auto');
							$(this).jcarousel($.extend({visible : 5}, app.components.carouselSettings));
						}
					});
				});
				$(this).hide();
			}else{
				$(this).removeClass('selected');
				$(".accessories-block-li .block-head").removeClass('active');
				$(".accessories-block-li .block-content").slideUp("slow", function(){
					if(($('.pdp-left-holder').offset().top + $('.pdp-left-holder').outerHeight()) > $('#footer').offset().top){
						$('.pdp-left-holder').css('top',  $('.pnsb2c-pdp-right > div').not('.hide').last().offset().top - $('.pdp-left-holder').outerHeight());
					}
				});
				$(this).show();
			}
		});

		$cache.pdpMain.find(".more-faq-link-holder.see-all-link .more-faq-link").unbind('click').on('click', function(e){
			e.preventDefault();
			$(".pdp-faqs-holder").find(".faqs-block-li").slideDown("500");
			$(this).hide();
		});

		$cache.pdpMain.find(".prod-specification-holder .toggle").unbind('click').on('click',function(e){
			e.preventDefault();
			if(!$(this).hasClass('selected')){
				$(this).addClass('selected');
				$(".specification-block .block-head").addClass('active');
				$(".prod-specification-holder .collapse-all-pdp").text("Collapse All");
				$(".specification-block .block-content").slideDown("slow", function(){
					$('.block-content').each(function(){
						$(this).find(".product-tile").removeAttr('style');
						$(this).find(".product-tile").syncHeight();
					});
					$("ul.pdptiles-carousel:visible").each(function(){
						if($(this).find('li').length > 5){
							$(this).parent().addClass('jcarousel-auto');
							$(this).jcarousel($.extend({visible : 5}, app.components.carouselSettings));
						}
					});
				});
				$cache.pdpMain.find(".more-specification-link-holder .more-specification-link").hide();
			}else{
				$(this).removeClass('selected');
				$(".specification-block .block-head").removeClass('active');
				$(".specification-block .block-content").slideUp("slow", function(){
					if(($('.pdp-left-holder').offset().top + $('.pdp-left-holder').outerHeight()) > $('#footer').offset().top){
						$('.pdp-left-holder').css('top',  $('.pnsb2c-pdp-right > div').not('.hide').last().offset().top - $('.pdp-left-holder').outerHeight());
					}
				});
				$(".prod-specification-holder .collapse-all-pdp").text("Expand All");
				$cache.pdpMain.find(".more-specification-link-holder .more-specification-link").show();
			}
		});

		$cache.pdpMain.find(".more-specification-link-holder .more-specification-link").unbind('click').on('click',function(e){
			$cache.pdpMain.find(".prod-specification-holder .toggle").trigger('click');
			$(this).hide();
		});

		if($cache.pdpMain.find(".pnsb2c-pdp-left .prod-info-ul li.active").length == 0){
			$cache.pdpMain.find(".pnsb2c-pdp-left .prod-info-ul li").eq(0).addClass('active');
		}

		$cache.pdpMain.find(".pnsb2c-pdp-left .prod-info-ul a").unbind('click').on('click',function(e){
			e.preventDefault();
			var $id = $(this).attr('href');
			var loadingPlaceHolder = $cache.pdplazyload;
			// get url hidden in DOM
			var gridUrl = loadingPlaceHolder.attr('data-placeholder');
			var currentdata = '';
			$(".pnsb2c-pdp-left .prod-info-ul li").removeClass('active');
			$(this).closest('li').addClass('active');
			if(!app.enableLazyLoad){
				app.util.scrollBrowser($($id).offset().top);
				return false;
			}

			if(loadingPlaceHolder.hasClass('loading')){
				$('.pnsb2c-pdp-left').addClass('loaddelay');
				return false;
			}
			if($($id).length == 0){
				loadingPlaceHolder.addClass('loading');

				var pdpinfinitedata = function(response){
					loadingPlaceHolder.removeClass('loading');
					currentdata = $(response).find('.pdplazyload').slice($('.pdplazyload').length,$('.prod-info-ul li.active').index()).clone();
					$cache.pdpMain.find('.pnsb2c-pdp-right').append(currentdata);
					if($("#BVRRContainer").length > 0 && !$('.product-reviews-tabs').hasClass('loaded')){
						app.bvconfig.init();
					}

					if($("#BVRRRatingSummaryNoReviewsWriteImageLinkID").length > 0){
						$('.product-reviews-tabs').remove();
					}

					$cache.pdpMain.find(".pdplazyload").fadeTo("slow", 1);

					$('.product-reviews-tabs').addClass('loaded');
					if($cache.pdpMain.find('.pnsb2c-pdp-right .features-block').length == 0 || $cache.pdpMain.find('.pnsb2c-pdp-right .features-block').hasClass('loaded') || $cache.pdpMain.find('.pnsb2c-pdp-right .features-block img').length == 0){
						app.util.scrollBrowser($($id).offset().top);
					}else{
						//On click of left hand links scroll to the position of selected item.
						var overviewimg = $('.pnsb2c-pdp-right .features-block img');
						overviewimg.on('load', function(){
							$(this).addClass('loaded');
						}).on('error', function(){
							$(this).addClass('loaded');
						});
						$cache.pdpMain.find('.pnsb2c-pdp-right .features-block').addClass('loaded');
					}
					initializeEvents();
					pdpscrollpositon();
				}

				if(sessionStorage["pdp-cache_" + gridUrl]){
					pdpinfinitedata(sessionStorage["pdp-cache_" + gridUrl]);
				}else{
					jQuery.ajax({
						type: "GET",
						dataType: 'html',
						url: gridUrl,
						success: function(response) {
							// put response into cache
							try {
								sessionStorage["pdp-cache_" + gridUrl] = response;
							} catch (e) {
								// nothing to catch in case of out of memory of session storage
								// it will fall back to load via ajax
							}
							pdpinfinitedata(response);
						}
					});
				}

			}else{
				app.util.scrollBrowser($($id).offset().top);
			}
		});

		function pdpscrollpositon(){
			var activeitem = $(".pnsb2c-pdp-left .prod-info-ul li.active a").attr('href');

			if($('.pnsb2c-pdp-right .features-block img').length == $('.pnsb2c-pdp-right .features-block img.loaded').length){
				$('html, body').animate({ scrollTop: $($(".pnsb2c-pdp-left .prod-info-ul li.active a").attr('href')).offset().top }, 500, function(){
					app.product.reviewsimg();
				});
				return false;
			}else{
				setTimeout(function(){pdpscrollpositon()}, 500);
			}
		}

		//Pdp share functionality
		$(".share-link").unbind('click').on('click', function(e){
			e.preventDefault();
			$(this).closest('div.pnsb2c-share-addthis-holder').find('.addthis-toolbox-holder').toggleClass('hide');
		});


		//PDP feature slide functionality
		$cache.pdpMain.find('.more-feature-link').unbind('click').on('click', function(){
			if(!$(this).closest('.features-block').find('.more-feature').is(':visible')){
				$(this).find('.show-more').hide();
				$(this).closest('.features-block').find('.more-feature').slideDown(500);
				$(this).find('.show-less').show();
			}else{

				$(this).closest('.features-block').find('.more-feature').slideUp(500);
				$(this).find('.show-more').show();
				$(this).find('.show-less').hide();
			}
		});
	}
	/**
	 * @private
	 * @function
	 * @description Event handler to handle the add to cart event
	 */
	function setAddToCartHandler(e) {
alert("ah"); return false;
		e.preventDefault();
		/*if($(this).hasClass('pdp-addtocart')){
	        app.dialog.open({url: app.util.appendParamsToUrl(app.urls.showCartPopup,{pid:$(this).closest("form").find("input[name='pid']").val()}), options: {open: function() {
	                        app.tooltips.init();
	                        app.product.initProductAccessories();
	                        if($("#recommendedAcc").find(".pdp-prod-accesories-ul li").length > 4){
	                			$(".pdp-prod-accesories-ul").jcarousel(app.components.carouselSettings);
	                			setTimeout(function(){$(".pdp-prod-accesories-ul").find(".product-tile").syncHeight();}, 1000);
	                		}
	        },close: function() {
	                        window.location.href = app.urls.cartShow;
	        },
	          width:1090,
	          height:"auto",
	          dialogClass:"accessories-overlay-pdp"
	        }});

	    }*/
		var currDiv = $(this);
		var form = $(this).closest("form");
		var qty = form.find("input[name='Quantity']");
		var isSubItem = $(this).hasClass("sub-product-item");
		if(qty.length === 0 || isNaN(qty.val()) || parseInt(qty.val(), 10) === 0) {
			qty.val("1");
		}

		//Event tracking For AddProduct To cart
		if(app.enabledEventTracking && app.enabledgoogleAnalytics){
			   gAnalytics_events.addProduct(form.find("input[name='pid']").val());
		}
		var data = form.serialize();
		var warrantyMainProduct = form.find("input[name='pid']").val();
		app.cart.update(data, function (response) {
			var uuid = form.find("input[name='uuid']");
			if (uuid.length > 0 && uuid.val().length > 0) {
				app.cart.refresh();
			}
			else {
				if (!isSubItem) {
					app.quickView.close();
				}
				app.minicart.show(response);
				app.product.addWarrantyProducts(form,qty,isSubItem,warrantyMainProduct);
				app.product.openPopup(currDiv,true);
			}
		});

	}


	/*************** app.product public object ***************/
	app.product = {
		init : function () {
			initializeCache();
			initializeDom();
			initializeEvents();
			loadZoom();
			/*Temporary fix so it wont work in Chrome */
			var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
			if(app.squareTrade != undefined && app.squareTrade != null && ($('body').find('.configFilename-path').length > 0 && $('#pdpMain').find('.squaretrade_resale_pp').length > 0)){
				app.squareTrade.init();
			}
			if(app.enabledStorePickup){
				app.storeinventory.init();
			}

		},
		addWarrantyProducts : function(form,qty,isSubItem,warrantyMainProduct){
			//Check if product having any warrenty selection ,if yes add that product else no changes
				if(form.find("input[name='productWarranty']") != undefined && form.find("input[name='productWarranty']").val() != null && form.find("input[name='productWarranty']").val().trim() != ''){
					var warrantyData = qty.attr('name')+'='+qty.val()+'&'+form.find("input[name='cartAction']").attr('name')+'='+form.find("input[name='cartAction']").val()+'&'+form.find("input[name='pid']").attr('name')+'='+form.find("input[name='productWarranty']").val()+'&Warranty=true&WarrantyMainProductID='+warrantyMainProduct;
					app.cart.update(warrantyData, function (response) {
						var uuid = form.find("input[name='uuid']");
						if (uuid.length > 0 && uuid.val().length > 0) {
							app.cart.refresh();
						}
						else {
							if (!isSubItem) {
								app.quickView.close();
							}
							app.minicart.show(response);
						}
					});

				}
		},
		readReviews : function(){
			$('.product-tabs').tabs('select','#tab4');
			$('body').scrollTop($('#tab4').offset().top);
		},
		openPopup : function(currDiv,closeRedirect){

			//Checking recommendation ids
			var reccIDS = "";
				if((currDiv.closest("form").find("input[name='strandsPids']").length > 0) && currDiv.closest("form").find("input[name='strandsPids']") != undefined && currDiv.closest("form").find("input[name='strandsPids']").val().trim().length > 0){
					 reccIDS = currDiv.closest("form").find("input[name='strandsPids']").val().trim();
				}

			if(currDiv.hasClass('pdp-addtocart') && (reccIDS.length > 0)){

		        app.dialog.open({url: app.util.appendParamsToUrl(app.urls.showCartPopup,{pid:currDiv.closest("form").find("input[name='pid']").val(),rids:reccIDS}), options: {open: function() {
		                        app.tooltips.init();
		                        app.product.initProductAccessories();
		                        if($("#recommendedAcc").find(".pdp-prod-accesories-ul li").length > 4){
		                			$(".pdp-prod-accesories-ul").jcarousel(app.components.carouselSettings);
		                			setTimeout(function(){$(".pdp-prod-accesories-ul").find(".product-tile").syncHeight();}, 1000);
		                			/*Farhan's Dev team : 08-10-2015 3:00pm PANC-988*/
		                			$('.cart-pdp-popup').syncHeight();
		                			$('.promo-cartpopup').syncHeight();		      
		                			/*END PANC-988*/          			
		                		} 

		                        if(($('#recommendedAcc .pdp-prod-accesories-ul').html() == null) || $('#recommendedAcc .pdp-prod-accesories-ul').html().trim().length == 0){
		        					app.minicart.show();
		        					window.location.href = app.urls.cartShow;
		        				}
		        },close: function() {
		        	            if(closeRedirect != null && closeRedirect != undefined && closeRedirect){
		        	            	window.location.href = app.urls.cartShow;
		        	            }

		        },
		          width:1090,
		          height:"auto",
		          dialogClass:"accessories-overlay-pdp"
		        }});

		    }
		},
		/**
		 * @function
		 * @description Loads a product into a given container div
		 * @param {Object} options An object with the following properties:</br>
		 * <p>containerId - id of the container div, if empty then global app.containerId is used</p>
		 * <p>source - source string e.g. search, cart etc.</p>
		 * <p>label - label for the add to cart button, default is Add to Cart</p>
		 * <p>url - url to get the product</p>
		 * <p>id - id of the product to get, is optional only used when url is empty</p>
		 */
		get : function (options) {
			var target = options.target || app.quickView.init();
			var source = options.source || "";
			var productListID = options.productlistid || "";

			var productUrl = options.url || app.util.appendParamToURL(app.urls.getProductUrl, "pid", options.id);
			if(source.length > 0) {
				productUrl = app.util.appendParamToURL(productUrl, "source", source);
			}
			if(productListID.length > 0) {
				productUrl = app.util.appendParamToURL(productUrl, "productlistid", productListID);
			}

			// show small loading image
			//app.progress.show(app.ui.primary);
			app.ajax.load({
				target : target,
				url : productUrl,
				data : options.data || "",
				// replace with callback passed in by options
				callback : options.callback || app.product.init
			});
		},
		/**
		 * @function
		 * @description Gets the availability to given product and quantity
		 */
		getAvailability : function (pid, quantity, callback) {
			app.ajax.getJson({
				url: app.util.appendParamsToUrl(app.urls.getAvailability, {pid:pid, Quantity:quantity}),
				callback: callback
			});
		},
		/**
		 * @function
		 * @description Initializes the 'AddThis'-functionality for the social sharing plugin
		 */
		initAddThis : function () {
			var addThisServices = ["twitter","pinterest_pinit","facebook","google"],
				addThisToolbox = $(".addthis_toolbox"),
				addThisLinks="";

			var i,len=addThisServices.length;
			for (i=0;i<len;i++) {
				if (addThisToolbox.find(".addthis_button_"+addThisServices[i]).length==0) {
					if(addThisServices[i]== "pinterest_pinit"){
						addThisLinks += '<a class="addthis_button_'+addThisServices[i]+'" title="Pinterest"></a>';
					}else{
						addThisLinks += '<a class="addthis_button_'+addThisServices[i]+'"></a>';
					}
				}
			}
			if (addThisLinks.length===0) { return; }

			addThisToolbox.html(addThisLinks);
			try{
				addthis.toolbox(".addthis_toolbox");
			} catch(e) {
				return;
			}
		},

		/**
		 * @function
		 * @description Initializes the 'AddThis'-functionality for the social sharing plugin on the Adventure Landing pages
		 */
		initAddThisAdventure : function () {
			var addThisServices = ["facebook","twitter", "email"],
				addThisToolbox = $(".addthis_toolbox .custom_images"),
				addThisLinks="";

			var i,len=addThisServices.length;
			for (i=0;i<len;i++) {
				if (addThisToolbox.find(".addthis_button_"+addThisServices[i]).length==0) {
					addThisLinks += '<a class="addthis_button_'+addThisServices[i]+'"><div></div></a>';
				}
			}
			if (addThisLinks.length===0) { return; }

			addThisToolbox.html(addThisLinks);
			try{
				addthis.toolbox(".addthis_toolbox");
			} catch(e) {
				return;
			}
		},

		/**
		 * @function
		 * @description Binds the click event to a given target for the add-to-cart handling
		 * @param product accessories functionality
		 */
		initProductAccessories : function (target) {

			//PDP Accessories
			$('#recommendedAcc .accessorie-class').on('click', function(e){
				e.preventDefault();
				if(!($(this).hasClass('added-to-cart')))
					{
							var currButton = $(this);
							var form = $(this).closest("form");
							var qty = form.find("input[name='Quantity']");
							var new_span = $('<span></span>').addClass('spn-sprite');
							var isSubItem = $(this).hasClass("sub-product-item");
							if(qty.length === 0 || isNaN(qty.val()) || parseInt(qty.val(), 10) === 0) {
								qty.val("1");
							}
							var data = form.serialize();
							app.cart.update(data, function (response) {
								var uuid = form.find("input[name='uuid']");
								if (uuid.length > 0 && uuid.val().length > 0) {
									app.cart.refresh();
								}
								else {
									if (!isSubItem) {
										app.quickView.close();
									}
									currButton.addClass('added-to-cart');
									$(".added-to-cart").attr("title","REMOVE FROM CART");
									new_span.insertAfter('.added-to-cart');
									$(".added-to-cart").text("ADDED TO CART");
									var accessoriesCartAddedLength = $('#recommendedAcc .added-to-cart').length;
									$('#additionalItems').find('.cart-added').html(accessoriesCartAddedLength);
									app.minicart.show(response);
									//app.product.initProductAccessories();


								}
							});
					}else if(($(this).hasClass('added-to-cart'))){
							var currButton = $(this);
							var pid = currButton.closest("form").find("input[name='pid']").val();
							var url = app.util.appendParamsToUrl(app.urls.removeProductFromCart, {pid:pid});
							 app.ajax.load({
									url: url,
									callback: function (data) {
										if(data.indexOf('div') > -1)
											{

												currButton.next('span.spn-sprite').remove();
												currButton.text("ADD TO CART").attr("title","ADD TO CART");
												currButton.removeClass('added-to-cart');
												var accessoriesCartAddedLength = $('#recommendedAcc .added-to-cart').length;
												$('#additionalItems').find('.cart-added').html(accessoriesCartAddedLength);
												app.minicart.show(data);
												//app.product.initProductAccessories();

											}
									}
								});
					}

			});
			//PDP Accessorie proceed to cart click
			$('.accessories-container').find('.proceed-to-cart').on('click', function(e){
				e.preventDefault();
				window.location.href = app.urls.cartShow;

			});
		},

		/**
		 * @function
		 * @description Binds the click event to a given target for the add-to-cart handling
		 * @param {Element} target The target on which an add to cart event-handler will be set
		 */
		initAddToCart : function (target) {
			//Start JIRA PREV-47:Issue in adding the product from product set. Added unbind("click")
			if (target) {
					target.find(".add-to-cart").unbind("click").on("click", setAddToCartHandler);
			}
			else {
					$(".add-to-cart").unbind('click').on("click", setAddToCartHandler);
			}
			//END JIRA PREV-47
		},
		initializePDPEvents : function (target) {
			initializeEvents();
		},
		reviewsimg : function(){

			if($("#BVRRRatingSummaryNoReviewsWriteImageLinkID").length > 0){
				$('#BVRRRatingSummaryNoReviewsWriteImageLinkID').each(function(){
					if($(this).find('.BVRStarCont').length == 0){
						$(this).find('a').append('<div class="BVRStarCont"><div class="BVRStar_bottom"></div></div>');
					}
				});
				if(!app.enableLazyLoad){
					$cache.pdpMain.find(".pdp-reviews-block").hide();
				}
				return false;
			}

			//check the reviews available or not
			if($(".BVRRRatingOverall").length > 0){
				$('.pdp-left-holder .review-block').show();
				 if(app.util.readCookie('viewreviews') == "true" && !$('.pdp-left-holder .review-block').hasClass('visited')){
					$('.pdp-left-holder .review-block a').trigger('click');
					$('.pdp-left-holder .review-block').addClass('visited');
					document.cookie="viewreviews=false;path=/";
				}

				var $val = 0,
					$percent = "";
				//check and create the star images
				$('.BVRRRatingOverall').each(function(){
					if($(this).hasClass('BVRRRatingNormal')){
						$val = (parseFloat($(this).find('.BVRRNumber.BVRRRatingNumber').text())/5)*100;
						$percent = $val.toString() +'%';
					}
					if($(this).find('.BVRRRatingNormalImage .BVRStarCont').length == 0){
						$(this).find('.BVRRRatingNormalImage').append('<div class="BVRStarCont"><div class="BVRStar_top" data-rating="'+$percent+'"></div><div class="BVRStar_bottom"></div></div>');
					}
				});

				if($('.product-review-links #BVRRSummaryContainer').length > 0){
					$('.product-review-links .BVRStar_top').each(function(){
						if($(this).attr('data-rating')){
							$(this).delay(200).width($(this).attr('data-rating'));
						}
						$(this).removeAttr('data-rating');
					});
				}

				$('.BVRRSecondaryRatingsContainer .BVRRRatingContainerStar .BVRRRatingEntry').each(function(){
					$val = (parseFloat($(this).find('.BVRRNumber.BVRRRatingNumber').text())/5)*100;
					$percent = $val.toString() +'%';
					if($(this).find('.BVRRRatingNormalImage .BVRStarCont').length == 0){
						$(this).find('.BVRRRatingNormalImage').append('<div class="BVRStarCont"><div class="BVRStar_top" data-rating="'+$percent+'"></div><div class="BVRStar_bottom"></div></div>');
					}
					/* Farhans Dev team : 17-03-2016 11:07AM PANC-1614 */
				   /* Farhans Dev team : 14-10-2015 11:40PM PANC-1135 */
				   
				   /* if($('.BVRRCount.BVRRNonZeroCount').length > 0 && $('.ratingcountinnumber').length == 0){
			       		$('.BVRRRatingSummaryLinks').find('#BVRRRatingSummaryLinkReadID').find('.BVRRCount.BVRRNonZeroCount').replaceWith('<span class = ' + '"ratingcountinnumber"' + '> <span class="BVRRRatingSummaryLinkReadPrefix"> | </span><span class="reviewtext">'+  $('#BVRRRatingOverall_Rating_Summary_1').find('.BVRRRatingNormalOutOf').find('meta').prop('content')+' Reviews</span> </span>')
			       }
			       if($('#BVRRQuickTakeSummaryID').find('.BVRRRatingsHistogramButton').length > 0 && $('.ratingcountinnumberbottom').length == 0){  
			       		$('#BVRRQuickTakeSummaryID').find('.BVRRRatingsHistogramButton').after('<span class="pipeseparator"> | </span><span class = ' + '"ratingcountinnumberbottom"' + '><span class="BVRRRatingSummaryLinkSeparator"> | </span>  '+ $('#BVRRRatingOverall_Rating_Summary_1').find('.BVRRRatingNormalOutOf').find('meta').prop('content')+' Reviews </span> | ')
			       }*/
			       
			       /* PANC-1135 END */
			       /* PANC-1614 END */
				});

				$('.BVRRSecondaryRatingsContainer .BVRRRatingContainerRadio .BVRRRatingEntry').each(function(){
					if($(this).find('.BVRRRatingRadioImage img').attr('alt')){
						$val = $(this).find('.BVRRRatingRadioImage img').attr('alt').split(' ')[0];
					}else if($(this).find('.BVRRRatingRadioImage img').attr('title')){
						$val = $(this).find('.BVRRRatingRadioImage img').attr('title').split(' ')[0];
					}

					$val = (parseFloat($val)/5)*100;
					$percent = $val.toString() +'%';

					if($(this).find('.BVRRRatingRadioImage .BVRStarCont').length == 0){
						$(this).find('.BVRRRatingRadioImage').append('<div class="BVRStarCont"><div class="BVRStar_top" data-rating="'+$percent+'"></div><div class="BVRStar_bottom" ></div></div>');
					}

				});

				$('.product-review-links #BVRRRatingSummaryLinkReadID').unbind('click').on('click', function(e){
					e.stopPropagation();
					$('.info-block.review-block a').trigger('click');
				});

				$('.BVRRLabel').each(function(){
					if($(this).text() == "Extremely Dissatisfied"){
						$(this).text('Negative');
					}
					if($(this).text() == "Extremely Satisfied"){
						$(this).text('Positive');
					}
				});
				 
				if(app.enableLazyLoad){
					if($('#pdp-reviews-block').length > 0 && app.util.elementInViewport($('#pdp-reviews-block').get(0), 250)){
						app.product.doanimate();
					}
				}else{
					app.product.doanimate();
				}

				return false;
			}else{
				setTimeout(function(){app.product.reviewsimg()}, 500);
			}
		},
		doanimate : function(){
			$('.BVRStar_top').each(function(){
				if($(this).attr('data-rating')){
					$(this).width($(this).attr('data-rating'));
				}
				$(this).removeAttr('data-rating');
			});
		}
	};

}(window.app = window.app || {}, jQuery));

if ($('.adventure-page-wrapper').length > 0) {
	app.product.initAddThisAdventure();
}

/**
 * @class app.product.tile
 */
(function (app, $) {
	var $cache = {};

	/**
	 * @function
	 * @description Initializes the DOM of the Product Detail Page
	 */
	function initializeDom() {
		var tiles = $cache.container.find(".product-tile");
		if (tiles.length===0) { return; }
		$cache.container.find(".product-tile").removeAttr('style');
		if($('.pt_product-search-result').length > 0){
			if($cache.container.find(".compare-check").length == 0){
				tiles.addClass('nocompare');
			}
			$cache.container.find(".product-tile .product-tile-cont").removeAttr('style');
			$('#search-result-items').removeClass('search-result-sync');
			$cache.container.find(".grid-tile").each(function(){
				if($(this).hasClass('new-row')){
					$(this).find('.product-tile').addClass('product-tile-row');
					$(this).nextUntil('.new-row').find('.product-tile').addClass('product-tile-row');
					$cache.container.find(".product-tile.product-tile-row .product-tile-cont").syncHeight();
					$cache.container.find(".product-tile.product-tile-row").syncHeight();
					$cache.container.find(".product-tile").removeClass('product-tile-row');
					$('#search-result-items').addClass('search-result-sync');
				}
				$(this).delay(200).fadeTo("slow", 1);
			});
		}else{
			$cache.container.find(".product-tile").syncHeight().each(function (idx) {$(this).data("idx",idx);});
		}
	}
	/**
	 * @private
	 * @function
	 * @description Initializes events on the product-tile for the following elements:<br/>
	 * <p>swatches</p>
	 * <p>thumbnails</p>
	 */
	function initializeEvents() {
		app.quickView.initializeButton($cache.container, ".product-image");
		
		    if(location.href.indexOf('#')!= -1){
                var colorurl = location.href.split('#')[1].split('&');
                var j = Number("0");
                for(var i=0;i<colorurl.length ; i++){
	                if(colorurl[i].indexOf('prefn')!=-1){
	                	var j = j+1;
	                    if(colorurl[i].indexOf('color')!=-1 || colorurl[i].indexOf('handsets')!= -1){
	                       var count=j; break;
                   		}
                   	}
                } 
                if( location.href.indexOf('prefv'+count+'=')!=-1){
                    var refinecolor =  location.href.split('prefv'+count+'=')[1].split('&')[0];
                    var refine = refinecolor.split('|');
                    if(refine!=null){
                        $( ".grid-tile" ).each(function() { 
                            tile = $(this);
                            var swatchlist = $(this).find(".swatch-list").find(".swatch");
                            swatchlist.each(function(){
                                if(refinecolor.indexOf($(this).prop('title'))!=-1){
                                    tile.find('.product-swatches .swatch-list').find('li a.selected').removeClass("selected");
                                    $(this).addClass("selected");
                                    tile.find("a.thumb-link").attr("href", $(this).attr("href"));
                                    tile.find("a.name-link").attr("href", $(this).attr("href"));
                        
                                    var swatchImg = $(this).children("img").filter(":first"); 
                                    var data = swatchImg.data("thumb");
                                    var thumb = tile.find(".product-image a.thumb-link img").filter(":first");
                                    var currentAtts = {
                                        src : data.src,
                                        alt : data.alt,
                                        title : data.title
                                     }; 
                                    thumb.attr(currentAtts);
                                    thumb.data("current", currentAtts);
                                    var availabilityChecURL = $(this).attr('tileurl');
                                    var currentAddToCartBtn = $(this).closest('.product-tile-cont').parent().find('.add-to-cart-plp');
                                    app.product.tile.swatchInit(availabilityChecURL,currentAddToCartBtn);
                                }else{
                                    if($(this).hasClass("selected")){
                                        $(this).removeClass("selected");
                                    }
                                }
                            });  
                        }); 
                     }
                  }
             } 
		$cache.container.on("click", ".swatch-list a.swatch", function (e) {
			e.preventDefault();
			if ($(this).hasClass("selected")) { return; }
			var tile = $(this).closest(".grid-tile");
			$(this).closest(".swatch-list").find(".swatch.selected").removeClass("selected");
			$(this).addClass("selected");
			var query = window.location.search.substr(1);
			var vars = query.split("&");
	        for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == 'supportpage'){
            	   var url = window.location.href;
            	   url = app.util.appendParamToURL(url, pair[0], pair[1]);
            	   }
             }
			tile.find("a.thumb-link").attr("href", $(this).attr("href"));
			tile.find("a.name-link").attr("href", $(this).attr("href"));

			var swatchImg = $(this).children("img").filter(":first");
			var data = swatchImg.data("thumb");
			var thumb = tile.find(".product-image a.thumb-link img").filter(":first");
			var currentAtts = {
				src : data.src,
				alt : data.alt,
				title : data.title
			};
			thumb.attr(currentAtts);
			thumb.data("current", currentAtts);
			var availabilityChecURL = $(this).attr('tileurl');
			var currentAddToCartBtn = $(this).closest('.product-tile-cont').parent().find('.add-to-cart-plp');
			app.product.tile.swatchInit(availabilityChecURL,currentAddToCartBtn);

		});
		$cache.container.on("click", ".add-cart-plp .add-to-cart-plp", function (e) {
			e.preventDefault();

			var form = $(this).closest("form");
			var currSelectedSwatchUrl = $(this).closest('.add-cart-plp').parent().find('.swatch-list a.selected').attr('tileurl');
			var isSubItem = $(this).hasClass("sub-product-item");
			var currDiv = $(this);
			/*if(currSelectedSwatchUrl == undefined || currSelectedSwatchUrl == null){
				if((form.find("input[name='strandsPids']").length > 0) && !form.find("input[name='strandsPids']").val().trim().length>0){
					app.product.tile.setRecommendationsPids(form);
				}
				app.product.tile.addToCartTile(form,isSubItem,currDiv);

			}else{
				app.ajax.getJson({
					url : currSelectedSwatchUrl,
					callback : function (response) {
						if (!response || !response.success) {
							if(response.pid != undefined && response.pid != null){
								//change the pid in the form
								form.find("input[name='pid']").val(response.pid);
							}
							if(form.find("input[name='strandsPids']").length > 0 && !form.find("input[name='strandsPids']").val().trim().length>0){
								app.product.tile.setRecommendationsPids(form);
							}
							app.product.tile.addToCartTile(form,isSubItem,currDiv);
						}

					}
				});
			}*/
			if((form.find("input[name='strandsPids']")!= undefined && form.find("input[name='strandsPids']")!= null && form.find("input[name='strandsPids']").length>0) && (!form.find("input[name='strandsPids']").val().trim().length>0)){
				app.product.tile.setRecommendationsPids(form);
			}
			app.product.tile.addToCartTile(form,isSubItem,currDiv);
		});
	}

	/*************** app.product.tile public object ***************/
	app.product.tile = {
		/**
		 * @function
		 * @description Cache, events and initialization
		 */
		init : function () {
			$cache = {
				container : $(".tiles-container")
			};
			initializeEvents();
			initializeDom();
		},
		addToCartTile : function (form,isSubItem,currDiv) {

			var data = form.serialize();
			var closeRedirect = true;
			app.cart.update(data, function (response) {
				var uuid = form.find("input[name='uuid']");
				if (uuid.length > 0 && uuid.val().length > 0) {
					app.cart.refresh();
				}
				else {
					if (!isSubItem) {
						app.quickView.close();
					}
					app.minicart.show(response);
					app.product.openPopup(currDiv,closeRedirect);
				}
			});

		},
		swatchInit : function (url,currentAddToCartBtn) {
			app.ajax.getJson({
				url : app.util.appendParamToURL(url, "format", "ajax"),
				callback : function (response) {
					if (response != null && response != undefined  && response.success) {
						currentAddToCartBtn.removeClass('hide');
						var availmsg = response.availabilityStatus.toLowerCase().replace('_',' ');
						currentAddToCartBtn.closest('div').parent().find('.reviews_stock_cont').find('.panb2c-tile-inventory').text(availmsg);
						if(response.strandsIDS != undefined && response.strandsIDS != null && response.strandsIDS.length > 0){
							currentAddToCartBtn.parent().find('#strandspids').val(response.strandsIDS.toString().trim());
						}else{
							currentAddToCartBtn.parent().find('#strandspids').val('');
						}
					}else{
						currentAddToCartBtn.addClass('hide');
						var availmsg = response.availabilityStatus.toLowerCase().replace('_',' ');
						currentAddToCartBtn.closest('div').parent().find('.reviews_stock_cont').find('.panb2c-tile-inventory').text(availmsg);
						if(response.strandsIDS != undefined && response.strandsIDS != null && response.strandsIDS.length > 0){
							currentAddToCartBtn.parent().find('#strandspids').val(response.strandsIDS.toString().trim());
						}else{
							currentAddToCartBtn.parent().find('#strandspids').val('');
						}
					}
					if(response != null && response != undefined  && response.pid != null && response.pid != undefined){
						currentAddToCartBtn.closest('.product-tile').attr('data-itemid',response.pid.toString().trim());
						currentAddToCartBtn.parent().find("input[name='pid']").val(response.pid.toString().trim());
					}
				}
			});

		},
		setRecommendationsPids: function (form) {
			var currForm = form;
			var pid = currForm.find("input[name='pid']").val();
			app.ajax.getJson({
				url : app.util.appendParamToURL(app.urls.getPLPRecommendations, "pid", pid),
				callback : function (response) {
					if(typeof response =='object' && response != null && response != undefined  && response.success && response.strandsIDS.length > 0) {
						currForm.find("input[name='strandsPids']").val(response.strandsIDS.toString().trim());
					}else{
						currForm.find("input[name='strandsPids']").val('');
					}
				}
			});
		}
	};

}(window.app = window.app || {}, jQuery));

/**
 * @class app.product.compare
 */
(function (app, $) {
	var $cache = {},
		_currentCategory = "",
		_isClearing = false,
		MAX_ACTIVE = 5,
		CI_PREFIX = "ci-";

	/**
	 * @private
	 * @function
	 * @description Verifies the number of elements in the compare container and updates it with sequential classes for ui targeting
	 */
	function refreshContainer() {
		if (_isClearing) { return; }

		var ac = $cache.compareContainer.find(".active").length;

		if (ac < 2) {
			$cache.compareButton.attr("disabled", "disabled");
		}
		else {
			$cache.compareButton.removeAttr("disabled");
		}

		// update list with sequential classes for ui targeting
		var compareItems = $cache.compareContainer.find('.compare-item');
		for( i=0; i < compareItems.length; i++ ){
			compareItems.removeClass('compare-item-' + i);
			$(compareItems[i]).addClass('compare-item-' + i);
		}

		$cache.compareContainer.toggle(ac > 0);

	}
	/**
	 * @private
	 * @function
	 * @description Adds an item to the compare container and refreshes it
	 */
	function addToList(data) {
		// get the first compare-item not currently active
		var item = $cache.compareContainer.find(".compare-item").not(".active").first();
		var tile = $("#"+data.uuid);
		if (item.length===0) {
			if(tile.length > 0) {
				tile.find(".compare-check")[0].checked = false;
				tile.find('.custom-checkbox').removeClass('active');
			}
			window.alert(app.resources.COMPARE_ADD_FAIL)
			return;
		} // safety only

		// if already added somehow, return
		if ($("#"+CI_PREFIX+data.uuid).length > 0) {
			return;
		}
		// set as active item
		item.addClass("active")
			.attr("id", CI_PREFIX+data.uuid)
			.data("itemid", data.itemid);
		item.attr("data-pid",data.itemid);
		// replace the item image
		var itemImg = item.children("img.compareproduct").first();
		itemImg.attr({src : $(data.img).attr("src"), alt : $(data.img).attr("alt")});

		// refresh container state
		refreshContainer();

		if (tile.length===0) { return; }

		// ensure that the associated checkbox is checked
		tile.find(".compare-check")[0].checked = true;
	}
	/**
	 * @private
	 * @function
	 * description Removes an item from the compare container and refreshes it
	 */
	function removeFromList(uuid) {
		var item = $("#"+CI_PREFIX+uuid);
		if (item.length===0) { return; }

		// replace the item image
		var itemImg = item.children("img.compareproduct").first();
		itemImg.attr({src : app.urls.compareEmptyImage, alt : app.resources.EMPTY_IMG_ALT});

		// remove class, data and id from item
		item.removeClass("active")
			.removeAttr("id")
			.removeAttr("data-itemid")
			.data("itemid", "");

		// use clone to prevent image flash when removing item from list
		var cloneItem = item.clone();
		item.remove();
		cloneItem.appendTo($cache.comparePanel);
		refreshContainer();
		// ensure that the associated checkbox is not checked
		var tile = $("#"+uuid);
		if (tile.length === 0 ) { return; }

		tile.find(".compare-check")[0].checked = false;
		tile.find('.custom-checkbox').removeClass('active');
	}
	/**
	 * @private
	 * @function
	 * description Initializes the cache of compare container
	 */
	function initializeCache() {
		$cache = {
			primaryContent : $("#primary"),
			compareContainer : $("#compare-items"),
			compareButton : $("#compare-items-button"),
			clearButton : $("#clear-compared-items"),
			comparePanel : $("#compare-items-panel")
		};
	}
	/**
	 * @private
	 * @function
	 * @description Initializes the DOM-Object of the compare container
	 */
	function initializeDom() {
		_currentCategory = $cache.compareContainer.data("category") || "";
		var active = $cache.compareContainer.find(".compare-item").filter(".active");
		active.each(function () {
			var uuid = this.id.substr(CI_PREFIX.length);
			var tile = $("#"+uuid);
			if (tile.length === 0 ) { return; }

			tile.find(".compare-check")[0].checked = true;
		});
		// set container state
		refreshContainer();
	}
	/**
	 * @private
	 * @function
	 * @description Initializes the events on the compare container
	 */
	function initializeEvents() {
		// add event to buttons to remove products
		$cache.primaryContent.on("click", ".compare-item-remove", function (e, async) {
			var item = $(this).closest(".compare-item");
			var uuid = item[0].id.substr(CI_PREFIX.length);
			var tile = $("#"+uuid);
			var args = {
				itemid : item.data("itemid"),
				uuid : uuid,
				cb :  tile.length===0 ? null : tile.find(".compare-check"),
				async : async
			};
			app.product.compare.removeProduct(args);
			refreshContainer();
		});

		// Button to go to compare page
		/*
		  Start JIRA PREV-75 : Compare page: "COMPARE ITEMS" button in full comparison grid should not be clickable. Added not(:disabled)
		 */
		$cache.primaryContent.on("click", "#compare-items-button:not(:disabled)", function () {
			window.location.href = app.util.appendParamToURL(app.urls.compareShow, "category", _currentCategory);
		});
		/* End JIRA PREV-75*/

		// Button to clear all compared items
		$cache.primaryContent.on("click", "#clear-compared-items", function () {
			_isClearing = true;
			$cache.compareContainer.hide()
								   .find(".active .compare-item-remove")
								   .trigger("click", [false]);
			_isClearing = false;

		});
	}

	/*************** app.product.compare public object ***************/
	app.product.compare = {
		/**
		 * @function
		 * @description Cache, events and initialization
		 */
		init : function () {
			initializeCache();
			initializeDom();
			initializeEvents();
		},
		initCache : initializeCache,
		/**
		 * @function
		 * @description Adds product to the compare table
		 */
		addProduct : function (args) {
			var items = $cache.compareContainer.find(".compare-item");
			var cb = $(args.cb);
			var ac = items.filter(".active").length;
			if(ac===MAX_ACTIVE) {
				if(!window.confirm(app.resources.COMPARE_CONFIRMATION)) {
					cb[0].checked = false;
					cb.closest('.custom-checkbox').removeClass('active');
					return;
				}

				// remove product using id
				var item = items.first();

				// safety check only. should never occur.
				if (item[0].id.indexOf(CI_PREFIX)!==0) {
					cb[0].checked = false;
					cb.closest('.custom-checkbox').removeClass('active');
					window.alert(app.resources.COMPARE_ADD_FAIL);
					return;
				}
				var uuid = item[0].id.substr(CI_PREFIX.length);
				app.product.compare.removeProduct({
					itemid: item.data("itemid"),
					uuid: uuid,
					cb: $("#"+uuid).find(".compare-check"),
					ajaxCall: false
				});
			}

			app.ajax.getJson({
				url : app.urls.compareAdd,
				data : { 'pid' : args.itemid, 'category' : _currentCategory },
				callback : function (response) {
					if (!response || !response.success) {
						// response failed. uncheck the checkbox return
						cb[0].checked = false;
						cb.closest('.custom-checkbox').removeClass('active');
						window.alert(app.resources.COMPARE_ADD_FAIL);
						return;
					}

					// item successfully stored in session, now add to list...
					addToList(args);
				}
			});
		},
		/**
		 * @function
		 * @description Removes product from the compare table
		 */
		removeProduct : function (args) {
			if (!args.itemid) { return; }
			var cb = args.cb ? $(args.cb) : null;
			var ajaxCall = args.ajaxCall ? $(args.ajaxCall) : true;
			if(ajaxCall) {
				app.ajax.getJson({
					url : app.urls.compareRemove,
					async: false,//JIRA PREV-72 : Compare page: 'Clear All' button functionality is not working fine.Added to remove all the products at once.
					data : { 'pid' : args.itemid, 'category' : _currentCategory },
					callback : function (response) {
						if (!response || !response.success) {
							// response failed. uncheck the checkbox return
							if (cb && cb.length > 0) { cb[0].checked = true; }
							window.alert(app.resources.COMPARE_REMOVE_FAIL);
							return;
						}

						// item successfully removed session, now remove from to list...
						removeFromList(args.uuid);
					}
				});
			} else {
				app.ajax.getJson({
					url : app.urls.compareRemove,
			        async: false,
					data : { 'pid' : args.itemid, 'category' : _currentCategory },
					callback : function (response) {
						if (!response || !response.success) {
							// response failed. uncheck the checkbox return
							if (cb && cb.length > 0) { cb[0].checked = true; }
							window.alert(app.resources.COMPARE_REMOVE_FAIL);
							return;
						}

						// item successfully removed session, now remove from to list...
						removeFromList(args.uuid);
					}
				});
			}

		}
	};

}(window.app = window.app || {}, jQuery));

/**
 * @class app.compare
 */
(function (app, $) {
	var $cache = {};
	/**
	 * @private
	 * @function
	 * @description Initializes the cache on the compare table
	 */
	function initializeCache() {
		$cache = {
			compareTable : $("#compare-table"),
			categoryList : $("#compare-category-list")
		};
	}
	/**
	 * @private
	 * @function
	 * @description Initializes the DOM on the product tile
	 */
	function initializeDom() {
		app.product.tile.init();
	}
	/**
	 * @private
	 * @function
	 * @description Binds the click events to the remove-link and quick-view button
	 */
	function initializeEvents() {
		$cache.compareTable.on("click", ".remove-link", function (e) {
			e.preventDefault();
			app.ajax.getJson({
				url : this.href,
				callback : function (response) {
				/* Start JIRA PREV-74 : Compare page: Not navigating to PLP, When user clicks the "Remove (X)" icon on the last product,present in the product compare page.
				 * Added condition to check for the last product removal if so navigate back to previous PLP.
				 */

					if(response.success && $("#compare-table .product-tile").length <= 1 && $("#compare-category-list").length == 0){
						window.location.href = $(".back").attr("href");
					}else if(response.success && $("#compare-table .product-tile").length <= 1 && $("#compare-category-list").length > 0){
						$("#compare-category-list option:selected").remove();
						$("#compare-category-list").trigger("change");
					}else{
					app.page.refresh();
				}
				/*End JIRA PREV-74 */
				}
			});
		})
		.on("click", ".open-quick-view", function (e) {
			e.preventDefault();
			var form = $(this).closest("form");
			app.quickView.show({
				url:form.attr("action"),
				source:"quickview",
				data:form.serialize()
			});
		});

		$cache.categoryList.on("change", function () {
			$(this).closest("form").submit();
		});
	}

	/*************** app.compare public object ***************/
	app.compare = {
		/**
		 * @function
		 * @description Initializing of Cache, DOM and events
		 */
		init : function () {
			initializeCache();
			initializeDom();
			initializeEvents();
			app.product.initAddToCart();
		}
	};


}(window.app = window.app || {}, jQuery));

/**
 * @class app.sendToFriend
 */
(function (app, $) {
	var $cache = {},
		initialized=false;
	/**
	 * @private
	 * @function
	 * @description Initializes the events (preview, send, edit, cancel and close) on the send to friend form
	 */
	function initializeEvents() {
		app.util.limitCharacters();
		if (initialized) {return; }
		$cache.dialog.on("click", ".preview-button, .send-button, .edit-button", function (e) {
			e.preventDefault();
			$cache.form.validate();
			if (!$cache.form.valid()) {
				return false;
			}
			var requestType = $cache.form.find("#request-type");
			if (requestType.length>0) {
				requestType.remove();
			}
			$("<input/>").attr({id:"request-type", type:"hidden", name:$(this).attr("name"), value:$(this).attr("value")}).appendTo($cache.form);
			var data = $cache.form.serialize();
			app.ajax.load({url:$cache.form.attr("action"),
				   data: data,
				   target: $cache.dialog,
				   callback: function() {
						app.validator.init();
						app.util.limitCharacters();
						$cache.form = $("#send-to-friend-form");
						$(".ui-dialog-content").dialog("option", "position", "center");
				   }
			});
		})
		.on("click", ".cancel-button, .close-button", function (e) {
			e.preventDefault();
			$cache.dialog.dialog("close");
		});
		initialized=true;
	}

	/*************** app.sendToFriend public object ***************/
	app.sendToFriend = {
		init : function () {
			$cache = {
				form: $("#send-to-friend-form"),
				dialog: $("#send-to-friend-dialog"),
				pdpForm: $("form.pdpForm")
			};
			initializeEvents();
		},

		/**
		 * @function
		 * @description
		 */
		initializeDialog : function (eventDelegate, eventTarget) {
			$(eventDelegate).on("click", eventTarget, function (e) {
				e.preventDefault();
				var dlg = app.dialog.create({target:$("#send-to-friend-dialog"), options:{
					width:800,
					height:'auto',
					title:this.title,
					open:function() {
						app.sendToFriend.init();
						app.validator.init();
					}
				}});

				var data = app.util.getQueryStringParams($("form.pdpForm").serialize());
				if (data.cartAction) {
					delete data.cartAction;
				}
				var url = app.util.appendParamsToUrl(this.href, data);
				url = this.protocol + "//" + this.hostname + ((url.charAt(0)==="/") ? url : ("/"+url));
				app.ajax.load({
					url:app.util.ajaxUrl(url),
					target:dlg,
					callback: function () {
						dlg.dialog("open");	 // open after load to ensure dialog is centered
					}
				});
			});
		}
	};

}(window.app = window.app || {}, jQuery));


/**
 * @class app.search
 */
(function (app, $) {
	var $cache = {};

	/**
	 * @private
	 * @function
	 * @description
	 */
	function infiniteScroll()
	{
		// getting the hidden div, which is the placeholder for the next page
		var loadingPlaceHolder = $('.infinite-scroll-placeholder[data-loading-state="unloaded"]');
		// get url hidden in DOM
		var gridUrl = loadingPlaceHolder.attr('data-grid-url');

		if (loadingPlaceHolder.length == 1 && app.util.elementInViewport(loadingPlaceHolder.get(0), 250)) {
			// switch state to 'loading'
			// - switches state, so the above selector is only matching once
			// - shows loading indicator
			loadingPlaceHolder.attr('data-loading-state','loading');
			loadingPlaceHolder.addClass('infinite-scroll-loading');

			/**
			 * named wrapper function, which can either be called, if cache is hit, or ajax repsonse is received
			 */
			var fillEndlessScrollChunk = function (html) {
				loadingPlaceHolder.removeClass('infinite-scroll-loading');
				loadingPlaceHolder.attr('data-loading-state','loaded');
				jQuery('div.search-result-content').append(html);
			};

			// old condition for caching was `'sessionStorage' in window && sessionStorage["scroll-cache_" + gridUrl]`
			// it was removed to temporarily address RAP-2649
			if (false) {
				// if we hit the cache
				fillEndlessScrollChunk(sessionStorage["scroll-cache_" + gridUrl]);
			} else {
				// else do query via ajax
				jQuery.ajax({
					type: "GET",
					dataType: 'html',
					url: gridUrl,
					success: function(response) {
						// put response into cache
						try {
							sessionStorage["scroll-cache_" + gridUrl] = response;
						} catch (e) {
							// nothing to catch in case of out of memory of session storage
							// it will fall back to load via ajax
						}
						// update UI
						fillEndlessScrollChunk(response);
						app.product.tile.init();
					}
				});
			}
		}
	};
	/**
	 * @private
	 * @function
	 * @description replaces breadcrumbs, lefthand nav and product listing with ajax and puts a loading indicator over the product listing
	 */
	function updateProductListing() {
		window.location.hash = decodeURIComponent(window.location.hash);
		var hash = window.location.hash.substr(1);
		var refineUrl;
		if(hash.length > 0) {
			refineUrl = window.location.pathname + "?" + hash;
		}else if($('#grid-sort-header option').length > 0) {
			refineUrl = window.location.pathname + "?" + $('#grid-sort-header option:selected').val().split('?')[1];
		}else{
			return false;
		}
		// Start PANC-459 : Extra condition for support site
		if((location.search.substring(1).trim().length >0) && (typeof JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}').supportpage != undefined )&& (JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}').supportpage ))
			{
			   refineUrl = refineUrl + '&supportpage=true';
			}
		//End PANC-459 : Extra condition for support site
		app.progress.show($cache.content);

		$.ajax({
			type : "POST",
			dataType : "html",
			url : app.util.appendParamToURL(refineUrl, "format", "ajax")
		})
		.done(function (response) {
			// success
			$cache.main.html(response);
			app.product.compare.init();
			app.product.tile.init();
			app.progress.hide();
			app.tooltips.init();
			app.uievents.init();
			app.searchplaceholder.init();
			app.salesforce.init();
			app.searchsuggest.init("div.global-search");
			//app.initUiCache();
			$('body,html').scrollTop(0);
		});
	}

	/**
	 * @private
	 * @function
	 * @description Initializes events for the following elements:<br/>
	 * <p>refinement blocks</p>
	 * <p>updating grid: refinements, pagination, breadcrumb</p>
	 * <p>item click</p>
	 * <p>sorting changes</p>
	 */
	function initializeEvents() {

		// compare checked
		$cache.main.on("click", "input[type='checkbox'].compare-check", function (e) {
			var cb = $(this);
			var tile = cb.closest(".product-tile");
			var func = this.checked ? app.product.compare.addProduct : app.product.compare.removeProduct;
			var itemImg = tile.find("div.product-image a img").first();
			/* Farhans DEV team PANC-1143 18/12/2015 4:15pm */
			if(func==app.product.compare.removeProduct){
				var pid = $("#ci-"+tile[0].id).attr("data-pid");
			}
			else if(tile.find(".add-cart-plp form input#pid").val()!="null"){
 				var pid = tile.find(".add-cart-plp form input#pid").val();
 			}else{
				var pid = tile.data("itemid");
			}
			func({
			    itemid : pid,
				uuid : tile[0].id,
				img : itemImg,
				cb : cb
			});

		});
		/*  PANC-1143 END */

		// handle toggle refinement blocks
		$cache.main.find('.refinement h3.toggle').unbind('click').on("click",function (e) {
			$(this).toggleClass('expanded');
			if($(this).hasClass('expanded')){
				$(this).siblings('ul').slideDown(200);
			}else{
				$(this).siblings('ul').slideUp(200);
			}
		});


		$cache.main.on("click", "#category-level-1 > li.expandable .spriteico", function (e) {
			e.preventDefault();
			$(this).toggleClass('active');
			if($(this).hasClass('active')){
				$(this).closest('li').find('> ul').slideDown(200);
			}else{
				$(this).closest('li').find('> ul').slideUp(200);
			}
		});

		// handle events for updating grid
		$cache.main.on("click", ".refinements a, .pagination a, .breadcrumb-refinement-value a", function (e) {
			var currentBeginIndex = parseInt($('.currentBeginIndex').val());
			var currentPage = $(this).text();
			if($.isNumeric(currentBeginIndex)){
				//Start JIRA PANC-479 : category landing pages pagination changes
				if(currentPage == "PREV"){
					var nextBeginIndex = currentBeginIndex - 1;
				}else{
					var nextBeginIndex = currentBeginIndex + 1;
				}
				//End JIRA PANC-479: category landing pages pagination changes
				if(currentPage == "NEXT" || currentPage == "PREV"){
				} else {
					nextBeginIndex = currentBeginIndex;
				}
			}

			if ($(this).parent().hasClass("unselectable")) { return; }
			var catparent = $(this).parents('.category-refinement');
			var folderparent = $(this).parents('.folder-refinement');

			//if the anchor tag is uunderneath a div with the class names & , prevent the double encoding of the url
			//else handle the encoding for the url
			if (catparent.length > 0 || folderparent.length > 0 ) {
				return true;
			} else {
				e.preventDefault();
				var uri = app.util.getUri(this);
				var url = app.util.appendParamToURL(this.href);
				if(nextBeginIndex == undefined){
					nextBeginIndex=0;
				}
				var uriSubStr = uri.query.substring(1) + "&nextIndex="+nextBeginIndex;
				if ( uri.query.length > 1 ) {
					// [RAP-2653] requires special handling for 's encoding of ampersands
					var isFirefox = (navigator.userAgent).toLowerCase().indexOf('firefox') >= 0;
					window.location.hash = 	isFirefox ? encodeURI(decodeURI(uriSubStr)) : uriSubStr;
				} else {
					window.location.href = url;
				}
				return false;
			}
		});

		// handle events item click. append params.
		$cache.main.on("click", ".product-tile a:not('#quickviewbutton')", function (e) {
			var a = $(this);
			// get current page refinement values
			var wl = window.location;

			var qsParams = (wl.search.length > 1) ? app.util.getQueryStringParams(wl.search.substr(1)) : {};
			var hashParams = (wl.hash.length > 1) ? app.util.getQueryStringParams(wl.hash.substr(1)) : {};

			// merge hash params with querystring params
			var params = $.extend(hashParams, qsParams);
			if (!params.start) {
				params.start = 0;
			}
			// get the index of the selected item and save as start parameter
			var tile = a.closest(".product-tile");
			var idx = tile.data("idx") ? +tile.data("idx") : 0;
			/*Start JIRA PREV-50:Next and Previous links will not be displayed on PDP if user navigate from Quick View.Added cgid to hash*/
			if(!params.cgid && tile.data("cgid") != null && tile.data("cgid") != ""){
				params.cgid=tile.data("cgid");
			}
			/*End JIRA PREV-50*/
			// convert params.start to integer and add index
			params.start=(+params.start)+(idx+1);
			// set the hash and allow normal action to continue
			a[0].hash = $.param(params);
		});

		// handle sorting change
		$cache.main.on("change", ".sort-by select", function (e) {
			var refineUrl = $(this).find('option:selected').val();
			var uri = app.util.getUri(refineUrl);
			window.location.hash = uri.query.substr(1);
			return false;
		})
		.on("change", ".items-per-page select", function (e) {
			var refineUrl = $(this).find('option:selected').val();
			if (refineUrl == "INFINITE_SCROLL") {
				jQuery('html').addClass('infinite-scroll');
				jQuery('html').removeClass('disable-infinite-scroll');
			} else {
				jQuery('html').addClass('disable-infinite-scroll');
				jQuery('html').removeClass('infinite-scroll');
				var uri = app.util.getUri(refineUrl);
				window.location.hash = uri.query.substr(1);
			}
			return false;
		});

		// handle hash change
		$(window).hashchange(function () {
			updateProductListing(true);
		});
	}
	/******* app.search public object ********/
	app.search = {
		init : function () {
			$cache = {
				main : $("#main"),
				items : $("#search-result-items"),
				content :$(".pt_product-search-result .search-result-content")
			};

			if (app.product.compare) {
				app.product.compare.init();
			}

			if($('.pt_product-search-result').length > 0){
				updateProductListing(false);
			}

			if (app.clientcache.LISTING_INFINITE_SCROLL) {
				$(window).on('scroll', infiniteScroll);
			}

			app.product.tile.init();
			initializeEvents();

		}
	};

}(window.app = window.app || {}, jQuery));
/**
 * @class app.bonusProductsView
 */
(function (app, $) {
	var $cache = {};
	var selectedList = [];
	var maxItems = 1;
	var bliUUID = "";
	/**
	 * @private
	 * @function
	 * description Gets a list of bonus products related to a promoted product
	 */
	function getBonusProducts() {
		var o = {};
		o.bonusproducts = [];

		var i, len;
		for (i=0, len=selectedList.length;i<len;i++) {
			var p = { pid : selectedList[i].pid,	qty : selectedList[i].qty, options : {} };
			var a, alen, bp=selectedList[i];
			for (a=0,alen=bp.options.length;a<alen;a++) {
				var opt = bp.options[a];
				p.options = {optionName:opt.name,optionValue:opt.value};
			}
			o.bonusproducts.push({product:p});
		}
		return o;
	}
	/**
	 * @private
	 * @function
	 * @description Updates the summary page with the selected bonus product
	 */
	function updateSummary() {
		if (selectedList.length===0) {
			$cache.bonusProductList.find("li.selected-bonus-item").remove();
		}
		else {
			var ulList = $cache.bonusProductList.find("ul.selected-bonus-items").first();
			var itemTemplate = ulList.children(".selected-item-template").first();
			var i, len;
			for (i=0, len=selectedList.length;i<len;i++) {
				var item = selectedList[i];
				var li = itemTemplate.clone().removeClass("selected-item-template").addClass("selected-bonus-item");
				li.data("uuid", item.uuid).data("pid", item.pid);
				li.find(".item-name").html(item.name);
				li.find(".item-qty").html(item.qty);
				var ulAtts = li.find(".item-attributes");
				var attTemplate = ulAtts.children().first().clone();
				ulAtts.empty();
				var att;
				for (att in item.attributes) {
					var attLi = attTemplate.clone();
					attLi.addClass(att);
					attLi.children(".display-name").html(item.attributes[att].displayName);
					attLi.children(".display-value").html(item.attributes[att].displayValue);
					attLi.appendTo(ulAtts);
				}
				li.appendTo(ulList);
			}
			ulList.children(".selected-bonus-item").show();
		}

		// get remaining item count
		var remain = maxItems - selectedList.length;
		$cache.bonusProductList.find(".bonus-items-available").text(remain);
		if (remain <= 0) {
			$cache.bonusProductList.find("button.button-select-bonus").attr("disabled", "disabled");
		}
		else {
			$cache.bonusProductList.find("button.button-select-bonus").removeAttr("disabled");
		}
	}
	/********* public app.bonusProductsView object *********/
	app.bonusProductsView = {
		/**
		 * @function
		 * @description Initializes the bonus product dialog
		 */
		init : function () {
			$cache = {
				bonusProduct : $("#bonus-product-dialog"),
				resultArea : $("#product-result-area")
			};
		},
		/**
		 * @function
		 * @description Opens the bonus product quick view dialog
		 */
		show : function (url) {
			// add element to cache if it does not already exist
			if(!$cache.bonusProduct) {
				app.bonusProductsView.init();
			}

			// create the dialog
			$cache.bonusProduct = app.dialog.create({
				target : $cache.bonusProduct,
				options : {
					width: 795,
					dialogClass : 'quickview',
					title : app.resources.BONUS_PRODUCTS
				}
			});

			// load the products then show
			app.ajax.load({
				target : $cache.bonusProduct,
				url : url,
				callback : function () {
					$cache.bonusProduct.dialog('open');
					app.bonusProductsView.initializeGrid();
					$('#bonus-product-dialog .emptyswatch').css('display','none');
				}
			});

		},
		/**
		 * @function
		 * @description Closes the bonus product quick view dialog
		 */
		close : function () {
			$cache.bonusProduct.dialog('close');
		},
		/**
		 * @function
		 * @description Loads the list of bonus products into quick view dialog
		 */
		loadBonusOption : function () {
			$cache.bonusDiscountContainer = $(".bonus-discount-container");
			if ($cache.bonusDiscountContainer.length===0) { return; }

			app.dialog.create({
				target : $cache.bonusDiscountContainer,
				options : {
					height : 'auto',
					width : 350,
					dialogClass : 'quickview',
					title : app.resources.BONUS_PRODUCT
				}
			});
			$cache.bonusDiscountContainer.dialog('open');

			// add event handlers
			$cache.bonusDiscountContainer.on("click", ".select-bonus-btn", function (e) {
				e.preventDefault();
				var uuid = $cache.bonusDiscountContainer.data("lineitemid");
				var url = app.util.appendParamsToUrl(app.urls.getBonusProducts,
													 {
														bonusDiscountLineItemUUID : uuid,
														source : "bonus"
													 });

				$cache.bonusDiscountContainer.dialog('close');
				app.bonusProductsView.show(url);
			}).on("click", ".no-bonus-btn", function (e) {
				$cache.bonusDiscountContainer.dialog('close');
			});
		},

		/**
		 * @function
		 * @description
		 */
		initializeGrid : function () {
			$cache.bonusProductList = $("#bonus-product-list"),
				bliData = $cache.bonusProductList.data("line-item-detail");

			maxItems = bliData.maxItems;
			bliUUID = bliData.uuid;

			if (bliData.itemCount>=maxItems) {
				$cache.bonusProductList.find("button.button-select-bonus").attr("disabled", "disabled");
			}

			var cartItems = $cache.bonusProductList.find(".selected-bonus-item");

			cartItems.each(function() {
				var ci = $(this);

				var product = {
					uuid : ci.data("uuid"),
					pid : ci.data("pid"),
					qty : ci.find(".item-qty").text(),
					name : ci.find(".item-name").html(),
					attributes: {}
				};
				var attributes = ci.find("ul.item-attributes li");
				attributes.each(function(){
					var li = $(this);
					product.attributes[li.data("attributeId")] = {
						displayName:li.children(".display-name").html(),
						displayValue:li.children(".display-value").html()
					};
				});
				selectedList.push(product);
			});


			$cache.bonusProductList.on("click", "div.bonus-product-item a[href].swatchanchor", function (e) {
				e.preventDefault();

				var anchor = $(this),
					bpItem = anchor.closest(".bonus-product-item"),
					bpForm = bpItem.find("form.bonus-product-form"),
					qty = bpForm.find("input[name='Quantity']").first().val(),
					params = {
						Quantity : isNaN(qty) ? "1" : qty,
						format : "ajax",
						source : "bonus",
						bonusDiscountLineItemUUID : bliUUID
					};

				var url = app.util.appendParamsToUrl(this.href, params);

				app.progress.show(bpItem);
				app.ajax.load({
					url: url,
					callback : function (data) {
						bpItem.html(data);
					}
				});
			})
			.on("click", "button.button-select-bonus", function (e) {
				e.preventDefault();
				if (selectedList.length>=maxItems) {
					$cache.bonusProductList.find("button.button-select-bonus").attr("disabled", "disabled");
					$cache.bonusProductList.find("bonus-items-available").text("0");
					return;
				}

				var form = $(this).closest("form.bonus-product-form"),
					detail = $(this).closest(".product-detail");
					uuid = form.find("input[name='productUUID']").val(),
					qtyVal = form.find("input[name='Quantity']").val(),
					qty = isNaN(qtyVal) ? 1 : (+qtyVal);

				var product = {
					uuid : uuid,
					pid : form.find("input[name='pid']").val(),
					qty : qty,
					name : detail.find(".product-name").text(),
					attributes : detail.find(".product-variations").data("current"),
					options : []
				};

				var optionSelects = form.find("select.product-option");

				optionSelects.each(function (idx) {
					product.options.push({
						name : this.name,
						value : $(this).val(),
						display : $(this).children(":selected").first().html()
					});
				});
				selectedList.push(product);
				updateSummary();
			})
			.on("click", ".remove-link", function(e){
				e.preventDefault();
				var container = $(this).closest("li.selected-bonus-item");
				if (!container.data("uuid")) { return; }

				var uuid = container.data("uuid");
				var i, len = selectedList.length;
				for(i=0;i<len;i++) {
					if (selectedList[i].uuid===uuid) {
						selectedList.splice(i,1);
						break;
					}
				}
				updateSummary();
			})
			.on("click", ".add-to-cart-bonus", function (e) {
				e.preventDefault();
				var url = app.util.appendParamsToUrl(app.urls.addBonusProduct, {bonusDiscountLineItemUUID:bliUUID});
				var bonusProducts = getBonusProducts();
				if (bonusProducts.bonusproducts[0].product.qty > maxItems) {
					bonusProducts.bonusproducts[0].product.qty = maxItems;
				}
				// make the server call
				$.ajax({
					type : "POST",
					dataType : "json",
					cache	: false,
					contentType : "application/json",
					url : url,
					data : JSON.stringify(bonusProducts)
				})
				.done(function (response) {
					// success
					app.page.refresh();
				})
				.fail(function (xhr, textStatus) {
					// failed
					if(textStatus === "parsererror") {
						window.alert(app.resources.BAD_RESPONSE);
					} else {
						window.alert(app.resources.SERVER_CONNECTION_ERROR);
					}
				})
				.always(function () {
					$cache.bonusProduct.dialog("close");
				});

			});
		}
	};

}(window.app = window.app || {}, jQuery));

/**
 * @class app.giftcert
 * @description Loads gift certificate details
 */
(function (app, $) {
	var $cache;

	function setAddToCartHandler(e) {
		e.preventDefault();
		var form = $(this).closest("form");

		var options = {
			url : app.util.ajaxUrl(form.attr('action')),
			method : 'POST',
			cache: false,
			contentType : 'application/json',
			data : form.serialize()
		};
		$.ajax(options).done(function (response) {
			if( response.success ) {
				app.ajax.load({
					url : app.urls.minicartGC,
					data :{lineItemId : response.result.lineItemId},
					callback : function(response){
						app.minicart.show(response);
						form.find('input,textarea').val('');
					}
				});
			} else {
				form.find('span.error').hide();
				for( id in response.errors.FormErrors ) {
					var error_el = $('#'+id).addClass('error').removeClass('valid').next('.error');
					if( !error_el || error_el.length===0 ) {
						error_el = $('<span for="'+id+'" generated="true" class="error" style=""></span>');
						$('#'+id).after(error_el);
					}
					error_el.text(response.errors.FormErrors[id].replace(/\\'/g,"'")).show();
				}
				console.log(JSON.stringify(response.errors));
			}
		}).fail(function (xhr, textStatus) {
			// failed
			if(textStatus === "parsererror") {
				window.alert(app.resources.BAD_RESPONSE);
			} else {
				window.alert(app.resources.SERVER_CONNECTION_ERROR);
			}
		});
	}

	function initializeCache() {
		$cache = {
			addToCart : $("#AddToBasketButton")
		};
	}

	function initializeEvents() {
		$cache.addToCart.on('click', setAddToCartHandler);
	}

	app.giftcert = {
		init : function(){
			initializeCache();
			initializeEvents();
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.giftcard
 * @description Loads gift certificate details
 */
(function (app, $) {

	app.giftcard = {
		/**
		 * @function
		 * @description Load details to a given gift certificate
		 * @param {String} id The ID of the gift certificate
		 * @param {Function} callback A function to called
		 */
		checkBalance : function (id, pin , callback) {
			// load gift certificate details
			var url = app.util.appendParamToURL(app.urls.giftCardCheckBalance, "giftCertificateID", id);
			url = app.util.appendParamToURL(url, "gcPin", pin);
			app.ajax.getJson({
				url: url,
				callback: callback
			});
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.checkout
 */
(function (app, $) {
	var $cache = {},
		isShipping = false,
		isMultiShipping = false,
		shippingMethods = null;

	/**
	 * @function
	 * @description Helper method which constructs a URL for an AJAX request using the
	 * entered address information as URL request parameters.
	 */
	function getShippingMethodURL(url) {
		var newUrl = app.util.appendParamsToUrl(url,
												{
													address1:$cache.address1.val(),
													address2:$cache.address2.val(),
													countryCode:$cache.countryCode.val(),
												 	stateCode:$cache.stateCode.val(),
												 	postalCode:$cache.postalCode.val(),
												 	city:$cache.city.val()
												 },
												 true);
		return newUrl;
	}

	/**
	 * @function
	 * @description updates the order summary based on a possibly recalculated basket after a shipping promotion has been applied
	 */
	function updateSummary() {
		var shippingflag=$('.shipping-flag');
		if(shippingflag != undefined && shippingflag.length > 0){
			var url = app.util.appendParamsToUrl(app.urls.summaryRefreshURL, {p_shippingpage:shippingflag.val()});
		}else{
			var url = app.urls.summaryRefreshURL;
		}
		var summary = $("#secondary .mini-summary-sec");
		// indicate progress
		app.progress.show(summary);

		// load the updated summary area
		summary.load( url, function () {
			// hide edit shipping method link
			summary.fadeIn("fast");
			summary.find('.checkout-mini-cart .minishipment .header a').hide();
			summary.find('.order-totals-table .order-shipping .label a').hide();
			app.tooltips.init();
			app.salesforce.init();
		});
	}
	/**
	 * @function
	 * @description selects a shipping method for the default shipment and updates the summary section on the right hand side
	 * @param
	 */
	function selectShippingMethod(shippingMethodID) {
		// nothing entered
		if(!shippingMethodID) {
			return;
		}
		// attempt to set shipping method
		var url = app.util.appendParamsToUrl(app.urls.selectShippingMethodsList,
											 { address1:$cache.address1.val(),
											   address2:$cache.address2.val(),
											   countryCode:$cache.countryCode.val(),
											   stateCode:$cache.stateCode.val(),
											   postalCode:$cache.postalCode.val(),
											   city:$cache.city.val(),
											   shippingMethodID:shippingMethodID
											 },
											 true);

		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				updateSummary();
				if(!data || !data.shippingMethodID) {
					window.alert("Couldn't select shipping method.");
					return false;
				}
				// display promotion in UI and update the summary section,
				// if some promotions were applied
				$(".shippingpromotions").empty();
				if(data.shippingPriceAdjustments && data.shippingPriceAdjustments.length > 0) {
					var i,len=data.shippingPriceAdjustments.length;
					for(i=0; i<len; i++) {
						var spa = data.shippingPriceAdjustments[i];
					}
				}
			}
		});
	}

	//single shipping contiue button -  no addresses in list
	$(document).on('click','.js-singleship-noaddresscontinue-link',function(e){
		e.preventDefault();
		var form = $(".checkout-shipping");

		if(!form.valid()){
			//scrolltoerror();
			return false;
		}
		/*else if($(".singleshipping-section .no-shipping-methods").length > 0){
			return false;
		}*/
		/*// InappropriateWords Checking before continue
		if(InappropriateWordCheck() == true)
		{
			//scrolltoerror();
			return false;
		}*/
		if($('#shiperror').is(':empty') && $('#poBoxErrorMsgadd1').is(':empty') && $('#poBoxErrorMsgadd2').is(':empty')){
			addressValidationDAV();
		}
	});

	//single shipping contiue button -addresse is available in list
	$(document).on('click','.js-singleship-addresscontinue-link',function(e){
		e.preventDefault();
		var form = $(".checkout-shipping");

		if(!form.valid()){
			return false;
		}
	   var address1 = $('input[name$="_shippingAddress_addressFields_address1"]').val();
	   var city = $('input[name$="_shippingAddress_addressFields_city"]').val();
	   var state = $('select[name$="_shippingAddress_addressFields_states_state"]').val();
	   var postal = $('input[name$="_shippingAddress_addressFields_postal"]').val();

	   var saddress1 = $('input[name$="saddress1"]').val();
	   var scity = $('input[name$="scity"]').val();
	   var sstate = $('input[name$="sstate"]').val();
	   var spostal = $('input[name$="spostal"]').val();
		var isPaypal = $('input[name$="isPaypalcheck"]').val();
		if((address1 == saddress1) && (city == scity) && (state == sstate) && (postal == spostal)){
			initContinue('[name$="shippingAddress_save"]', '[id$="singleshipping_shippingAddress"]');
			if(!(state == "AK" || state == "HU")){
				$('.hiddenSaveShipping').trigger('click');
			}
		}else if (isPaypal == "true") {
			initContinue('[name$="shippingAddress_save"]', '[id$="singleshipping_shippingAddress"]');
			$('.hiddenSaveShipping').trigger('click');
		}

		else {
			if($('#shiperror').is(':empty') && $('#poBoxErrorMsgadd1').is(':empty') && $('#poBoxErrorMsgadd2').is(':empty')){
				addressValidationDAV();
			}
		}

	});

	$(document).on('click','#js-actualAddress', function(e){
		e.preventDefault();
		initContinue('[name$="shippingAddress_save"]', '[id$="singleshipping_shippingAddress"]');
		$('.ui-dialog-titlebar-close').trigger("click");
		$('.hiddenSaveShipping').trigger('click');
	});

	$(document).on('click','#js-reenter', function(e){
		e.preventDefault();
		initContinue('[name$="shippingAddress_save"]', '[id$="singleshipping_shippingAddress"]');
		$('.ui-dialog-titlebar-close').trigger("click");

	});
	//single shipping address verification dialog
	$(document).on('click','#js-recommendAddress', function(e){
		e.preventDefault();
		var jsonAddr = JSON.parse($('#crctdAddress').html());
		$.each(jsonAddr, function(k, v) {
			if( k == 'states_state'){
				$('[name$=_shippingAddress_addressFields_'+k+']').val(v);
			}else if(k=="postal"){
            	$('input[name$=_shippingAddress_addressFields_'+k+']').val(v);
            }else if(k=="addToAddressBook"){
            	if(v == "true") {
            		$('input[name$=_shippingAddress_addressFields_'+k+']').attr('checked','checked');
            	} else {
            		$('input[name$=_shippingAddress_addressFields_'+k+']').removeAttr('checked');
            	}
            }else{
            	$('input[name$=_shippingAddress_addressFields_'+k+']').val(v);
            }
        });
		$(".ui-dialog-titlebar-close").trigger("click");
		$('.hiddenSaveShipping').trigger('click');
    });

	//single shipping address verification dialog 'Re-Enter' button
	$(document).on('click','.modal_overlay_show .js-singleship-addressvalidation #js-reenter', function(){
		$('form[id$="singleshipping"]').find('input[type="text"]').not('input[name*="Name"]').each(function(){ $(this).val(''); });
		$('form[id$="singleshipping"]').find('select').val('');
		$(".js-modal-close").trigger("click");
	});

	//single shipping address verification
	function addressValidationDAV(){
		//app.progress.show(".shipping-section.accordion-content");
		$('select[name$="_shippingAddress_addressFields_country"]').val("US");
		var url = app.util.appendParamsToUrl(app.urls.addressValidationURL,
				 { firstName:$('input[name$="_shippingAddress_addressFields_firstName"]').val(),
				   lastName:$('input[name$="_shippingAddress_addressFields_lastName"]').val(),
				   type:$('input[name$="_shippingAddress_addressFields_type"]').val(),
				   companyName:$('input[name$="_shippingAddress_addressFields_companyName"]').val(),
				   address1:$('input[name$="_shippingAddress_addressFields_address1"]').val(),
				   address2:$('input[name$="_shippingAddress_addressFields_address2"]').val(),
				   country:$('select[name$="_shippingAddress_addressFields_country"]').val(),
				   city:$('input[name$="_shippingAddress_addressFields_city"]').val(),
				   state:$('select[name$="_shippingAddress_addressFields_states_state"]').val(),
				   zip:$('input[name$="_shippingAddress_addressFields_postal"]').val()
				 },
				 true);
		$('a.js-single-shippingactiondialog').attr('href', url);
		$('a.js-single-shippingactiondialog').trigger('click');
	}


	/**
	 * @function
	 * @description Make an AJAX request to the server to retrieve the list of applicable shipping methods
	 * based on the merchandise in the cart and the currently entered shipping address
	 * (the address may be only partially entered).  If the list of applicable shipping methods
	 * has changed because new address information has been entered, then issue another AJAX
	 * request which updates the currently selected shipping method (if needed) and also updates
	 * the UI.
	 */
	function updateShippingMethodList() {
		if (!$cache.shippingMethodList || $cache.shippingMethodList.length === 0) { return; }
		var url = getShippingMethodURL(app.urls.shippingMethodsJSON);

		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				if(!data) {
					window.alert("Couldn't get list of applicable shipping methods.");
					return false;
				}
				if (false && shippingMethods && shippingMethods.toString() === data.toString())  // Added false to handle SPC
				{
					// No need to update the UI.  The list has not changed.
					return true;
				}

				// We need to update the UI.  The list has changed.
				// Cache the array of returned shipping methods.
				shippingMethods = data;

				var smlUrl = getShippingMethodURL(app.urls.shippingMethodsList);

				// indicate progress
				app.progress.show($cache.shippingMethodList);

				// load the shipping method form
				$cache.shippingMethodList.load( smlUrl, function () {
					$cache.shippingMethodList.fadeIn("fast");
					// rebind the radio buttons onclick function to a handler.
					$cache.shippingMethodList.find("[name$='_shippingMethodID']").click(function () {
						selectShippingMethod($(this).val());
					});

					// update the summary
					updateSummary();
					app.progress.hide();
					app.tooltips.init();
					app.account.initCartLogin();
				});
			}
		});
	}

	function updateShippingMethodBasedOnState() {
		var stateCode = $cache.stateCode.val();
        if(stateCode != null && stateCode != "") {
        	url = app.util.appendParamsToUrl(app.urls.checkshipment, {
        			address1:$cache.address1.val(),
				 	stateCode:$cache.stateCode.val(),
				 	postalCode:$cache.postalCode.val(),
				 	city:$cache.city.val(),
				 	format:'ajax'});
        	app.ajax.load({
                url: url,
                callback : function (data) {
                      if(JSON.parse(data).success) {
                		updateSummary();
                		$('#shiperror').empty();
                		$("button[name$='_shippingAddress_save']").removeAttr("disabled","disabled");
                      }
                      else {
						$('#shiperror').text(JSON.parse(data).error).css("color","RED");
						$('select[name$="_shippingAddress_addressFields_states_state"]').addClass('error');
						$("button[name$='_shippingAddress_save']").attr("disabled","disabled");
					}

                }
        	});
        }
	}

	/**
	 * @function
	 * @description disable continue button on the page if required inputs are not filled
	 * @input String the selector string of the continue button
	 * @input String the selector string for the form
	 */
	function initContinue(continueSelector, formSelector) {
		var $continue = $(continueSelector);
		var $form = $(formSelector);
		var validator = $form.validate();
		var $requiredInputs = $('.required', $form).find(':input');
		// check for required input
		var hasEmptyRequired = function () {
			// filter out only the visible fields - this allows the checking to work on
			// billing page where some payment methods inputs are hidden
			var requiredValues = $requiredInputs.filter(':visible').map(function () {
				return $(this).val();
			});
			return $.inArray('', requiredValues) !== -1;
		};

		if (!hasEmptyRequired()) {
			// only validate form when all required fields are filled to avoid
			// throwing errors on empty form
			if (validator.form()) {
				$continue.removeAttr('disabled');
			}

		} else {
			if(!$form.hasClass('checkout-billing')){
				$continue.attr('disabled', 'disabled');
			}

		}

		function validateInputs() {
			if ($(this).val() === '') {
				if(!$form.hasClass('checkout-billing')){
					$continue.attr('disabled', 'disabled');
				}
			} else {
				// enable continue button on last required field that is valid
				// only validate single field
				if (validator.element(this) && !hasEmptyRequired()) {
					$continue.removeAttr('disabled');
				} else {
					if(!$form.hasClass('checkout-billing')){
						$continue.attr('disabled', 'disabled');
					}

				}
			}
		}

		$requiredInputs.off('change', validateInputs).on('change', validateInputs);
	}

	//shipping page logic
	//checkout gift message counter
	/**
	 * @function
	 * @description Initializes gift message box, if shipment is gift
	 */
	function initGiftMessageBox() {
		// show gift message box, if shipment is gift
		$cache.giftMessage.toggle($cache.checkoutForm.find("#is-gift-yes")[0].checked);

	}
	/**
	 * @function
	 * @description Initializes gift message box for multiship shipping, the message box starts off as hidden and this will display it if the radio button is checked to yes, also added event handler to listen for when a radio button is pressed to display the message box
	 */
	function initMultiGiftMessageBox() {
		$.each( $('input[id^="isgiftyes"], input[id^="isgiftno"]'), function(){
			var _this = $(this).parent().parent();
			//handle initial load
			if($(_this).find(".js-isgiftyes").is(':checked')){
				$(_this).find(".gift-message-text").css('display','block')
			}

			//set event listeners
			$('input[id^="isgiftyes"], input[id^="isgiftno"]').bind('change', function(){
				var _this = $(this).parent().parent();
				if($(_this).find(".js-isgiftyes").is(':checked')){
					$(_this).find(".gift-message-text").css('display','block');
				}else if($(_this).find(".js-isgiftno").is(':checked')){
					$(_this).find(".gift-message-text").css('display','none');
				}
			});

		});
	}

	/**
	 * @function
	 * @description capture and handle add and edit address action in dialog on multiship page
	 */
	function addEditAddress(target) {
		var $addressForm = $('form[name$="multishipping_editAddress"]'),
			$selectDropDown = $addressForm.find('.input-select-multiship'),
			$addressList = $addressForm.find('.address-list'),
			add = true,
			selectedAddressUUID = $(target).closest('.shippingaddress').find('.select-address').val();
		$selectDropDown.on('change', function (e) {
			e.preventDefault();
			var selectedAddress = $addressList.find('select').val();
			if (selectedAddress !== 'newAddress') {
				selectedAddress = $.grep($addressList.data('addresses'), function(add) {
					return add.UUID === selectedAddress;
				})[0];
				add = false;
				// proceed to fill the form with the selected address
				for (var field in selectedAddress) {
					// if the key in selectedAddress object ends with 'Code', remove that suffix
					$addressForm.find('[name$=' + field + '], [name$=' + field.replace('Code', '') + ']').val(selectedAddress[field]);
				}
			} else {
				//reset the form if the value of the option is not a UUID
				$addressForm.find('.input-text, .input-select').val('');
			}
		});
		$addressForm.on('click', '.cancel', function (e) {
			e.preventDefault();
			app.dialog.close();
		});
		$addressForm.on('submit', function (e) {
			e.preventDefault();
			$.getJSON(app.urls.addEditAddress, $addressForm.serialize(), function (response) {
				if (!response.success) {
					// @TODO: figure out a way to handle error on the form
					console.log('error!');
					return;
				}
				var address = response.address,
					$shippingAddress = $(target).closest('.shippingaddress'),
					$select = $shippingAddress.find('.select-address'),
					$selected = $select.find('option:selected'),
					newOption = '<option value="' + address.UUID + '">'
						+ ((address.ID) ? '(' + address.ID + ')' : address.firstName + ' ' + address.lastName) + ', '
						+ address.address1 + ', ' + address.city + ', ' + address.stateCode + ', ' + address.postalCode
						+ '</option>';
				app.dialog.close();
				if (add) {
					$('.shippingaddress select').removeClass('no-option').append(newOption);
					$('.no-address').hide();
				} else {
					$('.shippingaddress select').find('option[value="' + address.UUID + '"]').html(newOption);
				}
				// if there's no previously selected option, select it
				if (!$selected.length > 0 || $selected.val() === '') {
					$select.find('option[value="' + address.UUID + '"]').prop('selected', 'selected').trigger('change');
				}
			});
		});

		//preserve the uuid of the option for the hop up form
		if (selectedAddressUUID) {
			//update the form with selected address
			$addressList.find('option').each(function() {
				//check the values of the options
				if ($(this).attr('value') == selectedAddressUUID) {
					$(this).attr('selected','selected');
					$selectDropDown.trigger('change');
				}
			});
		}
	}

	/**
	 * @function
	 * @description shows gift message box, if shipment is gift
	 */
	function shippingLoad() {
		initContinue('[name$="shippingAddress_save"]', '[id$="singleshipping_shippingAddress"]');

		$cache.checkoutForm.on("click", "#is-gift-yes, #is-gift-no", function (e) {
			$cache.checkoutForm.find(".gift-message-text").toggle($cache.checkoutForm.find("#is-gift-yes")[0].checked);
		})
		.on("change",
			"input[name$='_addressFields_address1'], input[name$='_addressFields_address2'], input[name$='_addressFields_state'], input[name$='_addressFields_city'], input[name$='_addressFields_postal']",
			updateShippingMethodList
		);

		// gift message character limitation
		initGiftMessageBox();
		updateShippingMethodBasedOnState();
		return null;
	}
	/**
	 * @function
	 * @description Selects the first address from the list of addresses
	 */
	function addressLoad() {
		// select address from list
		$cache.addressList.on("change", function () {
			$cache.checkoutForm.find("select[id$='_country']").val("US");
			var selected = $(this).children(":selected").first();
			var data = $(selected).data("address");
			if (!data) {
				$('input[name$="_addressFields_firstName"]').val("");
				$('input[name$="_addressFields_lastName"]').val("");
				$('input[name$="_addressFields_address1"]').val("");
				$('input[name$="_addressFields_address2"]').val("");
				$('input[name$="_addressFields_city"]').val("");
				$('select[name$="_addressFields_states_state"]').val("");
				$('input[name$="_addressFields_postal"]').val("");
				$('input[name$="_addressFields_phone"]').val("");
				$cache.checkoutForm.find('.phone_alt').val("");
				$('.pobox_validation').removeClass('error');
				$('.pobox_validation').next('span.error').hide();
				$cache.checkoutForm.find('.custom-select').each(function(){
					$(this).selectbox('detach');
					$(this).selectbox('attach');
				});
				return;
			}
			var p;
			for (p in data) {
				if ($cache[p] && data[p]) {
					$cache[p].val(data[p].replace("^","'"));
					// special handling for countrycode => stateCode combo
					if ($cache[p]===$cache.countryCode) {
						app.util.updateStateOptions($cache[p]);
						$cache.stateCode.val(data.stateCode);
						$cache.stateCode.trigger("change");
					}
					else {
						updateShippingMethodList();
					}
				}
			}
			if(data.address2 == null){
				$("input[name$='_addressFields_address2']").val("");
			}

			if($("input[name$='_addressFields_address1']").val().length > 0){
				$("input[name$='_addressFields_address1']").trigger('blur');
			}
			if($("input[name$='_addressFields_address2']").val().length > 0){
				$("input[name$='_addressFields_address2']").trigger('blur');
			}

			if($("input[name$='_addressFields_phone']").val().length > 0){
				$("input[name$='_addressFields_phone']").trigger('change');
			}
			// re-validate the form
			//$cache.checkoutForm.validate().form();
		});

		// update state options in case the country changes
		$cache.countryCode.on("change", function () {
			app.util.updateStateOptions(this);
		});

	}

	/**
	 * @function
	 * @description shows gift message box in multiship, and if the page is the multi shipping address page it will call initmultishipshipaddress() to initialize the form
	 */
	function multishippingLoad() {
		initMultiGiftMessageBox();
		if ($(".cart-row .shippingaddress .select-address").length > 0){
			initContinue('[name$="addressSelection_save"]', '[id$="multishipping_addressSelection"]')
		}
	}

	/**
	 * @function
	 * @description Changes the payment method form depending on the passed paymentMethodID
	 * @param {String} paymentMethodID the ID of the payment method, to which the payment method form should be changed to
	 */
	function changePaymentMethod(paymentMethodID) {
		$cache.paymentMethods.removeClass("payment-method-expanded");

		var pmc = $cache.paymentMethods.filter("#PaymentMethod_"+paymentMethodID);
		if (pmc.length===0) {
			pmc = $("#PaymentMethod_Custom");
		}
		pmc.addClass("payment-method-expanded");
		if(paymentMethodID == "PayPal"){
			$("#continueOnBilling").hide();
		}else{$("#continueOnBilling").show();}

		// ensure checkbox of payment method is checked
		$("#is-" + paymentMethodID)[0].checked = true;

		// var bmlForm = $cache.checkoutForm.find("#PaymentMethod_BML");
		// bmlForm.find("select[name$='_year']").removeClass("required");
		// bmlForm.find("select[name$='_month']").removeClass("required");
		// bmlForm.find("select[name$='_day']").removeClass("required");
		// bmlForm.find("input[name$='_ssn']").removeClass("required");

		// if (paymentMethodID==="BML") {
		// 	var yr = bmlForm.find("select[name$='_year']");
		// 	bmlForm.find("select[name$='_year']").addClass("required");
		// 	bmlForm.find("select[name$='_month']").addClass("required");
		// 	bmlForm.find("select[name$='_day']").addClass("required");
		// 	bmlForm.find("input[name$='_ssn']").addClass("required");
		// }
		app.validator.init();
		initContinue('[name$="billing_save"]', 'form[id$="billing"]');
	}

	// hit cybersource
	$("button[name$='_billing_save']").unbind('click').on('click',function(e){
		   var selectedPaymentMethod = $(".payment-method-options").find('input[type=radio]').filter(":checked").val();
		   if(selectedPaymentMethod==="CREDIT_CARD") {
			   e.preventDefault();
			   var bform    = $(".checkout-billing");
			   if(bform.valid()){
				   var firstName = $("input[name$='_billing_billingAddress_addressFields_firstName']").val();
				   var lastName  = $("input[name$='_billing_billingAddress_addressFields_lastName']").val();
				   var address1  = $("input[name$='_billing_billingAddress_addressFields_address1']").val();
				   var address2  = $("input[name$='_billing_billingAddress_addressFields_address2']").val();
				   var city      = $("input[name$='_billing_billingAddress_addressFields_city']").val();
				   var company   = $("input[name$='_billing_billingAddress_addressFields_company']").val();
				   var zip       = $("input[name$='_billingAddress_addressFields_postal']").val();
				   var country   = $("select[name$='_billing_billingAddress_addressFields_country']").val();
				   var state     = $("select[name$='_billing_billingAddress_addressFields_states_state']").val();
				   var phone     = $("input[name$='_billing_billingAddress_addressFields_phone']").val().replace(/-|\s/g,"");
				   var owner     = $("input[name$='_billing_paymentMethods_creditCard_owner']").val();
				   var cardType  = $("select[name$='_billing_paymentMethods_creditCard_type']").val();
				   var cardNumber= $("input[name$='_billing_paymentMethods_creditCard_number']").val();
				   var expMonth  = $("select[name$='_billing_paymentMethods_creditCard_month']").val();
				   var expYear   = $("select[name$='_billing_paymentMethods_creditCard_year']").val();
				   var cvn       = $("input[name$='_billing_paymentMethods_creditCard_cvn']").val();
				   /* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
				   var email       = $("input[name$='_billing_billingAddress_email_emailAddress']").val().toLowerCase();
				   /* PANC-1797 END */
				   
				   $("input[name$='bill_to_email']").val(email);
				   $("input[name$='card_number']").val(cardNumber);
				   $("input[name$='bill_to_address_line1']").val(address1);
				   $("input[name$='bill_to_address_line2']").val(address2);
				   $("input[name$='bill_to_phone']").val(phone);
				   $("input[name$='bill_to_address_city']").val(city);
				   $("input[name$='bill_to_address_state']").val(state);
				   $("input[name$='bill_to_surname']").val(lastName);
				   $("input[name$='bill_to_address_country']").val(country);
				   $("input[name$='bill_to_address_postal_code']").val(zip);
				   $("input[name$='bill_to_forename']").val(firstName);
				   $("input[name$='card_cvn']").val(cvn);

				   if($('[name=dwfrm_billing_billingAddress_addToEmailList]').attr('checked')== 'checked'){
					   $('[name=merchant_defined_data1]').val('true');
				   }else{
					   $('[name=merchant_defined_data1]').val('false');
				   }

				   //Stroing cvn in session PANC-660
				   if(cvn.length > 0){
					   	var url = app.urls.sessionSaveCvn;
						$.ajax({url: url, method: "POST",data: 'cvn='+ cvn}).done(function(data){});
				   }
				   $("input[name$='card_type']").val(cardType);
				   $("input[name$='bill_to_company_name']").val(owner);

				   if(expMonth.length > 1){
					   $("input[name$='card_expiry_date']").val(expMonth+"-"+expYear);
				   }else{
					   $("input[name$='card_expiry_date']").val("0"+expMonth+"-"+expYear);
				   }

				   var cybersourcecheck = true;

				   if( $('.saved-credit-card').length > 0){
						if($(".saved-credit-card select :selected").attr('data-subid') != undefined
							&& $(".saved-credit-card select :selected").attr('data-subid') != 'null'
							&& $(".saved-credit-card select :selected").attr('data-subid') != ''){
							$('.subscriptionId').val($(".saved-credit-card select :selected").attr('data-subid'));
						} else if(!isNaN($(".saved-credit-card select :selected").attr('data-cc'))
								&& (cardType == $('#cctype').val())) {
							$("input[name$='card_number']").val($(".saved-credit-card select :selected").attr('data-cc'));
						}
				   }

					if($(".checkout-billing .subscriptionId").val() != ''){
						var selectccnum = $('#ccnumber').val();
						var selectowner = $('#ccowner').val();
						var selectyear = $('#ccyear').val();
						var selectmonth = $('#ccmonth').val();
						var selecttype = $('#cctype').val();

						if((selectowner != null && selectowner == owner)
							&& (selectccnum != null && selectccnum == cardNumber) && (selectyear != null && selectyear == expYear) && (selectmonth != null && selectmonth == expMonth)) {
								cybersourcecheck = false;
						}
					}

				   /*if(cybersourcecheck){
					    if(isNaN(cardNumber) && isNaN($("input[name$='card_number']").val())){
							$('.ccnumber').addClass('error');
							if($('.carderror.error').length==1){
								$('.carderror.error').show();
							} else if($('.carderror.error').length == 0){
								$('.ccnumber').after('<span class="carderror error">'+  $('.ccnumber').closest('.form-row').attr('data-required-text') +'</span>');
							}
							return false;
						}
					    if($('.sasop-subscription-form').length > 0){
					    	 	$(document).find('input[name="sasop-subscribe"]').trigger('click');
					    }
				   }else{*/
					   var currentdate = new Date();
					    var currentYear = currentdate.getFullYear();
					    var currentMonth = currentdate.getMonth();
					    var cardmonth = $('.month-valid').find('option:selected').val();
					    var cardyear = $('.year-valid').find('option:selected').val();
					    if(cardyear < currentYear || (cardyear == currentYear && cardmonth < currentMonth)) {
					    	$('.expireerror').removeClass('hide');
					    	$('.expireerror').show();
					    	$('.expiration .select-short').addClass('selectmsg-error');
					    	$('.expire-date').addClass('msg-error');
					    	return false;
					    }else{
					    	$('.expireerror').addClass('hide');
					    	$('.expireerror').hide();
					    }
						  $(".ccvn").removeClass('required');
						  if(bform.length > 0){
							  bform.submit();
						  }
				   }
			   /*}*/
		   }else if($(this).hasClass("continuecheckout-paypallogin")){
               $(".checkout-billing :input").removeClass("required");
           }
	});


	/**
	 * @function
	 * @description Fills the Credit Card form with the passed data-parameter and clears the former cvn input
	 * @param {Object} data The Credit Card data (holder, type, masked number, expiration month/year)
	 */
	function setCCFields(data) {
		$cache.ccOwner.val(data.holder);
		$cache.ccType.val(data.type);
		var CCNumber = $('#creditCardList').find('option:selected').attr('data-cc');

		$cache.ccNum.val(data.maskedNumber);
		$cache.ccMonth.val(data.expirationMonth);
		$cache.ccYear.val(data.expirationYear);
		$cache.ccCcv.val("");

		$('#ccnumber').val(data.maskedNumber);
		$('#ccowner').val(data.holder);
		$('#ccyear').val(data.expirationYear);
		$('#ccmonth').val(data.expirationMonth);
		$('#cctype').val(data.type);

		// remove error messages
		$cache.ccContainer.find(".errormessage")
						  .toggleClass("errormessage")
						  .filter("span").remove();

		$cache.ccContainer.find(".errorlabel").toggleClass("errorlabel");
		$cache.checkoutForm.find('.custom-select').each(function(){
			$(this).selectbox('detach');
			$(this).selectbox('attach');
		});

		if($('.cardtypeimg').length == 0) {
			$('.form-row.ccrow').append('<span class="cardtypeimg"><span></span></span>');
		}

		if($('.ctype').find('option:selected').attr('label')){
			$('.cardtypeimg > span').attr('data-cardlabel', $('.ctype').find('option:selected').attr('label')).show();
		}
	}

	/**
	 * @function
	 * @description Updates the credit card form with the attributes of a given card
	 * @param {String} cardID the credit card ID of a given card
	 */
	function populateCreditCardForm(cardID) {
		// load card details
		var url = app.util.appendParamToURL(app.urls.billingSelectCC, "creditCardUUID", cardID);
		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				if(!data) {
					window.alert(app.resources.CC_LOAD_ERROR);
					return false;
				}
				$cache.ccList.data(cardID, data);
				setCCFields(data);
			}
		});
	}

	/**
	 * @function
	 * @description loads billing address, Gift Certificates, Coupon and Payment methods
	 */
	function billingLoad() {
		if( !$cache.paymentMethodId ) return;

		initContinue('[name$="billing_save"]', 'form[id$="billing"]');
		$cache.paymentMethodId.on("click", function () {
			changePaymentMethod($(this).val());
		});
		try{

		// get selected payment method from payment method form
		var paymentMethodId = $cache.paymentMethodId.filter(":checked");
		if($('.payment-method-options').length >0 ){
			changePaymentMethod(paymentMethodId.length===0 ? "CREDIT_CARD" : paymentMethodId.val());
		}
		}catch(e){}

		$cache.checkoutForm.find('.continueOnBillinglink').on('click', function(){
			$(this).closest('form').find('.creditcard-empty-msg').removeClass('hide');
		});

		// select credit card from list
		$cache.ccList.on("change", function () {
			var cardUUID = $(this).val();
			if (!cardUUID) {
				$cache.ccOwner.val("");
				$cache.ccType.val("");
				$cache.ccNum.val("");
				$cache.ccMonth.val("");
				$cache.ccYear.val("");
				$('.subscriptionId').val('');

				$cache.checkoutForm.find('.custom-select').each(function(){
					$(this).selectbox('detach');
					$(this).selectbox('attach');
				});
				$('.cardtypeimg > span').hide();
				return;
			}

			var ccdata = $cache.ccList.data("cardUUID");
			if (ccdata){
				setCCFields(ccdata);
				return;
			}
			populateCreditCardForm(cardUUID);
			if($(this).find('option:selected').attr('data-subid') == "null" || $(this).find('option:selected').attr('data-subid') == null || !$(this).find('option:selected').attr('data-subid')){
				$('.subscriptionId').val('');
			}else{
				$('.subscriptionId').val($(this).find('option:selected').attr('data-subid'));
			}

			 app.uievents.init();
		});
		// handle whole form submit (bind click to continue checkout button)
		// append form fields of current payment form to this submit
		// in order to validate the payment method form inputs too

		$cache.save.on('click', function (e) {
			// determine if the order total was paid using gift cert or a promotion
			if ($("#noPaymentNeeded").length > 0 && $(".giftcert-pi").length > 0) {
				// as a safety precaution, uncheck any existing payment methods
				$cache.paymentMethodId.filter(":checked").removeAttr("checked");
				// add selected radio button with gift card payment method
				$("<input/>").attr({
									name:$cache.paymentMethodId.first().attr("name"),
									type:"radio",
									checked:"checked",
									value:app.constants.PI_METHOD_GIFT_CERTIFICATE})
							 .appendTo($cache.checkoutForm);
			}

			var tc = $cache.checkoutForm.find("input[name$='bml_termsandconditions']");
			if ($cache.paymentMethodId.filter(":checked").val()==="BML" && !$cache.checkoutForm.find("input[name$='bml_termsandconditions']")[0].checked) {
				alert(app.resources.BML_AGREE_TO_TERMS);
				return false;
			}

		});

		$cache.checkGiftCert.on("click", function (e) {
			e.preventDefault();
			$cache.gcCode = $cache.checkoutForm.find("input[name$='_giftCertCode']");
			$cache.gcPin = $cache.checkoutForm.find("input[name$='_giftCertPin']");
			$cache.balance = $cache.checkoutForm.find("div.balance");
			$cache.checkoutForm.find('.giftcert-error').html('');
			if ($cache.gcCode.length===0 || $cache.gcCode.val().length===0) {
				var error = $cache.balance.find("span.error");
				if (error.length===0) {
					error = $("<span>").addClass("error").appendTo($cache.balance);
				}
				error.html(app.resources.GIFT_CERT_MISSING);
				return;
			}

			app.giftcard.checkBalance($cache.gcCode.val(),$cache.gcPin.val(), function (data) {
				var error = $cache.balance.find("span.error");
				error.html("");
				if(!data || !data.giftCertificate) {
					$cache.balance.html(app.resources.GIFT_CERT_INVALID).removeClass('success').addClass('error');
					return;
				}
				$cache.balance.html(app.resources.GIFT_CERT_BALANCE + " " + data.giftCertificate.balance).removeClass('error').addClass('success');
			});
		});

		$cache.addCoupon.on("click", function(e){
			e.preventDefault();
			var $redemptionCouponArea = $cache.checkoutForm.find('.redemption.coupon');
			var $error = $cache.checkoutForm.find('.coupon-error'),
				code = $cache.couponCode.val();

			if (code.length===0) {
				$error.html(app.resources.COUPON_CODE_MISSING).removeClass('hide');
				return;
			}

			var url = app.util.appendParamsToUrl(app.urls.addCoupon, {couponCode: code,format: "ajax"});
			$.getJSON(url, function(data) {

				//clearing the input after click event
				$cache.checkoutForm.find('.couponCode-input input').val('');

				var fail = false;
				var msg = "";

				//Clearing the msg
				$error.html(msg);

				if (!data) {
					msg = app.resources.BAD_RESPONSE;
					fail = true;
				}
				else if (!data.success) {
					msg = data.message.split('<').join('&lt;').split('>').join('&gt;');
					fail = true;
				}
				if (fail) {
					$error.html(msg).removeClass('hide');
					return;
				}
				updateSummary();
				//basket check for displaying the payment section, if the adjusted total of the basket is 0 after applying the coupon
				//this will force a page refresh to display the coupon message based on a parameter message
				/*if(data.success && data.baskettotal >0){
					window.location.assign(app.urls.billing);
				}*/
				if(data.success == true){
					app.ajax.load({
						url: app.urls.showCouponAjax,
						callback : function (data) {
							$redemptionCouponArea.html(data);
							$cache.checkoutForm.find('.couponCode-input input').val('');
						}
					});
				}

			});
		});
		//Billing page address hide show PANC-528
		$('.displayBillingAddressFieldsWithEditLink .editBillingAddress').on('click', function(e) {
			e.preventDefault();
			$(this).closest('form').find('.displayBillingAddressFieldsWithEditLink').addClass('hide');
			if($(this).parent().closest('form').find('.displayBillingAddressFields').hasClass('hide')){
				$(this).parent().closest('form').find('.displayBillingAddressFields').removeClass('hide');
			}
		});

		// trigger events on enter
		$cache.couponCode.on('keydown', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$cache.addCoupon.click();
			}
		});
		$cache.giftCertCode.on('keydown', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$cache.addGiftCert.click();
			}
		});

		//Promotion code remove

		$cache.checkoutForm.on('click',".CCremovebutton-mini", function(e){
			e.preventDefault();
			$cache.checkoutForm.find('.coupon-error').html('');
			var $redemptionCouponArea = $cache.checkoutForm.find('.redemption.coupon');
			var url = app.util.appendParamsToUrl($(this).attr('href'),{format:"ajax"});
			$.ajax({
				url: url,
				method: "POST"
			}).done(function(data){
				//window.location.assign(app.urls.billing);
				//var url = app.urls.promotioncodeRefreshURL;
				//var promotioncode = $(".coupon-promo-form-checkout .coupon-promo-list");
				updateSummary();
				$redemptionCouponArea.html(data);
				$cache.checkoutForm.find('.couponCode-input input').val('');
			});

		});

		$cache.checkoutForm.find("input[name$='_paymentMethods_creditCard_number']").keypress(function (e) {
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
		}
		});

		$cache.checkoutForm.find(".savecard-check .custom-checkbox input[type='checkbox']").on('change', function(e){
			url = app.util.appendParamsToUrl(app.urls.sessionsaveaddress, {saveAddress: $(this).is(':checked')});
			$.ajax({url: url, method: "POST"}).done(function(data){});
		});

		$cache.checkoutForm.find(".billing-address-checkbox .custom-checkbox input[type='checkbox']").on('change', function(e){
			url = app.util.appendParamsToUrl(app.urls.sessionsaveBillingaddress, {saveBillingAddress: $(this).is(':checked')});
			$.ajax({url: url, method: "POST"}).done(function(data){});
		});

	if($cache.ccNum.val() !=""){
			$cache.ccNum.val($cache.ccNum.val());
		}

	}

	/**
	 * @function
	 * @description Sets a boolean variable (isShipping) to determine the checkout stage
	 */
	function initializeDom() {
		if ($cache.checkoutForm.hasClass("checkout-billing")) {
			app.checkout.cardtype($cache.ccContainer,$cache.ccNum,$cache.ccType);
		}
		isShipping = $(".checkout-shipping").length > 0;
		isMultiShipping = $(".checkout-multi-shipping").length > 0;
	}

	/**
	 * @function
	 * @description Initializes the cache of the checkout UI
	 */
	function initializeCache() {
		$cache.checkoutForm = $("form.address");
		$cache.addressList = $cache.checkoutForm.find(".select-address select[id$='_addressList']");
		$cache.firstName = $cache.checkoutForm.find("input[name$='_firstName']");
		$cache.lastName = $cache.checkoutForm.find("input[name$='_lastName']");
		$cache.address1 = $cache.checkoutForm.find("input[name$='_address1']");
		$cache.address2 = $cache.checkoutForm.find("input[name$='_address2']");
		$cache.city = $cache.checkoutForm.find("input[name$='_city']");
		$cache.postalCode = $cache.checkoutForm.find("input[name$='_postal']");
		$cache.phone = $cache.checkoutForm.find("input[name$='_phone']");
		$cache.countryCode = $cache.checkoutForm.find("select[id$='_country']");
		$cache.stateCode = $cache.checkoutForm.find("select[id$='_state']");
		$cache.addToAddressBook = $cache.checkoutForm.find("input[name$='_addToAddressBook']");
		if ($cache.checkoutForm.hasClass("checkout-shipping")) {
			// shipping only
			$cache.useForBilling = $cache.checkoutForm.find("input[name$='_useAsBillingAddress']");
			$cache.giftMessage = $cache.checkoutForm.find(".gift-message-text");
			$cache.shippingMethodList = $("#shipping-method-list");
		}

		if ($cache.checkoutForm.hasClass("checkout-billing")) {
			// billing only
			$cache.email = $cache.checkoutForm.find("input[name$='_emailAddress']");
			$cache.save = $cache.checkoutForm.find("button[name$='_billing_save']");
			$cache.paymentMethods = $cache.checkoutForm.find("div.payment-method");
			$cache.paymentMethodId = $cache.checkoutForm.find("input[name$='_selectedPaymentMethodID']");
			$cache.ccContainer = $("#PaymentMethod_CREDIT_CARD");
			$cache.ccList = $("#creditCardList");
			$cache.ccOwner = $cache.ccContainer.find("input[name$='creditCard_owner']");
			$cache.ccType = $cache.ccContainer.find("select[name$='_type']");
			$cache.ccNum = $cache.ccContainer.find("input[name$='_number']");
			$cache.ccMonth = $cache.ccContainer.find("[name$='_month']");
			$cache.ccYear = $cache.ccContainer.find("[name$='_year']");
			$cache.ccCcv = $cache.ccContainer.find("input[name$='_cvn']");
			$cache.BMLContainer = $("#PaymentMethod_BML");
			$cache.giftCertCode = $cache.checkoutForm.find('input[name$="_giftCertCode"]');
			$cache.giftCertPin = $cache.checkoutForm.find('input[name$="_giftCertPin"]');
			$cache.couponCode = $cache.checkoutForm.find("input[name$='_couponCode']");
			$cache.checkGiftCert = $cache.checkoutForm.find("#check-giftcert");
			$cache.addGiftCert = $cache.checkoutForm.find('#add-giftcert');
			$cache.addCoupon = $cache.checkoutForm.find("#add-coupon");

			$('#ccnumber').val($("input[name$='_billing_paymentMethods_creditCard_number']").val());
			$('#ccowner').val($("input[name$='_billing_paymentMethods_creditCard_owner']").val());
			$('#ccyear').val($("select[name$='_billing_paymentMethods_creditCard_year']").val());
			$('#ccmonth').val($("select[name$='_billing_paymentMethods_creditCard_month']").val());
			$('#cctype').val($("select[name$='_billing_paymentMethods_creditCard_type']").val());

			if($("input[name$='paymentMethods_creditCard_saveCard']").prop('checked')){
				var url = app.util.appendParamsToUrl(app.urls.sessionsaveaddress, {saveAddress: true});
				$.ajax({url: url, method: "POST"}).done(function(data){});
			}

		}
	}
	/**
	 * @function Initializes the page events depending on the checkout stage (shipping/billing)
	 */
	function initializeEvents() {
		addressLoad();
		if (isShipping) {
			shippingLoad();

			//on the single shipping page, update the list of shipping methods when the state feild changes
			$('#dwfrm_singleshipping_shippingAddress_addressFields_states_state').bind('change', function(){
				//updateShippingMethodList();
				updateShippingMethodBasedOnState();
			});
		}
		else if(isMultiShipping){
			multishippingLoad();
		}
		else{
			billingLoad();
		}

		//if on the order review page and there are products that are not available diable the submit order button
		if($('.order-summary-footer').length > 0){
			if($('.notavailable').length > 0){
				$('.order-summary-footer .submit-order .button-fancy-large').attr( 'disabled', 'disabled' );
			}
		}

		//edit details order review page
		$('.summaryQV').on('click', function(e){
		 	e.preventDefault();
            var sumQV = $(this).closest('.item-details').find('.sumQV').val();
            app.quickView.show({
                 url : app.util.appendParamToURL(app.urls.getProductUrl, "pid" , sumQV),
                 source : 'quickview'
            });
       });

		$('.edit-address').on('click', 'a', function(e) {
			app.dialog.open({url: this.href, options: {open: function() {
				initializeCache();
				addressLoad();
				addEditAddress(e.target);
				app.tooltips.init(); // JIRA PREV-84 : Multiple shipping page: Not displaying Tool tip. re-init tooltips.
			}}});
			// return false to prevent global dialogify event from triggering
			return false;
		});
		$(".checkout-billing .billing-couponrow .coupon-row-display-info-link").click(function(e){
			e.preventDefault();
			$(".display-info").toggleClass('hide');
			$(this).toggleClass("active");
		});
	}

	/******* app.checkout public object ********/
	app.checkout = {
		init : function () {
			initializeCache();
			initializeDom();
			initializeEvents();
		},
		cardtype: function ($con, $cardinput, $typeselector) {
                var cardregex = {
                    mastercard: /^5[1-5][0-9]{2,14}$/,
                    visa: /^4[0-9]{3,15}$/,
                    amex: /^3[47]([0-9]{2,13})$/,
                    discover: /^6(?:011[0-9]{0,12}|5[0-9]{2,14})$/
                }
                if ($con.find($cardinput).length > 0) {
                	$con.find($cardinput).blur(function () {
	                		var val = $.trim($(this).val());
	                        var regex = /^[a-zA-Z]+$/;
	                        var errorspan = $(this).closest('.form-row').find('span.error');

	                            if($('.cardtypeimg').length == 0) {$(this).closest('.form-row').append('<span class="cardtypeimg"><span style="display:none;"></span></span>');}
	                            if (!val) {
	                            	 $('.carderror.error').hide();
	                            	return false;
	                            }
                                if (val.length > 0 && val.indexOf('*') == -1) {
                                  	//$('.carderror.error').hide();
                                    var cardTypeval = validatecardtype(val);
                                    if($('.carderror.error').length == 0 && val.indexOf('*') == -1) {
		   		                          $(this).after('<span class="carderror error" style="display:none;">'+  $(this).closest('.form-row').attr('data-required-text') +'</span>');
		   		                     }
                                    if (cardTypeval != "Error") {
                                        errorspan.hide();
                                        $con.find($typeselector + 'option[label="'+ cardTypeval +'"]').attr('selected','selected');
                                        $con.find($typeselector).selectbox('detach').selectbox('attach');
                                        $('.cardtypeimg > span').attr('data-cardlabel', cardTypeval).show();

                                        if((cardTypeval == "Master") || (cardTypeval == "Visa") || (cardTypeval == "Discover")){
	                                        if(val.length < 16 && cardTypeval != "Visa"){
	                                            $('.carderror.error').show();
	                                            $(this).addClass('error');
	                                        }
	                                        if(val.length != 13 && val.length != 16 && cardTypeval == "Visa"){
	                                        	$('.carderror.error').show();
	                                            $(this).addClass('error');
	                                        }

                                        }else if(cardTypeval = "Amex"){
                                        if(val.length < 15){
                                            $('.carderror.error').show();
                                            $(this).addClass('error');
                                        }
                                        }else{
                                         $('.carderror.error').hide();
                                         $(this).removeClass('error');
                                        }
                                    }else{
                                    	 $('.carderror.error').show();
                                         $(this).addClass('error');
                                         $('.cardtypeimg > span').removeAttr('data-cardlabel').hide();
                                    }

                                }else if(val.indexOf('*') != -1){
                                	$('.cardtypeimg > span').attr('data-cardlabel', $typeselector.find('option:selected').attr('label')).show();
                                }
                                if ($con.find($cardinput).val().length < 4) {
                                    $('.cardtypeimg > span').hide();
                                }

                            });

                    function validatecardtype(val) {
                        var result = " ",
                            carNo = val;

                        // first check for MasterCard
                        if (cardregex.mastercard.test(carNo)) {
                            result = "Master";
                        }
                        // then check for Visa
                        else if (cardregex.visa.test(carNo)) {
                            result = "Visa";
                        }
                        // then check for AmEx
                        else if (cardregex.amex.test(carNo)) {
                            result = "Amex";
                        }
                        else if (cardregex.discover.test(carNo)) {
                            result = "Discover";
                        }
                        else {
                            result = "Error"
                        }
                        return result;
                    }
                }
        }
	};
}(window.app = window.app || {}, jQuery));


/**
 * @class app.quickview
 */
(function (app, $) {
	var $cache = {};
	/**
	 * @function
	 * @description Binds a 'click'-event to the quick view button
	 */
	function bindQvButton() {
		$cache.qvButton.one("click", function (e) {
			e.preventDefault();
			app.quickView.show({
				url : $(this).attr("href"),
				source : "quickview"
			});
		});
	}

	/******* app.quickView public object ********/
	app.quickView = {
		/**
		 * @function
		 * @description
		 */
		initializeButton : function (container, target) {
			// quick view button
			$(container).on("mouseenter", target, function (e) {
				if($('.pt_category-search-result').length > 0 || $(this).hasClass('support-tile-img') || $('.set-product-list').length > 0){return false;}
				if(!$cache.qvButton) {
					$cache.qvButton = $("<a id='quickviewbutton'>"+ app.resources.quickview +"</a>");
				}
				bindQvButton();

				var link = $(this).children("a:first");
				$cache.qvButton.attr({
					"href" : link.attr("href")
				}).appendTo($(this));
			});
		},
		init : function () {
			if(app.quickView.exists()) {
				return $cache.quickView;
			}

			$cache.quickView = $("<div/>").attr("id", "#QuickViewDialog").appendTo(document.body);
			return $cache.quickView;
		},

		initializeQuickViewNav : function(qvUrl) {

			//from the url of the product in the quickview
			qvUrlTail = qvUrl.substring(qvUrl.indexOf('?'));
			qvUrlPidParam = qvUrlTail.substring(0,qvUrlTail.indexOf('&'));
			qvUrl = qvUrl.substring(0, qvUrl.indexOf('?'));

			if(qvUrlPidParam.indexOf('pid') > 0){
				//if storefront urls are turned off
				//append the pid to the url
				qvUrl = qvUrl+qvUrlPidParam;
			}

			this.searchesultsContainer = $('#search-result-items').parent();
			this.productLinks = this.searchesultsContainer.find('.thumb-link');

			this.btnNext = $('.quickview-next');
			this.btnPrev = $('.quickview-prev');

			this.btnNext.click(this.navigateQuickview.bind(this));
			this.btnPrev.click(this.navigateQuickview.bind(this));

			var productLinksUrl = "";
			for ( var i = 0; i < this.productLinks.length; i++) {

				productLinksUrlTail = this.productLinks[i].href.substring(this.productLinks[i].href.indexOf('?'));
				productLinksUrlPidParam = productLinksUrlTail.substring(0,qvUrlTail.indexOf('&'));
				if(productLinksUrlPidParam.indexOf('pid') > 0){
					//append the pid to the url
					//if storefront urls are turned off
					productLinksUrl = this.productLinks[i].href.substring(0, this.productLinks[i].href.indexOf('?'));
					productLinksUrl = productLinksUrl+productLinksUrlPidParam;

				}else{
					productLinksUrl = this.productLinks[i].href.substring(0, this.productLinks[i].href.indexOf('?'));
				}

				if(productLinksUrl == ""){
					productLinksUrl = this.productLinks[i].href;
				}

				if (qvUrl == productLinksUrl) {
					this.productLinkIndex = i;
				}
			}

			if (this.productLinkIndex == this.productLinks.length - 1) {
				this.btnNext.hide();
			}

			if (this.productLinkIndex == 0) {
				this.btnPrev.hide();
			}

			//hide the buttons on the compare page
			if($('.compareremovecell').length > 0){
				this.btnNext.hide();
				this.btnPrev.hide();
			}else{
				/*Start JIRA PREV-50: Next and Previous links will not be displayed on PDP if user navigate from Quick View.
 				Added current URL parameters and index to viewfulldetails link*/
				var a = $("#view-full-details");
				var wl = window.location;
				var qsParams = (wl.search.length > 1) ? app.util.getQueryStringParams(wl.search.substr(1)) : {};
				var hashParams = (wl.hash.length > 1) ? app.util.getQueryStringParams(wl.hash.substr(1)) : {};
				var params = $.extend(hashParams, qsParams);
				params.start = parseInt(this.productLinkIndex)+1;
				var tile = $('#search-result-items .product-tile').first();
				if(!params.cgid && tile.data("cgid") != null && tile.data("cgid") != ""){
					params.cgid=tile.data("cgid");
			}
				a.attr("href",a.attr("href")+"#"+$.param(params));
				/*End JIRA PREV-50*/
			}

		},

		navigateQuickview : function(event) {
			var button = $(event.currentTarget);

			if (button.hasClass('quickview-next')) {
				this.productLinkIndex++;
			} else {
				this.productLinkIndex--;
			}

			app.quickView.show({
				url : this.productLinks[this.productLinkIndex].href,
				source : 'quickview'
			});

			event.preventDefault();
		},

		// show quick view dialog and send request to the server to get the product
		// options.source - source of the dialog i.e. search/cart
		// options.url - product url
		/**
		 * @function
		 * @description
		 */
		show : function (options) {
			options.target = app.quickView.init();
			options.callback = function () {
				app.product.init();
				app.dialog.create({
					target : $cache.quickView,
					options : {
						height : 'auto',
						width : 1032,
						dialogClass : 'quickview',
						title : '',
						resizable : false,
						position : 'center',
						open : function () {
							app.progress.hide();
						}
					}
				});
				$cache.quickView.dialog('open');
				app.uievents.init();
				//PANC-370 MYregistry js repload on ajax call
				if(app.enableMyRegistry && app.user.myRegistryJavaScriptUrl.length > 0){
					$.getScript(app.user.myRegistryJavaScriptUrl);
				}
				app.quickView.initializeQuickViewNav(this.url);
				//CALLING EVENT TRACKING FOR QUICKVIEW
				if(app.enabledEventTracking && app.enabledgoogleAnalytics){
				   gAnalytics_events.quickView();
				}
			};
			app.product.get(options);

			return $cache.quickView;
		},
		// close the quick view dialog
		close : function () {
			if($cache.quickView) {
				$cache.quickView.dialog('close').empty();
				return $cache.quickView;
			}
		},
		exists : function () {
			return $cache.quickView && ($cache.quickView.length > 0);
		},
		isActive : function () {
			return $cache.quickView && ($cache.quickView.length > 0) && ($cache.quickView.children.length > 0);
		},
		container : $cache.quickView
	};

}(window.app = window.app || {}, jQuery));

//********************SERVICE BENCH CODE CHANGES*********************************

/**
@class app.sbcheckout
*/
(function (app, $) {
	var $cachesb = {},
	isShipping = false,
	isBilling = false,
	isMultiShipping = false,
	shippingMethods = null;
	
	/**
	 * @function
	 * @description Sets a boolean variable (isShipping) to determine the checkout stage
	 */
	function initializeDom() {
		if ($cachesb.checkoutForm.hasClass("checkout-billing")) {
			app.checkout.cardtype($cachesb.ccContainer,$cachesb.ccNum,$cachesb.ccType);
		}	
		isShipping = $(".checkout-shipping").length > 0;
		isBilling = $(".checkout-billing").length > 0;
		isMultiShipping = $(".checkout-multi-shipping").length > 0;
	}
	/**
	 * @function
	 * @description Initializes the cache of the checkout UI
	 */
	function initializeCache() {
		$cachesb.checkoutForm = $("form.address");
		$cachesb.addressList = $cachesb.checkoutForm.find(".select-address select[id$='_addressFields_ID']");
		$cachesb.firstName = $cachesb.checkoutForm.find("input[name$='_firstName']");
		$cachesb.lastName = $cachesb.checkoutForm.find("input[name$='_lastName']");
		$cachesb.address1 = $cachesb.checkoutForm.find("input[name$='_address1']");
		$cachesb.address2 = $cachesb.checkoutForm.find("input[name$='_address2']");
		$cachesb.city = $cachesb.checkoutForm.find("input[name$='_city']");
		$cachesb.postalCode = $cachesb.checkoutForm.find("input[name$='_postal']");
		$cachesb.phone = $cachesb.checkoutForm.find("input[name$='_phone']");
		$cachesb.countryCode = $cachesb.checkoutForm.find("select[id$='_country']");
		$cachesb.stateCode = $cachesb.checkoutForm.find("select[id$='_state']");
		$cachesb.addToAddressBook = $cachesb.checkoutForm.find("input[name$='_addToAddressBook']");
		if ($cachesb.checkoutForm.hasClass("checkout-shipping")) {
			// shipping only
			$cachesb.useForBilling = $cachesb.checkoutForm.find("input[name$='_useAsBillingAddress']");
			$cachesb.giftMessage = $cachesb.checkoutForm.find(".gift-message-text");
			$cachesb.shippingMethodList = $("#shipping-method-list");
		}

		if ($cachesb.checkoutForm.hasClass("checkout-billing")) {
			// billing only
			$cachesb.email = $cachesb.checkoutForm.find("input[name$='_emailAddress']");
			$cachesb.save = $cachesb.checkoutForm.find("button[name$='_billingsb_save']");
			$cachesb.paymentMethods = $cachesb.checkoutForm.find("div.payment-method");
			$cachesb.paymentMethodId = $cachesb.checkoutForm.find("input[name$='_selectedPaymentMethodID']");
			$cachesb.ccContainer = $("#PaymentMethod_CREDIT_CARD");
			$cachesb.ccList = $("#creditCardList");
			$cachesb.ccOwner = $cachesb.ccContainer.find("input[name$='creditCard_owner']");
			$cachesb.ccType = $cachesb.ccContainer.find("select[name$='_type']");
			$cachesb.ccNum = $cachesb.ccContainer.find("input[name$='_number']");
			$cachesb.ccMonth = $cachesb.ccContainer.find("[name$='_month']");
			$cachesb.ccYear = $cachesb.ccContainer.find("[name$='_year']");
			$cachesb.ccCcv = $cachesb.ccContainer.find("input[name$='_cvn']");
			$cachesb.BMLContainer = $("#PaymentMethod_BML");
			$cachesb.giftCertCode = $cachesb.checkoutForm.find('input[name$="_giftCertCode"]');
			$cachesb.giftCertPin = $cachesb.checkoutForm.find('input[name$="_giftCertPin"]');
			$cachesb.couponCode = $cachesb.checkoutForm.find("input[name$='_couponCode']");
			$cachesb.checkGiftCert = $cachesb.checkoutForm.find("#check-giftcert");
			$cachesb.addGiftCert = $cachesb.checkoutForm.find('#add-giftcert');
			$cachesb.addCoupon = $cachesb.checkoutForm.find("#add-coupon");
							
			$('#ccnumber').val($("input[name$='_billingsb_paymentMethods_creditCard_number']").val());
			$('#ccowner').val($("input[name$='_billingsb_paymentMethods_creditCard_owner']").val());
			$('#ccyear').val($("select[name$='_billingsb_paymentMethods_creditCard_year']").val());
			$('#ccmonth').val($("select[name$='_billingsb_paymentMethods_creditCard_month']").val());
			$('#cctype').val($("select[name$='_billingsb_paymentMethods_creditCard_type']").val());
		
			
		}
	}
	
	/**
	 * @function
	 * @description Selects the first address from the list of addresses
	 */
	function addressLoad() {
		// select address from list
		$cachesb.addressList.on("change", function () {
			$cachesb.checkoutForm.find("select[id$='_country']").val("US");
			//var selected = $(this).children(":selected").first();
			var data;
			if($(this).val().length > 0 && $('option:selected', this).attr('data-address')!= undefined){
				data = JSON.parse($('option:selected', this).attr('data-address'));
    		}
			if (!data) { 
				$('input[name$="_addressFields_firstName"]').val("");
				$('input[name$="_addressFields_lastName"]').val("");
				$('input[name$="_addressFields_address1"]').val("");
				$('input[name$="_addressFields_address2"]').val("");
				$('input[name$="_addressFields_city"]').val("");
				$('select[name$="_addressFields_states_state"]').val("");				
				$('input[name$="_addressFields_postal"]').val("");
				$('input[name$="_addressFields_phone"]').val("");
				$cachesb.checkoutForm.find('.phone_alt').val("");
				$('.pobox_validation').removeClass('error');
				$('.pobox_validation').next('span.error').hide();
				$cachesb.checkoutForm.find('.custom-select').each(function(){
					$(this).selectbox('detach');
					$(this).selectbox('attach');
				});
				return; 
			}
			var p;
			for (p in data) {
				if ($cachesb[p] && data[p]) {
					$cachesb[p].val(data[p].replace("^","'"));
					if ($cachesb[p]===$cachesb.stateCode){
						$cachesb.stateCode.val(data.stateCode);
						$cachesb.stateCode.trigger("change");
					}
				}
			}
			if(data.address2 == null){ 
				$("input[name$='_addressFields_address2']").val("");
			}
			
			if($("input[name$='_addressFields_address1']").val().length > 0){
				$("input[name$='_addressFields_address1']").trigger('blur');
			}
			if($("input[name$='_addressFields_address2']").val().length > 0){
				$("input[name$='_addressFields_address2']").trigger('blur');
			}
		
			if($("input[name$='_addressFields_phone']").val().length > 0){
				$("input[name$='_addressFields_phone']").trigger('change');
			}
			// re-validate the form
			//$cache.checkoutForm.validate().form();
		});
	}
	
	/**
	 * @function
	 * @description Fills the Credit Card form with the passed data-parameter and clears the former cvn input
	 * @param {Object} data The Credit Card data (holder, type, masked number, expiration month/year)
	 */
	function setCCFields(data) {
		$cachesb.ccOwner.val(data.holder);
		$cachesb.ccType.val(data.type);		
		var CCNumber = $('#creditCardList').find('option:selected').attr('data-cc');
		
		$cachesb.ccNum.val(data.maskedNumber);
		$cachesb.ccMonth.val(data.expirationMonth);
		$cachesb.ccYear.val(data.expirationYear);		
		$cachesb.ccCcv.val("");
		
		$('#ccnumber').val(data.maskedNumber);
		$('#ccowner').val(data.holder);
		$('#ccyear').val(data.expirationYear);
		$('#ccmonth').val(data.expirationMonth);
		$('#cctype').val(data.type);
		
		// remove error messages
		$cachesb.ccContainer.find(".errormessage")
						  .toggleClass("errormessage")
						  .filter("span").remove();
		/*added extra for selecting a saved credit card
		$("select.cexpmonth > option[selected]").removeAttr("selected");
		if(data.expirationMonth.toLocaleString().length>1)
			$("select.cexpmonth > option[value='"+data.expirationMonth+"']").prop("selected",true);
		else
			$("select.cexpmonth > option[value='0"+data.expirationMonth+"']").prop("selected",true);*/
		
		$cachesb.ccContainer.find(".errorlabel").toggleClass("errorlabel");
		$cachesb.checkoutForm.find('.custom-select').each(function(){
			$(this).selectbox('detach');
			$(this).selectbox('attach');
		});
		if($('.cardtypeimg').length == 0) {
			$('.form-row.ccrow').append('<span class="cardtypeimg"><span></span></span>');
		}	
		
		if($('.ctype').find('option:selected').attr('label')){
			$('.cardtypeimg > span').attr('data-cardlabel', $('.ctype').find('option:selected').attr('label')).show();	
		} 
	}
	
	/**
	 * @function
	 * @description loads billing address, Gift Certificates, Coupon and Payment methods
	 */
	function billingLoad() {
		if( !$cachesb.paymentMethodId ) return;
		// select credit card from list
		$cachesb.ccList.on("change", function () {			
			var cardUUID = $(this).val();
			if (!cardUUID) {
				$cachesb.ccOwner.val("");
				$cachesb.ccType.val("");
				$cachesb.ccNum.val("");
				$cachesb.ccMonth.val("");
				$cachesb.ccYear.val("");
				$cachesb.checkoutForm.find('.custom-select').each(function(){
					$(this).selectbox('detach');
					$(this).selectbox('attach');
				});
				$('.cardtypeimg > span').hide();
				return;
			}
			
			var ccdata = $cachesb.ccList.data("cardUUID");
			if (ccdata){
				setCCFields(ccdata);
				return;
			}
			populateCreditCardForm(cardUUID);
			if($(this).find('option:selected').attr('data-subid') == "null" || $(this).find('option:selected').attr('data-subid') == null || !$(this).find('option:selected').attr('data-subid')){
				$('.subscriptionId').val('');
			}else{
				$('.subscriptionId').val($(this).find('option:selected').attr('data-subid'));	
			}
			
			 app.uievents.init();
		});
	
		//Promotion code remove
		
		$cachesb.checkoutForm.on('click',".CCremovebutton-mini", function(e){ 
			e.preventDefault();
			$cachesb.checkoutForm.find('.coupon-error').html('');
			var $redemptionCouponArea = $cachesb.checkoutForm.find('.redemption.coupon');
			var url = app.util.appendParamsToUrl($(this).attr('href'),{format:"ajax"});  
			$.ajax({
				url: url,
				method: "POST"
			}).done(function(data){  	
				//window.location.assign(app.urls.billing);
				//var url = app.urls.promotioncodeRefreshURL;
				//var promotioncode = $(".coupon-promo-form-checkout .coupon-promo-list");	
				updateSummary();
				$redemptionCouponArea.html(data);
				$cachesb.checkoutForm.find('.couponCode-input input').val('');
			});
					 
		});
		
		$cachesb.checkoutForm.find("input[name$='_paymentMethods_creditCard_number']").keypress(function (e) {
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
		}
		});
		
		$cachesb.checkoutForm.find(".savecard-check .custom-checkbox input[type='checkbox']").on('change', function(e){
			url = app.util.appendParamsToUrl(app.urls.sessionsaveaddress, {saveAddress: $(this).is(':checked')});	
			$.ajax({url: url, method: "POST"}).done(function(data){});			
		});
		
		$cachesb.checkoutForm.find(".billing-address-checkbox .custom-checkbox input[type='checkbox']").on('change', function(e){
			url = app.util.appendParamsToUrl(app.urls.sessionsaveBillingaddress, {saveBillingAddress: $(this).is(':checked')});	
			$.ajax({url: url, method: "POST"}).done(function(data){});
		});
		 
		if($cachesb.ccNum.val() !=""){
			$cachesb.ccNum.val($cachesb.ccNum.val());	
		}
		
	}
	/**
	 * @function
	 * @description Updates the credit card form with the attributes of a given card
	 * @param {String} cardID the credit card ID of a given card
	 */
	function populateCreditCardForm(cardID) {
		// load card details
		var url = app.util.appendParamToURL(app.urls.billingSelectCCSB, "creditCardUUID", cardID);
		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				if(!data) {
					window.alert(app.resources.CC_LOAD_ERROR);
					return false;
				}
				$cachesb.ccList.data(cardID, data);
				setCCFields(data);
			}
		});
	}
	
	/**
	 * @function Initializes the page events depending on the checkout stage (shipping/billing)
	 */
	function initializeEvents() {
		addressLoad();
		if (isShipping) {
			$(".pt_checkout.sb-checkout").find("#secondary .goto-shipping").click(function(e){
    			e.preventDefault();
    			var $this = $(".pt_checkout.sb-checkout");
    			$this.find(".primary-content .sb-shipping-form .form-row-button .hiddenSaveShipping-sb").trigger('click');
    		});
		}
		else if(isMultiShipping){
			multishippingLoad();
		}
		//changes doen for billing page 
		else if(isBilling){
			$(".pt_checkout.sb-checkout").find("#secondary .goto-shipping").click(function(e){
    			e.preventDefault();
    			var $this = $(".pt_checkout.sb-checkout");
    			$this.find(".primary-content .sb-billing-form .form-row-button .hiddenSaveBilling-sb").trigger('click');
    		});
		}
		billingLoad();
	}
    
    /******* app.sbcheckout public object ********/  
    app.sbcheckout = {
        /**
         * @function
         * @description Initializes the sbcheckout-content and layout
         */
        init : function () {
        	
        	initializeCache();
        	initializeDom();
        	initializeEvents();
			
        	/*	$(".pt_checkout.sb-checkout").find("#secondary .goto-shipping").click(function(e){
    			e.preventDefault();
    			var $this = $(".pt_checkout.sb-checkout");
    			$this.find(".primary-content .sb-shipping-form .form-row-button .hiddenSaveShipping-sb").trigger('click');
    		});
        	var form = $("#dwfrm_billingsb");
        	form.find("input[name='format']").remove();
        	app.checkout.cardtype(form, form.find('input[name*="creditCard_number"]'),form.find('select[name*="creditCard_type"]'));
        	
        	$(".pt_checkout.sb-checkout").find("select.sb-address-select").on("change", function(e){
        		e.preventDefault();
        		if($(this).val().length > 0 && $('option:selected', this).attr('data-address')!= undefined){
        			updateSBShipping($(this).closest('form'),$('option:selected', this).attr('data-address'));
        		}else{
        			cleanSBShipping($(this).closest('form'));
        		}
    		});
        	
        	  //Update SB shippingform
        	function updateSBShipping(sform,shippingJson) {
        		var form = sform;
        		var address = JSON.parse(shippingJson);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_firstName']")).val(address.firstName);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_lastName']")).val(address.lastName);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_address1']")).val(address.address1);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_address2']")).val(address.address2);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_city']")).val(address.city);
        		form.find($("select[name$='_singleshippingsb_shippingAddress_addressFields_states_state']")).val(address.state);
        		form.find($("select[name$='_singleshippingsb_shippingAddress_addressFields_states_state']")).trigger('change');
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_postal']")).val(address.postalCode);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_phone']")).val(address.phone);
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_phone']")).trigger('change');
    	     }
        	//Clean SB shippingform
        	function cleanSBShipping(sform) {
        		var form = sform;
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_firstName']")).val("");
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_lastName']")).val("");
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_address1']")).val("");
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_address2']")).val("");
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_city']")).val("");
        		form.find($("select[name$='_singleshippingsb_shippingAddress_addressFields_states_state']")).val("");
        		form.find($("select[name$='_singleshippingsb_shippingAddress_addressFields_states_state']")).trigger('change');
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_postal']")).val("");
        		form.find($("input[name$='_singleshippingsb_shippingAddress_addressFields_phone']")).val("");
        		form.find('.phone_alt').val("");
    	     }
        	$("#creditCardList").on("change", function () {			
    			
    		});
    		*/
        }
	};
}(window.app = window.app || {}, jQuery));

//******************************SERVICE BENCH CODE ENDS******************************************

/**
 * @class app.util
 */
(function (app, $) {

	// sub namespace app.util.* contains utility functions
	app.util = {
		/**
		 * @function
		 * @description trims a prefix from a given string, this can be used to trim
		 * a certain prefix from DOM element IDs for further processing on the ID
		 */
		trimPrefix : function (str, prefix) {
			return str.substring(prefix.length);
		},

		/**
		 * @function
		 * @description
		 */
		setDialogify : function (e) {
			e.preventDefault();
			var actionSource = $(this),
				dlgAction = $(actionSource).data("dlg-action") || {}, // url, target, isForm
				dlgOptions = $.extend({}, app.dialog.settings, $(actionSource).data("dlg-options") || {});

			dlgOptions.title = dlgOptions.title || $(actionSource).attr("title") || "";

			var url = dlgAction.url // url from data
					  || (dlgAction.isForm ? $(actionSource).closest("form").attr("action") : null) // or url from form action if isForm=true
					  || $(actionSource).attr("href"); // or url from href

			if (!url) { return; }

			var form = jQuery(this).parents('form');
			var method = form.attr("method")||"POST";

			// Start JIRA PREV-31 : UI issue in forget Password overlay. Added the following piece of code newly
			if(actionSource[0].tagName == "BUTTON" && !form.valid() || actionSource[0].tagName == "INPUT" && !form.valid()){
				return false;
			}
			// End JIRA PREV-31

			// if this is a content link, update url from Page-Show to Page-Include
			if ($(this).hasClass("attributecontentlink")) {
				var uri = app.util.getUri(url);
				url = app.urls.pageInclude+uri.query;
			}
			if (method && method.toUpperCase() == "POST")
			{
		         var postData = form.serialize() + "&"+ jQuery(this).attr("name") + "=submit";
		    }
			else
			{
		         if (url.indexOf('?') == -1 )
		         {
		          url+='?';
		         }
		         else
		         {
		          url += '&'
		         }
		         url += form.serialize();
		         url = app.util.appendParamToURL(url, jQuery(this).attr('name'), "submit");
			}

			var dlg = app.dialog.create({target:dlgAction.target, options : dlgOptions});

			app.ajax.load({
				url:$(actionSource).attr("href") || $(actionSource).closest("form").attr("action"),
				target:dlg, callback: function () {
					dlg.dialog("open");	// open after load to ensure dialog is centered
					var $con = $('.ui-dialog');
					app.dialogposition.init($con);
					app.validator.init(); // re-init validator
					app.tooltips.init(); // JIRA PREV-84 : Multiple shipping page: Not displaying Tool tip. re-init tooltips.
				},
				data : !$(actionSource).attr("href") ? postData : null,
				type : method //JIRA PREV-39 : CREDIT CARD Overlay: Overlay is transformed into page. Added type.

			});
		},
		/**
		 * @function
		 * @description Appends a character to the left side of a numeric string (normally ' ')
		 * @param {String} str the original string
		 * @param {String} padChar the character which will be appended to the original string
		 * @param {Number} len the length of the end string
		 */
		padLeft : function (str, padChar, len) {
			var digs = len || 10;
			var s = str.toString();
			var dif = digs - s.length;
			while(dif > 0) {
				s = padChar + s;
				dif--;
			}
			return s;
		},

		/**
		 * @function
		 * @description appends the parameter with the given name and value to the given url and returns the changed url
		 * @param {String} url the url to which the parameter will be added
		 * @param {String} name the name of the parameter
		 * @param {String} value the value of the parameter
		 */
		appendParamToURL : function (url, name, value) {
			var c = "?";
			if(url.indexOf(c) !== -1) {
				c = "&";
			}
			return url + c + name + "=" + encodeURIComponent(value);
		},
		/**
		 * @function
		 * @description
		 * @param {String}
		 * @param {String}
		 */
		elementInViewport: function (el, offsetToTop) {
			var top = el.offsetTop,
				left = el.offsetLeft,
				width = el.offsetWidth,
				height = el.offsetHeight;

			while (el.offsetParent) {
				el = el.offsetParent;
				top += el.offsetTop;
				left += el.offsetLeft;
			}

			if (typeof(offsetToTop) != 'undefined') {
				top -= offsetToTop;
			}


			if ( window.pageXOffset != null) {

				return (
						top < (window.pageYOffset + window.innerHeight) &&
						left < (window.pageXOffset + window.innerWidth) &&
						(top + height) > window.pageYOffset &&
						(left + width) > window.pageXOffset
				);

			}

			if (document.compatMode == "CSS1Compat") {
				return (
					top < (window.document.documentElement.scrollTop + window.document.documentElement.clientHeight) &&
					left < (window.document.documentElement.scrollLeft + window.document.documentElement.clientWidth) &&
					(top + height) > window.document.documentElement.scrollTop &&
					(left + width) > window.document.documentElement.scrollLeft
			);

			}
		},
		/**
		 * @function
		 * @description appends the parameters to the given url and returns the changed url
		 * @param {String} url the url to which the parameters will be added
		 * @param {String} params a JSON string with the parameters
		 */
		appendParamsToUrl : function (url, params) {
			var uri = app.util.getUri(url),
				includeHash = arguments.length < 3 ? false : arguments[2];

			var qsParams = $.extend(uri.queryParams, params);
			var result = uri.path+"?"+$.param(qsParams);
			if (includeHash) {
				result+=uri.hash;
			}
			if (result.indexOf("http")<0 && result.charAt(0)!=="/") {
				result="/"+result;
			}

			return result;
		},
		/**
		 * @function
		 * @description removes the parameter with the given name from the given url and returns the changed url
		 * @param {String} url the url from which the parameter will be removed
		 * @param {String} name the name of the parameter
		 */
		removeParamFromURL : function (url, parameter) {
			var urlparts = url.split('?');

			if(urlparts.length >= 2) {
				var urlBase = urlparts.shift();
				var queryString = urlparts.join("?");

				var prefix = encodeURIComponent(parameter) + '=';
				var pars = queryString.split(/[&;]/g);
				var i=pars.length;
				while(0 > i--) {
					if(pars[i].lastIndexOf(prefix, 0) !== -1) {
						pars.splice(i, 1);
					}
				}
				url = urlBase + '?' + pars.join('&');
			}
			return url;
		},

		/**
		 * @function
		 * @description Returns the static url for a specific relative path
		 * @param {String} path the relative path
		 */
		staticUrl : function (path) {
			if(!path || $.trim(path).length === 0) {
				return app.urls.staticPath;
			}

			return app.urls.staticPath + (path.charAt(0) === "/" ? path.substr(1) : path );
		},
		/**
		 * @function
		 * @description Appends the parameter 'format=ajax' to a given path
		 * @param {String} path the relative path
		 */
		ajaxUrl : function (path) {
			return app.util.appendParamToURL(path, "format", "ajax");
		},

		/**
		 * @function
		 * @description
		 * @param {String} url
		 */
		toAbsoluteUrl : function (url) {
			if (url.indexOf("http")!==0 && url.charAt(0)!=="/") {
				url = "/"+url;
			}
			return url;
		},
		/**
		 * @function
		 * @description Loads css dynamically from given urls
		 * @param {Array} urls Array of urls from which css will be dynamically loaded.
		 */
		loadDynamicCss : function (urls) {
			var i, len=urls.length;
			for(i=0; i < len; i++) {
				app.util.loadedCssFiles.push(app.util.loadCssFile(urls[i]));
			}
		},

		/**
		 * @function
		 * @description Loads css file dynamically from given url
		 * @param {String} url The url from which css file will be dynamically loaded.
		 */
		loadCssFile : function (url) {
			return $("<link/>").appendTo($("head")).attr({
				type : "text/css",
				rel : "stylesheet"
			}).attr("href", url); // for i.e. <9, href must be added after link has been appended to head
		},
		// array to keep track of the dynamically loaded CSS files
		loadedCssFiles : [],

		/**
		 * @function
		 * @description Removes all css files which were dynamically loaded
		 */
		clearDynamicCss : function () {
			var i = app.util.loadedCssFiles.length;
			while(0 > i--) {
				$(app.util.loadedCssFiles[i]).remove();
			}
			app.util.loadedCssFiles = [];
		},
		/**
		 * @function
		 * @description Extracts all parameters from a given query string into an object
		 * @param {String} qs The query string from which the parameters will be extracted
		 */
		getQueryStringParams : function (qs) {
			if(!qs || qs.length === 0) { return {}; }

			var params = {}, unescapedQS = unescape(qs);
			// Use the String::replace method to iterate over each
			// name-value pair in the string.
			unescapedQS.replace( new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
						function ( $0, $1, $2, $3 ) {	params[ $1 ] = $3; }
			);
			return params;
		},
		/**
		 * @function
		 * @description Returns an URI-Object from a given element with the following properties:<br/>
		 * <p>protocol</p>
		 * <p>host</p>
		 * <p>hostname</p>
		 * <p>port</p>
		 * <p>path</p>
		 * <p>query</p>
		 * <p>queryParams</p>
		 * <p>hash</p>
		 * <p>url</p>
		 * <p>urlWithQuery</p>
		 * @param {Object} o The HTML-Element
		 */
		getUri : function (o) {
			var a;
			if (o.tagName && $(o).attr("href")) {
				a = o;
			}
			else if (typeof o === "string") {
				a = document.createElement("a");
				a.href = o;
			}
			else {
				return null;
			}

			return {
				protocol : a.protocol, //http:
				host : a.host, //www.myexample.com
				hostname : a.hostname, //www.myexample.com'
				port : a.port, //:80
				path : a.pathname, // /sub1/sub2
				query : a.search, // ?param1=val1&param2=val2
				queryParams : a.search.length > 1 ? app.util.getQueryStringParams(a.search.substr(1)) : {},
				hash : a.hash, // #OU812,5150
				url : a.protocol+ "//" + a.host + a.pathname,
				urlWithQuery : a.protocol+ "//" + a.host + a.port + a.pathname + a.search
			};
		},
		/**
		 * @function
		 * @description Appends a form-element with given arguments to a body-element and submits it
		 * @param {Object} args The arguments which will be attached to the form-element:<br/>
		 * <p>url</p>
		 * <p>fields - an Object containing the query-string parameters</p>
		 */
		postForm : function (args) {
			var form = $("<form>").attr({action:args.url,method:"post"}).appendTo("body");
			var p;
			for (p in args.fields) {
				$("<input>").attr({name:p,value:args.fields[p]}).appendTo(form);
			}
			form.submit();
		},
		/**
		 * @function
		 * @description  Returns a JSON-Structure of a specific key-value pair from a given resource bundle
		 * @param {String} key The key in a given Resource bundle
		 * @param {String} bundleName The resource bundle name
		 * @param {Object} A callback function to be called
		 */
		getMessage : function (key, bundleName, callback) {
			if (!callback || !key || key.length===0) {
				return;
			}
			var params = {key:key};
			if (bundleName && bundleName.length===0) {
				params.bn = bundleName;
			}
			var url = app.util.appendParamsToUrl(app.urls.appResources, params);
			$.getJSON(url, callback);
		},
		/**
		 * @function
		 * @description Updates the states options to a given country
		 * @param {String} countrySelect The selected country
		 */
		updateStateOptions : function(countrySelect) {
			var $country = $(countrySelect);
			if ($country.length===0 || !app.countries[$country.val()]) {
				 return;
			}
			var $form = $country.closest("form"),
				c = app.countries[$country.val()],
				arrHtml = [],
				$stateField = $country.data("stateField") ? $country.data("stateField") : $form.find("select[name$='_state']"),
				$postalField = $country.data("postalField") ? $country.data("postalField") : $form.find("input[name$='_postal']"),
				$stateLabel = ($stateField.length > 0) ? $form.find("label[for='" + $stateField[0].id + "'] span").not(".required-indicator") : undefined,
				$postalLabel = ($postalField.length > 0) ? $form.find("label[for='" + $postalField[0].id + "'] span").not(".required-indicator") : undefined;

			// set the label text
			if ($postalLabel) {$postalLabel.html(c.postalLabel);}
			if ($stateLabel) {
				$stateLabel.html(c.regionLabel);
			} else {
				return;
			}
			var s;
			for (s in c.regions) {
				arrHtml.push('<option value="' + s + '">' + c.regions[s] + '</option>');
			}
			// clone the empty option item and add to stateSelect
			var o1 = $stateField.children().first().clone();
			$stateField.html(arrHtml.join("")).removeAttr("disabled").children().first().before(o1);
			$stateField[0].selectedIndex = 0;
		},
		/**
		 * @function
		 * @description Updates the number of the remaining character
		 * based on the character limit in a text area
		 */
		limitCharacters : function () {
			$('form').find('textarea[data-character-limit]').each(function(){
				var characterLimit = $(this).data("character-limit");
				//var charstart = $('form').find('textarea').val().length;
				var charLeft = $(this).val().length;
				var charstart = characterLimit - charLeft;
				var charCountHtml = String.format(app.resources.CHAR_LIMIT_MSG,
										'<span class="char-allowed-count">'+characterLimit+'</span>',
										'<span class="char-remain-count">'+charstart+'</span>');
				var charCountContainer = $(this).next('div.char-count');
				if (charCountContainer.length===0) {
					charCountContainer = $('<div class="char-count"/>').insertAfter($(this));
				}
				charCountContainer.html(charCountHtml);
				// trigger the keydown event so that any existing character data is calculated
				$(this).change();
			});
		},
		/**
		 * @function
		 * @description Binds the onclick-event to a delete button on a given container,
		 * which opens a confirmation box with a given message
		 * @param {String} container The name of element to which the function will be bind
		 * @param {String} message The message the will be shown upon a click
		 */
		setDeleteConfirmation : function(container, message) {
			$(container).on("click", ".delete", function(e){
				return confirm(message);
			});
		},
		/**
		 * @function
		 * @description Scrolls a browser window to a given x point
		 * @param {String} The x coordinate
		 */
		scrollBrowser : function (xLocation) {
			$('html, body').animate({ scrollTop: xLocation }, 500);
		},

		/**
		 * @function
		 * @description Reads cookie based on cokkie name
		 * @param {String} The cookie name
		 */
		readCookie : function (name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		}


	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.page
 */
(function (app, $) {

	app.page = {
		title : "",
		type : "",
		setContext : function (o) {
			$.extend(app.page, o);
		},
		params : app.util.getQueryStringParams(window.location.search.substr(1)),
		redirect : function(newURL) {
			var t=setTimeout("window.location.href='"+newURL+"'",0);
		},
		refresh : function() {
			var t=setTimeout("window.location.assign(window.location.href);",500);

		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.registry
 */
(function (app, $) {
	var $cache = {};
	/**
	 * @function
	 * @description Loads address details to a given address and fills the "Pre-Event-Shipping" address form
	 * @param {String} addressID The ID of the address to which data will be loaded
	 */
	function populateBeforeAddressForm(addressID) {
		// load address details
		var url = app.urls.giftRegAdd + addressID;
		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				if(!data || !data.address) {
					window.alert(app.resources.REG_ADDR_ERROR);
					return false;
				}
				// fill the form
				$cache.addressBeforeFields.filter("[name$='_addressid']").val(data.address.ID);
				$cache.addressBeforeFields.filter("[name$='_firstname']").val(data.address.firstName);
				$cache.addressBeforeFields.filter("[name$='_lastname']").val(data.address.lastName);
				$cache.addressBeforeFields.filter("[name$='_address1']").val(data.address.address1);
				$cache.addressBeforeFields.filter("[name$='_address2']").val(data.address.address2);
				$cache.addressBeforeFields.filter("[name$='_city']").val(data.address.city);
				$cache.addressBeforeFields.filter("[name$='_postal']").val(data.address.postalCode);
				$cache.addressBeforeFields.filter("[name$='_state']").val(data.address.stateCode);
				$cache.addressBeforeFields.filter("[name$='_country']").val(data.address.countryCode);
				$cache.addressBeforeFields.filter("[name$='_phone']").val(data.address.phone);
				$cache.registryForm.validate().form();
			}
		});
	}

	/**
	 * @function
	 * @description Loads address details to a given address and fills the "Post-Event-Shipping" address form
	 * @param {String} addressID The ID of the address to which data will be loaded
	 */
	function populateAfterAddressForm(addressID) {
		// load address details
		var url = app.urls.giftRegAdd + addressID;
		 app.ajax.getJson({
			url: url,
			callback: function (data) {
				if(!data || !data.address) {
					window.alert(app.resources.REG_ADDR_ERROR);
					return false;
				}
				// fill the form
				$cache.addressAfterFields.filter("[name$='_addressid']").val(data.address.ID);
				$cache.addressAfterFields.filter("[name$='_firstname']").val(data.address.firstName);
				$cache.addressAfterFields.filter("[name$='_lastname']").val(data.address.lastName);
				$cache.addressAfterFields.filter("[name$='_address1']").val(data.address.address1);
				$cache.addressAfterFields.filter("[name$='_address2']").val(data.address.address2);
				$cache.addressAfterFields.filter("[name$='_city']").val(data.address.city);
				$cache.addressAfterFields.filter("[name$='_postal']").val(data.address.postalCode);
				$cache.addressAfterFields.filter("[name$='_state']").val(data.address.stateCode);
				$cache.addressAfterFields.filter("[name$='_country']").val(data.address.countryCode);
				$cache.addressAfterFields.filter("[name$='_phone']").val(data.address.phone);
				$cache.registryForm.validate().form();
			}
		});
	}
	/**
	 * @function
	 * @description copy pre-event address fields to post-event address fields
	 */
	function copyBeforeAddress() {
		$cache.addressBeforeFields.each(function () {
			var fieldName = $(this).attr("name");
			var afterField = $cache.addressAfterFields.filter("[name='"+fieldName.replace("Before","After")+"']");
			afterField.val($(this).val());
		});
	}
	/*Start JIRA PREV-89:Post event Shipping details are displaying in disable state when click on previous button and come back to same page.
	  Added removeAfterAddress() method*/
	function removeAfterAddress(){
		$cache.addressAfterFields.filter("[name$='_addressid']").val("");
		$cache.addressAfterFields.filter("[name$='_firstname']").val("");
		$cache.addressAfterFields.filter("[name$='_lastname']").val("");
		$cache.addressAfterFields.filter("[name$='_address1']").val("");
		$cache.addressAfterFields.filter("[name$='_address2']").val("");
		$cache.addressAfterFields.filter("[name$='_city']").val("");
		$cache.addressAfterFields.filter("[name$='_postal']").val("");
		$cache.addressAfterFields.filter("[name$='_state']").val("");
		$cache.addressAfterFields.filter("[name$='_country']").val("");
		$cache.addressAfterFields.filter("[name$='_phone']").val("");

	}
	/*End JIRA PREV-89*/

	/**
	 * @function
	 * @description Disables or enables the post-event address fields depending on a given boolean
	 * @param {Boolean} disabled True to disable; False to enables
	 */
	function setAfterAddressDisabled(disabled) {
		if (disabled) {
			$cache.addressAfterFields.attr("disabled", "disabled");
		}
		else {
			$cache.addressAfterFields.removeAttr("disabled");
		}
	}
	/**
	 * @private
	 * @function
	 * @description Cache initialization of the gift registration
	 */
	function initializeCache() {
		$cache = {
			registryForm : $("form[name$='_giftregistry']"),
			registryItemsTable : $("form[name$='_giftregistry_items']"),
			registryTable : $("#registry-results")
		};
		$cache.copyAddress = $cache.registryForm.find("input[name$='_copyAddress']");
		$cache.addressBeforeFields = $cache.registryForm.find("fieldset[name='address-before'] input:not(:checkbox), fieldset[name='address-before'] select");
		$cache.addressAfterFields = $cache.registryForm.find("fieldset[name='address-after'] input:not(:checkbox), fieldset[name='address-after'] select");
	}
	/**
	 * @private
	 * @function
	 * @description DOM-Object initialization of the gift registration
	 */
	function initializeDom() {
		$cache.addressBeforeFields.filter("[name$='_country']")
			.data("stateField", $cache.addressBeforeFields.filter("[name$='_state']"))
			.data("postalField", $cache.addressBeforeFields.filter("[name$='_postal']"));
		$cache.addressAfterFields.filter("[name$='_country']")
			.data("stateField", $cache.addressAfterFields.filter("[name$='_state']"))
			.data("postalField", $cache.addressAfterFields.filter("[name$='_postal']"));

		if ($cache.copyAddress.length && $cache.copyAddress[0].checked) {
			// fill the address after fields
			copyBeforeAddress();
			setAfterAddressDisabled(true);
		}
	}
	/**
	 * @private
	 * @function
	 * @description Initializes events for the gift registration
	 */
	function initializeEvents() {
		app.sendToFriend.initializeDialog("div.list-table-header", ".send-to-friend");
		app.util.setDeleteConfirmation("table.item-list", String.format(app.resources.CONFIRM_DELETE, app.resources.TITLE_GIFTREGISTRY));

		$cache.copyAddress.on("click", function () {
			if (this.checked) {
				// fill the address after fields
				copyBeforeAddress();
				/*Start JIRA PREV-89:Post event Shipping details are displaying in disable state when click on previous button and come back to same page.
				  Added condition*/
				setAfterAddressDisabled(true);
				$cache.addressAfterFields.filter("[name$='_addressid']").removeAttr("disabled").val("null");
			}else if(!this.checked){
				removeAfterAddress();
				setAfterAddressDisabled(false);
			}
			/*End JIRA PREV-89*/
		});
		$cache.registryForm.on("change", "select[name$='_addressBeforeList']", function (e) {
			var addressID = $(this).val();
			if (addressID.length===0) { return; }
			populateBeforeAddressForm(addressID);
			if ($cache.copyAddress[0].checked) {
				copyBeforeAddress();
			}
		})
		.on("change", "select[name$='_addressAfterList']", function (e) {
			var addressID = $(this).val();
			if (addressID.length===0) { return; }
			populateAfterAddressForm(addressID);
		})
		.on("change", $cache.addressBeforeFields.filter(":not([name$='_country'])"), function (e) {
			if (!$cache.copyAddress[0].checked) { return; }
			copyBeforeAddress();
		});


		$("form").on("change", "select[name$='_country']", function(e) {
			app.util.updateStateOptions(this);

			if ($cache.copyAddress.length > 0 && $cache.copyAddress[0].checked && this.id.indexOf("_addressBefore") > 0) {
				copyBeforeAddress();
				$cache.addressAfterFields.filter("[name$='_country']").trigger("change");
			}
		});

		$cache.registryItemsTable.on("click", ".item-details a", function (e) {
			e.preventDefault();
			var productListID = $('input[name=productListID]').val();
			app.quickView.show({
				url : e.target.href,
				source : "giftregistry",
				productlistid : productListID
			});
		});
	}

	/******* app.registry public object ********/
	app.registry = {
		init : function () {
			initializeCache();
			initializeDom();
			initializeEvents();
			app.product.initAddToCart();

		}

	};

}(window.app = window.app || {}, jQuery));

/**
 * @class app.progress
 */
(function (app, $) {
	var loader;
	app.progress = {
		/**
		 * @function
		 * @description Shows an AJAX-loader on top of a given container
		 * @param {Element} container The Element on top of which the AJAX-Loader will be shown
		 */
		show: function (container) {
			var target = (!container || $(container).length===0) ? $("body") : $(container);
			loader = loader || $(".loader");

			if (loader.length===0) {
				loader = $("<div/>").addClass("loader")
									.append($("<div/>").addClass("loader-indicator"), $("<div/>").addClass("loader-bg"));

			}
			return loader.appendTo(target).show();
		},
		/**
		 * @function
		 * @description Hides an AJAX-loader
		 */
		hide: function () {
			if (loader) { loader.hide(); }
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.components
 */
(function (app, dw, $) {
	/**
	 * @function
	 * @description capture recommendation of each product when it becomes visible in the carousel
	 * @param c TBD
	 * @param {Element} li The visible product element in the carousel
	 * @param index TBD
	 * @param state TBD
	 */
	function captureCarouselRecommendations(c, li, index, state) {
		if (!dw) { return; }

		$(li).find(".capture-product-id").each(function () {
			dw.ac.capture({
				id : $(this).text(),
				type : dw.ac.EV_PRD_RECOMMENDATION
			});
		});
	}

	/******* app.components public object ********/
	app.components = {
		carouselSettings : {
			scroll : 1,
			itemFallbackDimension: '100%',
			itemVisibleInCallback : app.captureCarouselRecommendations
		},
		init : function () {
			setTimeout(function(){
			// renders horizontal/vertical carousels for product slots
			$('#vertical-carousel').jcarousel($.extend({vertical : true}, app.components.carouselSettings));
			$('#horizontal-carousel').jcarousel(app.components.carouselSettings);
			}, 1000);
		}
	};
}(window.app = window.app || {}, window.dw, jQuery));

/**
 * @class app.cart
 */
(function (app, $) {
	var $cache = {};
	/**
	 * @private
	 * @function
	 * @description Updates the cart with new data
	 * @param {Object} postdata An Object representing the the new or uptodate data
	 * @param {Object} A callback function to be called
	 */
	function updateCart(postdata, callback) {
		var url = app.util.ajaxUrl(app.urls.addProduct);
		$.post(url, postdata, callback || app.cart.refresh);
	}
	/**
	 * @private
	 * @function
	 * @description Cache initialization of the cart page
	 */
	function initializeCache() {
		$cache = {
			cartTable : $("#cart-table"),
			itemsForm : $("#cart-items-form"),
			addCoupon : $("#add-coupon"),
			couponCode : $("form input[name$='_couponCode']"),
			cartpage : $(".pt_cart"),
			cartquantity : $("#cart-items-form input[name$='_quantity']")
		};
	}
	/**
	 * @private
	 * @function
	 * @description Binds events to the cart page (edit item's details, bonus item's actions, coupon code entry )
	 */
	function initializeEvents() {
		$cache.cartTable.on("click", ".item-edit-details a", function (e) {
			e.preventDefault();
			app.quickView.show({
				url : e.target.href,
				source : "cart"
			});
		})
		.on("click", ".bonus-item-actions a", function (e) {
			e.preventDefault();
			app.bonusProductsView.show(this.href);
		});

		// override enter key for coupon code entry
		$cache.couponCode.on("keydown", function (e) {
			if (e.which === 13 && $(this).val().length===0) { return false; }
			else if(e.which === 13){e.preventDefault();$cache.addCoupon.click();} // JIRA PREV-30 : Cart page:  Coupon Code is not applying, when the user hit enter key.
		});

		// override enter key for coupon code entry
		$cache.cartquantity.on("keypress", function (e) {
			if((e.which === 13) && ($(this).val().trim()!='')){
				$(this).next('button').click();
			}
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
			}

		});

		$(".cart-recent-views ul").jcarousel($.extend({visible : 4}, app.components.carouselSettings));
		/* Farhan's Dev team 13/1/16 2:45pm PANC-CartUPdate  */
		
		$(".pt_cart .cart-login .cart-message .login-link").click(function(){
		   if($(this).hasClass('active')){
				$(this).removeClass("active");
				$('.cart-login .login-form').addClass('hide');
				$('.cart-login .error-form').addClass('hide');
				$(this).next().slideUp("fast");   		
		   }else{
		    	$(this).addClass('active');
		    	$(this).next().slideDown("fast");
		    	$('.cart-login .login-form').removeClass('hide');
				$('.cart-login .error-form').removeClass('hide');
		   	}
		});
		 $(document).ready(function() {
			 if($(".error-form").hasClass('cart-login-error')){
					$(".login-link").addClass("active");   		
			   }else{
				$(".login-link").removeClass("active"); 
		   	}
		 });
		 $(".pt_cart .cart-footer .cart-coupponcode-heading").click(function(){
		   if($(this).hasClass('active')){
				$(this).removeClass("active");
				$(this).next().slideUp("fast");		   		
		   } else{
		    	$(this).addClass('active');
		    	$(this).next().slideDown("fast");
		   	}
		});
		$(document).on('click','.cart-summey-fetures .easyreturns,.feature-dialog-close',function(e){
				e.preventDefault();
				$('.easyreytutrns-detaisl').toggle();
		});
		
		
		/* CartUPdate END */
		//cart page last visited products add to cart
		$cache.cartpage.on("click", ".add-to-cart-refresh", function (e) {
			e.preventDefault();
			var form = $(this).closest("form");
			var qty = form.find("input[name='Quantity']");
			var isSubItem = $(this).hasClass("sub-product-item");
			if(qty.length === 0 || isNaN(qty.val()) || parseInt(qty.val(), 10) === 0) {
				qty.val("1");
			}
			var data = form.serialize();
			app.cart.update(data, function (response) {
				var uuid = form.find("input[name='uuid']");
				if (uuid.length > 0 && uuid.val().length > 0) {
					app.cart.refresh();
				}
				else {
					if (!isSubItem) {
						app.quickView.close();
					}
					app.cart.refresh();
				}
			});

		})


	}
	/******* app.cart public object ********/
	app.cart = {
		/**
		 * @function
		 * @description Adds new item to the cart
		 * @param {Object} postdata An Object representing the the new or uptodate data
		 * @param {Object} A callback function to be called
		 */
		add : function (postdata, callback) {
			updateCart(postdata, callback);
		},
		/**
		 * @function
		 * @description Hook for removing item from the cart
		 *
		 */
		remove : function () {
			return;
		},
		/**
		 * @function
		 * @description Updates the cart with new data
		 * @param {Object} postdata An Object representing the the new or uptodate data
		 * @param {Object} A callback function to be called
		 */
		update : function (postdata, callback) {
			updateCart(postdata, callback);
		},
		/**
		 * @function
		 * @description Refreshes the cart without posting
		 */
		refresh : function () {
			// refresh without posting
			app.page.refresh();
		},
		/**
		 * @function
		 * @description Initializes the functionality on the cart
		 */
		init : function () {
			// edit shopping cart line item
			initializeCache();
			initializeEvents();
			if(app.enabledStorePickup){
				app.storeinventory.init();
			}
			app.account.initCartLogin();
		}
	};

}(window.app = window.app || {}, jQuery));

/**
 * @class app.account
 */
(function (app, $) {
	var $cache = {};

	/**
	 * @private
	 * @function
	 * @description Initializes the events on the payment address form (apply, cancel)
	 * @param {Element} form The form which will be initialized
	 */
	function initializePaymentAddressForm(form) {
		var form = $("#CreditCardForm");
		form.find("input[name='format']").remove();
		app.tooltips.init();
		form.find('input[type="text"]').on('keypress', function(e){
			if(e.which == 13){
				form.find("#applyBtn").trigger('click');
			}
		});
		app.checkout.cardtype(form, form.find('input[name*="newcreditcard_number"]'),form.find('select[name*="newcreditcard_type"]'));
		form.find("#applyBtn").unbind('click').on("click", function(e){
			e.preventDefault();
			if(form.find('.carderror.error').is(':visible')){
				return false;
				}
			if(!form.valid()){
				return false;
			}
			if(form.find('.error').is(':visible')){
				return false;
			}
			var currpaymentButton = $(this).attr('name');
			var url = app.util.appendParamsToUrl(form.attr('action'),{format:"ajax"});
			var applyName = form.find('#applyBtn').attr('name');
			var options = {
					url: url,
					data: form.serialize()+"&"+applyName+'=x',
					type: "POST"
				};
			app.progress.show(form);
			$.ajax( options ).done(function(data){
				var response = JSON.parse(data.trim());
				if(response.success == 'true')
				{
					form.find('.success-fail-msg').html('');
					if(currpaymentButton == 'dwfrm_paymentinstruments_creditcards_create') {
					    window.location.href = app.urls.addcreditcard;
					} else if(currpaymentButton == 'dwfrm_paymentinstruments_creditcards_edit') {
					        	window.location.href = app.urls.editcreditcard;
					}

				}else{
					form.find('.success-fail-msg').html('').html(response.message);
					app.progress.hide();
				}
				app.progress.hide();

			});

		})
		.on("click", ".button-cancel, .close-button", function(e){
			e.preventDefault();
			window.location.href=app.urls.paymentsList;
		})
		if( $("#CreditCardForm").find('input[name*="newcreditcard_number"]').length>0){
			var cardNumber = $("#CreditCardForm").find('input[name*="newcreditcard_number"]');
	        if(cardNumber.val() !=""){
	             cardNumber.val(cardNumber.val());
	        }
		}

		form.find(".positivenumber").keypress(function (e) {
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
		}
		});

		app.validator.init();

	}
	/**
	 * @private
	 * @function
	 * @description Initializes the events on the address form (apply, cancel, delete)
	 * @param {Element} form The form which will be initialized
	 */
	function initializeAddressForm(form) {
		var form = $("#edit-address-form");

		form.find("input[name='format']").remove();
		app.tooltips.init();
		//$("<input/>").attr({type:"hidden", name:"format", value:"ajax"}).appendTo(form);

		form.on("click", ".apply-button", function(e) {
			e.preventDefault();
			var currButton = $(this).attr('name');
			var addressId = form.find("input[name$='_addressid']");
			addressId.val(addressId.val().replace(/[^\w+-]/g, "-"));
			if (!form.valid()) {
				return false;
			}
			var url = app.util.appendParamsToUrl(form.attr('action'),{format:"ajax"});
			var applyName = form.find('.apply-button').attr('name');
			var options = {
				url: url,
				data: form.serialize()+"&"+applyName+'=x',
				type: "POST"
			};
			app.progress.show(form);
			$.ajax( options ).done(function(data){
				var response = JSON.parse(data.trim());
				/*if( typeof(data)!=='string' ) {
					if ( data.success ) {
						app.dialog.close();
						app.page.refresh();
					} else {
						alert(data.message);
						return false;
					}
				} else {
					$('#dialog-container').html(data);
					app.account.init();
					app.tooltips.init();
				}*/
				if(response.success == 'true')
				{
			        form.find('.error-msg').html('');
			        if(currButton == 'dwfrm_profile_address_create') {
			        	window.location.href = app.urls.addaddress;
			        } else if(currButton == 'dwfrm_profile_address_edit') {
			        	window.location.href = app.urls.editaddress;
			        }
				}else{
					form.find('.success-fail-msg').removeClass('hide');
					form.find('.error-msg').html('');
					form.find('.error-msg').prepend(response.message);
					form.find('.addressid').val(response.AddressID);

				}
				app.progress.hide();


			});

		})
		.on("click", ".cancel-button, .close-button", function(e){
			e.preventDefault();
			app.dialog.close();
			window.location.href=app.urls.addressesList;
		})
		.on("click", ".delete-button", function(e){
			e.preventDefault();
			if (confirm(String.format(app.resources.CONFIRM_DELETE, app.resources.TITLE_ADDRESS))) {
				var url = app.util.appendParamsToUrl(app.urls.deleteAddress, {AddressID:form.find("#addressid").val(),format:"ajax"});
				$.ajax({
					url: url,
					method: "POST",
					dataType:"json"
				}).done(function(data){
					if (data.status.toLowerCase()==="ok") {
						app.dialog.close();
						window.location.href=app.urls.addressesList;
					}
					else if (data.message.length>0) {
						alert(data.message);
						return false;
					}
					else {
						app.dialog.close();
						window.location.href=app.urls.addressesList;
					}
				});
			}
		});

		$cache.countrySelect = form.find("select[id$='_country']");
		$cache.countrySelect.on("change", function(){
			app.util.updateStateOptions(this);
		});

		app.validator.init();
	}

	/**
	 * @private
	 * @function
	 * @description Initializes the events on the orderhistory and order details
	 * @param {Element} form The form which will be initialized
	 */
	function initializeOrderHistoryOrderDetails() {

		$(document).on("click", ".cancel-order-link", function(e){
			e.preventDefault();
			if (confirm(String.format(app.resources.CONFIRM_CANCEL, app.resources.TITLE_ORDER))) {
				var url = $(this).attr("href");
				window.location.href=url;
			}
		});
	}



	/**
	 * @private
	 * @function
	 * @description Toggles the list of Orders
	 */
	function toggleFullOrder () {
		$('.order-items')
			.find('li.hidden:first')
				.prev('li')
					.append('<a class="toggle">View All</a>')
					.children('.toggle')
						.click(function() {
							$(this).parent().siblings('li.hidden').show();
							$(this).remove();
						});
	}
	/**
	 * @private
	 * @function
	 * @description Binds the events on the address form (edit, create, delete)
	 */
	function initAddressEvents() {
		var addresses = $("#addresses");
		if (addresses.length===0) { return; }

		addresses.on("click", "a.address-create", function(e){
			e.preventDefault();
			//var options = {open: initializeAddressForm};
			//app.dialog.open({url:this.href, options:options});
			//window.location.href = this.href;
			//app.account.initAddAddress();
		}).on("click", "a.address-edit", function(e){
			e.preventDefault();
			//var options = {open: initializeEditAddressForm};
			//app.dialog.open({url:this.href, options:options});
			window.location.href = this.href;
			//app.account.initEditAddress();

		}).on("click", ".delete", function(e){
			e.preventDefault();
			if (confirm(String.format(app.resources.CONFIRM_DELETE, app.resources.TITLE_ADDRESS))) {
				$.ajax({
					url: app.util.appendParamsToUrl($(this).attr("href"), {format:"ajax"}),
					dataType:"json"
				}).done(function(data){
					if (data.status.toLowerCase()==="ok") {
						app.page.redirect(app.urls.addressesList);
					}
					else if (data.message.length>0) {
						alert(data.message);
					}
					else {
						app.page.refresh();
					}
				});
			}
		});
	}
	/**
	 * @private
	 * @function
	 * @description Binds the events of the payment methods list (delete card)
	 */
	function initPaymentEvents() {
		var paymentList = $(".payment-list");
		if (paymentList.length===0) { return; }

		app.util.setDeleteConfirmation(paymentList, String.format(app.resources.CONFIRM_DELETE, app.resources.TITLE_CREDITCARD));

		$("form[name='payment-remove']").on("submit", function(e){
			e.preventDefault();
			// override form submission in order to prevent refresh issues
			var button = $(this).find("button.delete");
			$("<input/>").attr({type:"hidden", name:button.attr("name"), value:button.attr("value")||"delete card"}).appendTo($(this));
			var data = $(this).serialize();
			$.ajax({
				type: "POST",
				url: $(this).attr("action"),
				data: data
			})
			.done(function(response) {
				app.page.redirect(app.urls.paymentsList);
			});
		});
	}
	/**
	 * @private
	 * @function
	 * @description init events for the loginPage
	 */
	function initLoginPage() {

		//o-auth binding for which icon is clicked
		$('.oAuthIcon').bind( "click", function() {
			$('#OAuthProvider').val(this.id);
		});

		//toggle the value of the rememberme checkbox
		$( "#dwfrm_login_rememberme" ).bind( "change", function() {
			if($('#dwfrm_login_rememberme').attr('checked')){
				$('#rememberme').val('true')
			}else{
				$('#rememberme').val('false')
			}
		});

		if(window.location.search.indexOf('ordertrack') != -1){
			app.util.scrollBrowser($('.login-order-track').offset().top - 20);
		}
	}
	/** This method used to update the profile name,email password and age **/
	function initializeEditProfileForm() {

		 $('.editname').bind('submit', function (e) {
	         e.preventDefault();
	         var editname = $('.editname');
	         $(this).closest('form').find('.success-fail-msg').removeClass('error-msg').addClass('hide');
				if (!editname.valid()) {
					return false;
			}
	         var $this = $(this);
	         var url = app.util.appendParamToURL(app.urls.updatename);
	         $.ajax({
	           type: 'post',
	           url: url,
	           data: $(".editname").serialize(),
	           success : function(response) {
	               if(response.success){
                     $('#msgname').text(app.resources.UPDATE_NAME_SUCCESS);
	               }else{
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgname').text(app.resources.UPDATE_NAME_FAILURE);
	               }
	               $this.find('.success-fail-msg').removeClass('hide');
	           }
	         });

	       });
		 $('.editemail').bind('submit', function (e) {
	         e.preventDefault();
	         var emailform = $('.editemail');
	         /* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
	         var emailId = $(this).closest('form').find('input[name$="_emailnew"]').val().toLowerCase();
	         /* PANC-1797 END */
	         $(this).closest('form').find('.success-fail-msg').removeClass('error-msg').addClass('hide');
			 if (!emailform.valid()) {
				return false;
 			 }
	         var $this = $(this);
	         var url = app.util.appendParamsToUrl(app.urls.updateemail,{"email":emailId,"shopPCECmember":true});
	         $.ajax({
	           type: 'post',
	           url: url,
	           data: $(".editemail").serialize(),
	           success : function(response) {
	        	 if(response.success){
	                    $('#msgemail').text(app.resources.UPDATE_EMAIL_SUCCESS);
	                    $this.closest('form').find('.emailinfo').text(emailId);
	                    $this.closest('form').find('input[name$="_emailnewconfirm"]').val("");
	                    $this.closest('form').find('input[name$="_oldpassword"]').val("");
	               }else if (response.error == "emailmismatch"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgemail').text(app.resources.UPDATE_EMAIL_MISMATCH);
	               } else if(response.error == "duplicateemail"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgemail').text(app.resources.UPDATE_EMAIL_DUPLICATE);
	               } else if(response.error == "incorrectpw"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgemail').text(app.resources.UPDATE_EMAIL_WITH_CURRENT_PW);
	               } else{
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgemail').text(app.resources.UPDATE_EMAIL_FAILURE);
	               }
	               $this.find('.success-fail-msg').removeClass('hide');
	           }
	         });

	       });
		 $('.editpassword').bind('submit', function (e) {
	         e.preventDefault();
	         var editpassword = $('.editpassword');
	         $(this).closest('form').find('.success-fail-msg').removeClass('error-msg').addClass('hide');
				if (!editpassword.valid()) {
					return false;
			}
	         var $this = $(this);
	         var url = app.util.appendParamToURL(app.urls.updatepassword);
	         $.ajax({
	           type: 'post',
	           url: url,
	           data: $(".editpassword").serialize(),
	           success : function(response) {
	               if(response.success){
	            	   $('#msgpassword').text(app.resources.UPDATE_PASSWORD_SUCCESS);
	            	   $this.closest('form').find('input[name$="_newpassword"]').val("");
	                    $this.closest('form').find('input[name$="_newpasswordconfirm"]').val("");
	               } else if(response.error == "incorrectpw"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgpassword').text(app.resources.UPDATE_EMAIL_WITH_CURRENT_PW);
	               } else if (response.error == "pwmismatch"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgpassword').text(app.resources.UPDATE_PASSWORD_MISMATCH);
	               } else if(response.error == "pwalreadyused"){
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	   $('#msgpassword').text(app.resources.UPDATE_PASSWORD_DUPLICATE);
	               } else{
	            	   $this.find('.success-fail-msg').addClass('error-msg');
	            	    $('#msgpassword').text(app.resources.UPDATE_PASSWORD_FAILURE);
	               }
	               $this.find('.success-fail-msg').removeClass('hide');
	           }
	         });

	       });
		 $('.editpersonalinformation').bind('submit', function (e) {
	         e.preventDefault();
	         $(this).closest('form').find('.success-fail-msg').removeClass('error-msg').addClass('hide');
	         var $this = $(this);
	         var url = app.util.appendParamToURL(app.urls.updatepersonalinformation);
	         $.ajax({
	           type: 'post',
	           url: url,
	           data: $(".editpersonalinformation").serialize(),
	           success : function(response) {
	               if(response.success){
	                      $('#msgpersonalinformation').text(app.resources.UPDATE_PERSONAL_INFO_SUCCESS);
	               }else {
	            	   		$this.find('.success-fail-msg').addClass('error-msg');
	                      $('#msgpersonalinformation').text(app.resources.UPDATE_PERSONAL_INFO_FAILURE);
	               }
	               $this.find('.success-fail-msg').removeClass('hide');
	           }
	         });

	       });
	}

	/***my account events***************/
	function accountinit(){
		if($('#pnsb2c-myaccount-edit').length > 0){
			$('.secondary-navigation li').eq(0).addClass('active');
		}else if($('#pnsb2c-myaccount-address').length > 0){
			$('.secondary-navigation li').eq(1).addClass('active');
		}else if($('#pnsb2c-myaccount-payment').length > 0){
			$('.secondary-navigation li').eq(2).addClass('active');
		}else if($('#pnsb2c-myaccount-orders').length > 0){
			$('.secondary-navigation li').eq(3).addClass('active');
		}else if($('#submit-repair-req-head').length > 0 || $('#sb-repairestimation').length > 0){
			$('.secondary-navigation li').eq(5).addClass('active');
		}else if($('#chk-rep-status').length > 0){
			$('.secondary-navigation li').eq(6).addClass('active');
		}
		
		//line 7064 - 7068 added for SB
		
		$('.pagination a').bind('click', function() {

			var currentBeginIndex = parseInt($('.currentBeginIndex').val());
			var currentPage = $(this).text();
			if($.isNumeric(currentBeginIndex)){
				//Start JIRA PANC-479 : ORDER HISTORY pagination changes
				if(currentPage == "PREV"){
					var nextBeginIndex = currentBeginIndex - 1;
				}else{
					var nextBeginIndex = currentBeginIndex + 1;
				}
				//End JIRA PANC-479: ORDER HISTORY pagination changes
				if(currentPage == "NEXT" || currentPage == "PREV"){
				} else {
					nextBeginIndex = currentBeginIndex;
				}
			}

			if ($(this).parent().hasClass("unselectable")) { return; }
			var catparent = $(this).parents('.category-refinement');
			var folderparent = $(this).parents('.folder-refinement');

			//if the anchor tag is uunderneath a div with the class names & , prevent the double encoding of the url
			//else handle the encoding for the url
			if (catparent.length > 0 || folderparent.length > 0 ) {
				return true;
			} else {

				var uri = app.util.getUri(this);
				var url = app.util.appendParamToURL(this.href);
				if(nextBeginIndex == undefined){
					nextBeginIndex=0;
				}
				var uriSubStr = uri.query.substring(1) + "&nextIndex="+nextBeginIndex;
				if ( uri.query.length > 1 ) {
					// [RAP-2653] requires special handling for 's encoding of ampersands
					var isFirefox = (navigator.userAgent).toLowerCase().indexOf('firefox') >= 0;
					var querystring = 	isFirefox ? encodeURI(decodeURI(uriSubStr)) : uriSubStr;
					if(window.location.href.indexOf('?') == -1){
						window.location.href = window.location.href +'?'+querystring;
					}else{
						window.location.href = window.location.href.split('?')[0] +'?'+querystring;
					}


				} else {
					window.location.href = url;
				}
				return false;
			}

		});

	}
	
	//PANC-447 : Self service returns
	function orderevents(){
		var $order_form = $('#ChhoseItem');
		$order_form.find('[name="Quantity"]').on('blur', function(){
			if($(this).val() != "" && $(this).attr('data-orvalue') != undefined){
				if((parseInt($(this).val()) > parseInt($(this).attr('data-orvalue'))) || parseInt($(this).val()) == 0){
					$(this).closest('.priceDetails').find('.error').show();
				}else{
					$(this).closest('.priceDetails').find('.error').hide();
				}
			}else{
				$(this).closest('.priceDetails').find('.error').show();
			}
			
			if($order_form.find('.priceDetails .error:visible').length > 0){
				$order_form.find('button[type="submit"]').attr('disabled','disabled');
			}else{
				$order_form.find('button[type="submit"]').removeAttr('disabled');
			}
		}).on('keypress', function (e) {
			if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
				return false;
			}
		})
		
	}
	
//ServiceBench events starts
	
	
	/*$('#sb_continueToReviewPage').on('click',function(e){
		
		var firstname = $('input[name$="_billingsb_billingAddress_addressFields_firstName"]').val();
		var lastname = $('input[name$="_billingsb_billingAddress_addressFields_lastName"]').val();
		var address1 = $('input[name$="_billingsb_billingAddress_addressFields_address1"]').val();
		var address2 = $('input[name$="_billingsb_billingAddress_addressFields_address2"]').val();
		var city = $('input[name$="_billingsb_billingAddress_addressFields_city"]').val();
		var zipCode = $('input[name$="_billingsb_billingAddress_addressFields_postal"]').val();
		var phone = $('input[name$="_billingsb_billingAddress_addressFields_phone"]').val();
		var email = $('input[name$="_billingsb_billingAddress_addressFields_emailAddress"]').val();
		var state = $("select[name$='_billingsb_billingAddress_addressFields_states_state']").val();
		
		window.location.href = app.util.appendParamsToUrl(app.urls.sbContinueToReview, {firstname:firstname, lastname:lastname, address1:address1, address2:address2, city:city, zipCode:zipCode, phone:phone, email:email, state:state});
	});*/
	
	function serviceBenchEvents() {
		/*$('.SB-repair-request-page .sb-req-form-btn').on('click',function(e){
			e.preventDefault();
		    var sform = $(this).closest('form');
		    if(!sform.valid()){	
		    	sform.find('button.submit-req-btn').trigger('click');
			}else{
				  if(true){
					  initiateWarranty(sform);
				    }else{
				    	sform.find('button.submit-req-btn').trigger('click');
				    }
				  
			}
		});*/
		
		$('.request-summary-holder .goto-shipping').on('click',function(e){
			e.preventDefault();
			window.location.href = $(this).attr('url');
			
		});
		
		if(app.sbWarrantyStatus == 'false'){  
		
		app.dialog.open({url: app.urls.showSBWarranty, options: {open: function(e) {
			  $('.warranty-cancel').on('click',function(e){
				  e.preventDefault();
				  app.dialog.close();
				  
			  });
			  /*$('.warranty-continue').on('click',function(e){
				  e.preventDefault();
				  app.dialog.close();
				  sform.find('button.submit-req-btn').trigger('click');
				  
			  });*/
		  },
			
	
		    width:500,
		    height:265,
		    dialogClass:"sb-overlay-warranty",
		    title: "Your Manufacturer's Warranty Has Expired"
		  }});
		}
		
	}
	//ServiceBench events ends
	
	function initializeCache() {
		$cache = {
			customerservices : $(".pt_customer-service"),
			contactuspage : $(".pt_customer-service").find(".pnsb2c-contact-us-page-wrapper")
		};
	}
	/**
	 * @private
	 * @function
	 * @description Binds the events of the order, address and payment pages
	 */
	function initializeEvents() {
		toggleFullOrder();
		initAddressEvents();
		initPaymentEvents();
		initLoginPage();
		initializeAddressForm();
		initializeEditProfileForm();
		initializePaymentAddressForm();
		initializeOrderHistoryOrderDetails();
		accountinit();
		orderevents();

		$(".pt_customer-service").find(".pnsb2c-contact-us-page-wrapper").find(".contact-us-form-wrapper .form-block-head, .mail-form-wrapper .form-block-head").unbind('click').on('click', function(e){
			e.preventDefault();
			if($(this).hasClass('active')){
				$(this).removeClass("active");
				$(this).next().slideUp("slow");
			}
			else{
				$(this).addClass('active');
				$(this).next().slideDown("slow");
			}
		});
		
		$('.table-ord-stat-holder.demandwareOrder').find('.Myacc-order-table-holder .prod-name-holder .product-list-item .attribute').hide();
	}

	/******* app.account public object ********/
	app.account = {
		/**
		 * @function
		 * @description Binds the events of the order, address and payment pages
		 */
		init : function () {
			initializeEvents();
			app.giftcert.init();
			//initializing Service bench
			app.account.initServiceBench();
		},
		initCartLogin : function () {
			initLoginPage();
		},
		initServiceBench : function () {
			serviceBenchEvents();
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.wishlist
 */
(function (app, $) {
	var $cache = {};
	/**
	 * @private
	 * @function
	 * @description Binds the send to friend and address changed events to the wishlist page
	 */
	function initializeEvents() {
		app.sendToFriend.initializeDialog("div.list-table-header", ".send-to-friend");
		$cache.editAddress.on('change', function () {
			window.location.href = app.util.appendParamToURL(app.urls.wishlistAddress, "AddressID", $(this).val());

		});

		//add js logic to remove the , from the qty feild to pass regex expression on client side
		jQuery('.option-quantity-desired div input').focusout(function(){
			$(this).val($(this).val().replace(',',''));
		});
	}


	/******* app.wishlist public object ********/
	app.wishlist = {
		/**
		 * @function
		 * @description Binds events to the wishlist page
		 */
		init : function () {
			$cache.editAddress = $('#editAddress');
			$cache.wishlistTable = $('.pt_wish-list .item-list');
			app.product.initAddToCart();
			initializeEvents();

		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.minicart
 */
(function (app, $) {
	// sub name space app.minicart.* provides functionality around the mini cart

	var $cache = {},
		initialized = false;

	var timer = {
		id : null,
		clear : function () {
			if(timer.id) {
				window.clearTimeout(timer.id);
				delete timer.id;
			}
		},
		start : function (duration) {
			timer.id = setTimeout(app.minicart.close, duration);
		}
	};
	/******* app.minicart public object ********/
	app.minicart = {
		url : "", // during page loading, the Demandware URL is stored here

		/**
		 * @function
		 * @description Cache initializations and event binding to the mimcart
		 */
		init : function () {
			$cache.minicart = $("#mini-cart");
			$cache.mcTotal = $cache.minicart.find(".mini-cart-total");
			$cache.mcContent = $cache.minicart.find(".mini-cart-content");
			$cache.mcClose = $cache.minicart.find(".mini-cart-close");
			$cache.mcProductList = $cache.minicart.find(".mini-cart-products");
			$cache.mcProducts = $cache.mcProductList.children(".mini-cart-product");

			var collapsed = $cache.mcProductList.children().not(":first").addClass("collapsed");

			if($('.mini-cart-empty').length > 0){
				$('.mini-cart-total').addClass('emptycart');
			}

			if($cache.mcProducts.length > 2){
				$cache.mcContent.addClass('minicart-overflow');
			}else{
				$cache.mcContent.removeClass('minicart-overflow');
			}
			// bind hover event to the cart total link at the top right corner
			$cache.minicart.on("mouseenter", function () {
				if($cache.mcContent.not(":visible")) {
					app.minicart.slide();
				}
				if($('.mini-cart-empty').length == 0){
					$cache.mcTotal.addClass('visited');
				}

				//Event Tracking For  Minicart Open
				if(app.enabledEventTracking && app.enabledgoogleAnalytics){
					gAnalytics_events.miniCart();
				}
			})
			.on("mouseleave", function () {
				timer.start(30);
			})
			.on("mouseenter", ".mini-cart-content", function (e) {
				timer.clear();
			})
			.on("mouseleave", ".mini-cart-content", function (e) {
				timer.clear();
				timer.start(30);
			})
			.on("click", ".mini-cart-close", app.minicart.close);
		   //Start	JIRA PREV-43 : In RWD,  On Single click on cart icon in the header navigates to cart page.Added conditiion to check for the device.
			$cache.minicart.on("click", ".mini-cart-link", function (e) {
				if($('body').hasClass('panasonic_device')){
					e.preventDefault();
					app.minicart.slide();
				}
			});
		   //End JIRA PREV-43

			//$cache.mcProducts.append('<div class="mini-cart-toggler">&nbsp;</div>');

			//$cache.mcProductList.toggledList({toggleClass : "collapsed", triggerSelector:".mini-cart-toggler", eventName:"click"});

			initialized = true;
		},
		/**
		 * @function
		 * @description Shows the given content in the mini cart
		 * @param {String} A HTML string with the content which will be shown
		 */
		show : function (html) {
			$cache.minicart.html(html);
			app.util.scrollBrowser(0);
			app.minicart.init();
			app.minicart.slide();
			app.bonusProductsView.loadBonusOption();
		},
		/**
		 * @function
		 * @description Slides down and show the contents of the mini cart
		 */
		slide : function () {
			if(!initialized) {
				app.minicart.init();
			}

			if(app.minicart.suppressSlideDown && app.minicart.suppressSlideDown()) {
				return;
			}

			timer.clear();

			// show the item
			$cache.mcContent.fadeIn(200);

			// after a time out automatically close it
			timer.start(6000);
		},
		/**
		 * @function
		 * @description Closes the mini cart with given delay
		 * @param {Number} delay The delay in milliseconds
		 */
		close : function (delay) {
			timer.clear();
			$cache.mcContent.fadeOut(200);
			$cache.mcTotal.removeClass('visited');
		},
		/**
		 * @function
		 * @description Hook which can be replaced by individual pages/page types (e.g. cart)
		 */
			suppressSlideDown : function () {
			return false;
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.dialog
 */
(function (app, $) {
	// private

	var $cache = {};
	// end private

	/******* app.dialog public object ********/
	app.dialog = {
		/**
		 * @function
		 * @description Appends a dialog to a given container (target)
		 * @param {Object} params  params.target can be an id selector or an jquery object
		 */
		create : function (params) {
			// options.target can be an id selector or an jquery object
			var target = $(params.target || "#dialog-container");

			// if no element found, create one
			if(target.length === 0) {
				if(target.selector && target.selector.charAt(0) === "#") {
					id = target.selector.substr(1);
				}
				target = $("<div>").attr("id", id).addClass("dialog-content").appendTo("body");
			}

			// create the dialog
			$cache.container=target;
			$cache.container.dialog($.extend(true, {}, app.dialog.settings, params.options || {}));
			return $cache.container;
		},
		/**
		 * @function
		 * @description Opens a dialog using the given url (params.url)
		 * @param {Object} params.url should contain the url
		 */
		open : function (params) {
			if (!params.url || params.url.length===0) { return; }

			$cache.container = app.dialog.create(params);
			params.url = app.util.appendParamsToUrl(params.url, {format:"ajax"});

			// finally load the dialog
			app.ajax.load({
				target : $cache.container,
				url : params.url,
				callback : function () {
					if ($cache.container.dialog("isOpen")) { return; }
					$cache.container.dialog("open");
					app.uievents.init();
				}
			});

		},
		/**
		 * @function
		 * @description Closes the dialog and triggers the "close" event for the dialog
		 */
		close : function () {
			if(!$cache.container) {
				return;
			}
			$cache.container.dialog("close");
		},
		/**
		 * @function
		 * @description Triggers the "apply" event for the dialog
		 */
		triggerApply : function () {
			$(this).trigger("dialogApplied");
		},
		/**
		 * @function
		 * @description Attaches the given callback function upon dialog "apply" event
		 */
		onApply : function (callback) {
			if(callback) {
				$(this).bind("dialogApplied", callback);
			}
		},
		/**
		 * @function
		 * @description Triggers the "delete" event for the dialog
		 */
		triggerDelete : function () {
			$(this).trigger("dialogDeleted");
		},
		/**
		 * @function
		 * @description Attaches the given callback function upon dialog "delete" event
		 * @param {String} The callback function to be called
		 */
		onDelete : function (callback) {
			if(callback) {
				$(this).bind("dialogDeleted", callback);
			}
		},
		/**
		 * @function
		 * @description Submits the dialog form with the given action
		 * @param {String} The action which will be triggered upon form submit
		 */
		submit : function (action) {
			var form = $cache.container.find("form:first");
			// set the action
			$("<input/>").attr({
				name : action,
				type : "hidden"
			}).appendTo(form);

			// serialize the form and get the post url
			var post = form.serialize();
			var url = form.attr("action");

			// post the data and replace current content with response content
			$.ajax({
				type : "POST",
				url : url,
				data : post,
				dataType : "html",
				success : function (data) {
					$cache.container.html(data);
				},
				failure : function (data) {
					window.alert(app.resources.SERVER_ERROR);
				}
			});
		},
		settings : {
			autoOpen : false,
			resizable : false,
			bgiframe : true,
			modal : true,
			height : 'auto',
			width : '800',
			buttons : {},
			title : '',
			position : 'center',
			overlay : {
				opacity : 0.5,
				background : "black"
			},
			/**
			 * @function
			 * @description The close event
			 */
			close : function (event, ui) {
				$(this).dialog("destroy");
			}
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.validator
 */
(function (app, $) {

	var naPhone = /^\(?([2-9][0-8][0-9])\)?[\-\. ]?([2-9][0-9]{2})[\-\. ]?([0-9]{4})(\s*x[0-9]+)?$/,
		regex = {
			phone : {
				us : naPhone,
				ca : naPhone
			},
			postal : {
				us : /^\d{5}(-\d{4})?$/,
				ca : /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/,
				gb : /^GIR?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKS-UW])?[0-9][ABD-HJLNP-UW-Z]{2}$/
			},
			alpaNumaric : /[^0-9Xx*]/g,
			onlynumber	: /[^0-9]/g,
			// Start JIRA PREV-42 : Billing section: Validation issue for Email field. Changed Regular expression
			email : /^([\w\.\%\+\-\!\#\$\%\^\*])+\@(([\w\-])+\.)+([a-zA-Z0-9]{2,6})$/,
			// End JIRA PREV-42
			notCC : /^(?!(([0-9 -]){13,19})).*$/,
			model : /^$|\s+/
		},
		settings = {
			// global form validator settings
			errorClass : 'error',
			errorElement : 'span',
			onkeyup : false,
			onfocusout : function (element) {
				if(!this.checkable(element)) {
					this.element(element);
					$("#primary").find("form").each(function(){
						var form_id = $(this).attr("id");
						if(form_id == 'RegistrationFormtwo' || form_id =='RegistrationFormthree') {
							if(($(this).find('.form-row').find('input.error')).length>0){
								$(this).find('.success-fail-msg').addClass('hide');
							}
						}
					});
					if($(element).hasClass('login-postalcode')||$(element).hasClass('ssrpostalcode')){
						$this = $(element).next('span.error');
						if($this.length>=1){
							var err=true;
						}
						if($(element).val().indexOf('-')!= 5 && !($this).is(':visible')){
							$('span.error.wrongsize').remove();
							var error = '<span class="error wrongsize">Please enter valid zip code</span>';
							$(element).after(error);
							var err = true;
						}else if($(element).val().length > 5 && $(element).val().length<10 && !($this).is(':visible')){
							var error = '<span class="error wrongsize">Please enter valid zip code</span>';
							$('span.error.wrongsize').remove();
							$(element).after(error);
							var err=true;
						}else{
							if(err == undefined || !(err) || $('span.error').length>1)
							{
								$('span.error.wrongsize').remove();
								var err = false;
							}								
						}
					}
					if($(element).hasClass('marketoemail') && $(element).val().length != 0){
						$(element).closest('form').find('.success-fail-msg > span').fadeOut(500);
					}

					if($(element).hasClass('input-text-pw') && $('#RegistrationForm').length > 0){
						$(element).next('span.error').text($(element).closest('.form-row').attr('data-required-text'));
					}
				}
			},
			errorPlacement: function(error, element) {
				if($(element).hasClass('custom-select')){
					error.insertAfter($(element).next('.sbHolder'));
					$(element).next('.sbHolder').addClass('error');
				}else{
					$(element).closest('.form-row').find('span.error-message').remove();
					error.insertAfter($(element));
				}

				if($(element).hasClass('marketoemail')){
					error.insertAfter($(element).closest('.input-email-home'));
					if($(element).val().length != 0){
						$(element).closest('form').find('.success-fail-msg > span').fadeOut(500);
					}
				}

				if($(element).hasClass('input-text-pw') && $('#RegistrationForm').length > 0){
					$(element).next('span.error').text($(element).closest('.form-row').attr('data-required-text'));
				}

				var firstelement = $('.error:visible').filter('input,select,textarea').eq(0);
				if(!firstelement.hasClass('focused')){
					firstelement.addClass('focused');
					firstelement.focus();
					app.util.scrollBrowser(firstelement.offset().top - 100);
				}
			},
			onfocusin: function(element, event) {
				if($('#RegistrationForm').length > 0){
					$(element).closest('form').find('.input-text-pw.error').each(function(){
						$(this).next('span.error').text($(this).closest('.form-row').attr('data-required-text'));
					});
			    }
			}
		};
	/**
	 * @function
	 * @description Validates a given phone number against the countries phone regex
	 * @param {String} value The phone number which will be validated
	 * @param {String} el The input field
	 */
	function validatePhone(value, el) {
		value = value.replace(/\s/g, '');
		var country = $(el).closest("form").find(".country");
		if(country.length === 0 || country.val().length === 0 || !regex.phone[country.val().toLowerCase()]) {
			return true;
		}

		var rgx = regex.phone[country.val().toLowerCase()];
		var isOptional = this.optional(el);
		var isValid = rgx.test($.trim(value));

		return isOptional || isValid;
	}
	/**
	 * @function
	 * @description Validates a given email
	 * @param {String} value The email which will be validated
	 * @param {String} el The input field
	 */
	function validateEmail(value, el) {
		var isOptional = this.optional(el);
		var isValid = (regex.email.test($.trim(value)) && $.trim(value) == value );
		return isOptional || isValid;
	}
	/**
	 * @function
	 * @description Validates a given card number
	 * @param {String} value The card number which will be validated
	 * @param {String} el The input field
	 */
	function validateCardNumber(value, el) {
		var isOptional = this.optional(el);
		var isValid = !(regex.alpaNumaric.test($.trim(value)));
		return isOptional || isValid;
	}
 	/*Start JIRA PREV-77 : Zip code validation is not happening with respect to the State/Country. Added code regex.postal[country.val().toLowerCase()] to check zip based on country.*/
	function validateZip(value, el) {
		var country = $(el).closest("form").find(".country");
		if(country.length === 0 || country.val().length === 0 || !regex.postal[country.val().toLowerCase()]) {
			return true;
		}
		var isOptional = this.optional(el);
		var isValid = regex.postal[country.val().toLowerCase()].test($.trim(value));
		return isOptional || isValid;
	}

	function validateconfmail(value, el) {
		var orgemail = $(el).closest("form").find(".email-provided");

		var isOptional = this.optional(el);
		var isValid = true;
		if(orgemail.val() != value){
			isValid = false;
		}else{
			isValid = true;
		}
		return isOptional || isValid;
	}

	function validateModel(value, el) {
		var isOptional = this.optional(el);
		var isValid = !(regex.model.test($.trim(value)));
		return isOptional || isValid;
	}

	/**
	 * Text fields must have 'ccnumber' css class to be validated
	 */
	$.validator.addMethod("ccnumber", validateCardNumber, app.resources.INVALID_CARD_NUMBER);


	/**
	 * Add phone validation method to jQuery validation plugin.
	 * Text fields must have 'phone' css class to be validated as phone
	 */
	$.validator.addMethod("zip", validateZip, app.resources.INVALID_ZIP);
	/*End JIRA PREV-77 */
	$.validator.addMethod("confmail", validateconfmail, app.resources.CONFEMAIL);

	$.validator.addMethod("model", validateModel, app.resources.INVALID_MODEL);

 	/**
	 * @function
	 * @description Validates that a credit card owner is not a Credit card number
	 * @param {String} value The owner field which will be validated
	 * @param {String} el The input field
	 */
	function validateOwner(value, el) {
		var isValid = regex.notCC.test($.trim(value));
		return isValid;
	}



	function validatepobox(value, el) {
		var isValid = true;
		var isOptional = this.optional(el);
		var count = 0;
		if(value.length != 0 && app.user.poboxRegexMatcher.length != 0){
			var povalidValues = app.user.poboxRegexMatcher.split(",");
			var lowerAddress1 = value.toLowerCase();
			$.each(povalidValues, function(i,v){
				var lowerCamp = v.toLowerCase();
				//Temp fix for pobox
				if (lowerAddress1.indexOf(lowerCamp) == 0) {
					 isValid = false;
					 count++;
				 }
				 if(count > 0){
					 return false;
				 }
			});

		}
		return isOptional || isValid;
	}



    /**
	 * @function
	 * @description Validates a given CVN validation
	 * @param {String} value The zipcode field which will be validated
	 * @param {String} el The input field
	 */
	function validateCVN(value, el) {
		var cvn_minlength = 3;
        var cvn_maxlength = 3;
        var cvn_err_flag = false;
        var isValid = regex.onlynumber.test($(".ccvn").val());
        if($(".ctype").val() == '003'){
               cvn_maxlength = 4;
        }
        var cvn_length = $.trim($(".ccvn").val()).length;
        if(cvn_length > cvn_maxlength){
               cvn_err_flag = true;
        }
        if(cvn_err_flag == false && cvn_length > 0 && cvn_length < cvn_maxlength){
               cvn_err_flag = true;
        }
        if(cvn_err_flag){
        	return false;
        } else if(isValid){
        	return false;
        } else {
        	return true;
        }
	}

	/**
	 * Add email validation method to jQuery validation plugin.
	 * Text fields must have 'email' css class to be validated as email
	 */
	$.validator.addMethod("ccvn", validateCVN, app.resources.INVALID_CVN_NUMBER);

	/**
	 * Add phone validation method to jQuery validation plugin.
	 * Text fields must have 'phone' css class to be validated as phone
	 */
	$.validator.addMethod("phone", validatePhone, app.resources.INVALID_PHONE);

	/**
	 * Add email validation method to jQuery validation plugin.
	 * Text fields must have 'email' css class to be validated as email
	 */
	$.validator.addMethod("email", validateEmail, app.resources.INVALID_EMAIL);


	/**
	 * Add email validation method to jQuery validation plugin.
	 * Text fields must have 'marketoemail' css class to be validated as email
	 */
	$.validator.addMethod("marketoemail", validateEmail, app.resources.INVALID_marketo_EMAIL);


	/**
	 * Add email validation method to jQuery validation plugin.
	 * Text fields must have 'loginemail' css class to be validated as login email
	 */
	$.validator.addMethod("loginemail", validateEmail, app.resources.INVALID_LOGIN_EMAIL);

 	/**
	 * Add CCOwner validation method to jQuery validation plugin.
	 * Text fields must have 'owner' css class to be validated as not a credit card
	 */
	$.validator.addMethod("owner", validateOwner, app.resources.INVALID_OWNER);

	if(app.isDisablePOShipping){
		$.validator.addMethod("pobox_validation", validatepobox, app.resources.ADDRESS_POBOX_ERROR);
	}
	/**
	 * Add gift cert amount validation method to jQuery validation plugin.
	 * Text fields must have 'gift-cert-amont' css class to be validated
	 */
	$.validator.addMethod("gift-cert-amount", function(value, el){
		var isOptional = this.optional(el);
		var isValid = (!isNaN(value)) && (parseFloat(value)>=5) && (parseFloat(value)<=5000);
		return isOptional || isValid;
	}, app.resources.GIFT_CERT_AMOUNT_INVALID);

	/**
	 * Add positive number validation method to jQuery validation plugin.
	 * Text fields must have 'positivenumber' css class to be validated as positivenumber
	 */
	$.validator.addMethod("positivenumber", function (value, element) {
		if($.trim(value).length === 0) { return true; }
		return (!isNaN(value) && Number(value) >= 0);
	}, "");
	// "" should be replaced with error message if needed

	$.validator.messages.required = function ($1, ele, $3) {
		var requiredText = $(ele).parents('.form-row').attr('data-required-text');
		return requiredText||"";
	};

	/******* app.validator public object ********/
	app.validator = {
		regex : regex,
		settings : settings,
		init : function () {

			$("form:not(.suppress)").each(function () {
				$(this).validate(app.validator.settings);
			});

		},
		initForm : function(f) {
			$(f).validate(app.validator.settings);
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.ajax
 */
(function (app, $) {

	var currentRequests = [];
	// request cache

	// sub namespace app.ajax.* contains application specific ajax components
	app.ajax = {
		/**
		 * @function
		 * @description Ajax request to get json response
		 * @param {Boolean} async  Asynchronous or not
		 * @param {String} url URI for the request
		 * @param {Object} data Name/Value pair data request
		 * @param {Function} callback  Callback function to be called
		 */
		getJson : function (options) {
			options.url = app.util.toAbsoluteUrl(options.url);
			// return if no url exists or url matches a current request
			if(!options.url || currentRequests[options.url]) {
				return;
			}

			currentRequests[options.url] = true;

			// make the server call
			$.ajax({
				dataType : "json",
				url : options.url,
				async : (typeof options.async==="undefined" || options.async===null) ? true : options.async,
				data : options.data || {}
			})
			// success
			.done(function (response) {
				if(options.callback) {
					options.callback(response);
				}
			})
			// failed
			.fail(function (xhr, textStatus) {
				if(textStatus === "parsererror") {
					window.alert(app.resources.BAD_RESPONSE);
				}
				if(options.callback) {
					options.callback(null);
				}
			})
			// executed on success or fail
			.always(function () {
				// remove current request from hash
				if(currentRequests[options.url]) {
					delete currentRequests[options.url];
				}
			});
		},
		/**
		 * @function
		 * @description ajax request to load html response in a given container
		 * @param {String} url URI for the request
		 * @param {Object} data Name/Value pair data request
		 * @param {Function} callback  Callback function to be called
		 * @param {Object} target Selector or element that will receive content
		 */
		load : function (options) {
			options.url = app.util.toAbsoluteUrl(options.url);
			// return if no url exists or url matches a current request
			if(!options.url || currentRequests[options.url]) {
				return;
			}

			currentRequests[options.url] = true;

			// make the server call
			$.ajax({
				dataType : "html",
				type :options.type|| 'GET', //JIRA PREV-39 : CREDIT CARD Overlay: Overlay is transformed into page. Added type.
				url : app.util.appendParamToURL(options.url, "format", "ajax"),
				data : options.data
			})
			.done(function (response) {
				// success
				if(options.target) {
					$(options.target).empty().html(response);
				}
				if(options.callback) {
					options.callback(response);
				}

			})
			.fail(function (xhr, textStatus) {
				// failed
				if(textStatus === "parsererror") {
					window.alert(app.resources.BAD_RESPONSE);
				}
				options.callback(null, textStatus);
			})
			.always(function () {
				app.progress.hide();
				// remove current request from hash
				if(currentRequests[options.url]) {
					delete currentRequests[options.url];
				}
			});
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.searchsuggest
 */
(function (app, $) {
	var qlen = 0,
		listTotal = -1,
		listCurrent = -1,
		delay = 300,
		fieldDefault = null,
		suggestionsJson = null,
		$searchForm,
		$searchField,
		$searchContainer,
		$newresultscont,
		$resultsContainer;
	/**
	 * @function
	 * @description Handles keyboard's arrow keys
	 * @param keyCode Code of an arrow key to be handled
	 */
	function handleArrowKeys(keyCode) {
		switch (keyCode) {
			case 38:
				// keyUp
				listCurrent = (listCurrent <= 0) ? (listTotal - 1) : (listCurrent - 1);
				break;
			case 40:
				// keyDown
				listCurrent = (listCurrent >= listTotal - 1) ? 0 : listCurrent + 1;
				break;
			default:
				// reset
				listCurrent = -1;
				return false;
		}

		$resultsContainer.children().removeClass("selected").eq(listCurrent).addClass("selected");
		$searchField.val($resultsContainer.find(".selected div.suggestionterm").first().text());
		return true;
	}

	/******* app.searchsuggest public object ********/
	app.searchsuggest = {
		/**
		 * @function
		 * @description Configures parameters and required object instances
		 */
		init : function (container) {
			// initialize vars
			$searchContainer = $(container);
			$searchForm = $searchContainer.find("form");
			$searchField = $searchForm.find("input[type='text']");
			fieldDefault = $searchField.attr('data-placeholder');

			// disable browser auto complete
			$searchField.attr("autocomplete", "off");

			// on focus listener (clear default value)
			$searchField.focus(function () {
				$('.suggestions').hide();
				$newresultscont = $(this).closest($searchContainer).addClass('active');
				$searchForm = $newresultscont.find("form");
				$searchField = $newresultscont.find("input[type='text']");
				if($newresultscont.find('.suggestions').length == 0) {
					// create results container if needed
					$resultsContainer = $("<div/>").attr("class", "suggestions").appendTo($newresultscont).css({
						"top" : $newresultscont[0].offsetHeight,
						"right" : 0,
						"width" : $newresultscont[0].offsetWidth
					});
				}
				if($searchField.val() === fieldDefault) {
					$searchField.val("").removeClass('noKeyword');
				}
			});
			// on blur listener
			$searchField.blur(function () {
				setTimeout(app.searchsuggest.clearResults, 200);
			});
			// on key up listener
			$searchField.keyup(function (e) {

				// get keyCode (window.event is for IE)
				var keyCode = e.keyCode || window.event.keyCode;

				// check and treat up and down arrows
				if(handleArrowKeys(keyCode)) {
					return;
				}
				// check for an ENTER or ESC
				if(keyCode === 13 || keyCode === 27) {
					app.searchsuggest.clearResults();
					return;
				}

				var lastVal = $searchField.val();
				if(lastVal.length < 3){return false;}
				// if is text, call with delay
				setTimeout(function () { app.searchsuggest.suggest(lastVal); }, delay);
			});
			// on submit we do not submit the form, but change the window location
			// in order to avoid https to http warnings in the browser
			// only if it's not the default value and it's not empty
			$searchForm.submit(function (e) {
				e.preventDefault();
				//var searchTerm = $searchField.val();
				var searchTerm = $(this).find('input[type="text"]').val();
				if(searchTerm === $(this).find('input[type="text"]').attr('data-placeholder') || searchTerm === fieldDefault || searchTerm.length === 0) {
					return false;
				}

				window.location = app.util.appendParamToURL($(this).attr("action"), "q", searchTerm);
			});
		},

		/**
		 * @function
		 * @description trigger suggest action
		 * @param lastValue
		 */
		suggest : function (lastValue) {
			// get the field value
			var part = $searchField.val();

			// if it's empty clear the resuts box and return
			if(part.length === 0) {
				app.searchsuggest.clearResults();
				return;
			}

			// if part is not equal to the value from the initiated call,
			// or there were no results in the last call and the query length
			// is longer than the last query length, return
			// #TODO: improve this to look at the query value and length
			if((lastValue !== part) || (listTotal === 0 && part.length > qlen)) {
				return;
			}
			qlen = part.length;

			// build the request url
			var reqUrl = app.util.appendParamToURL(app.urls.searchsuggest, "q", part);
            reqUrl = app.util.appendParamToURL(reqUrl, "legacy", "true");

			// get remote data as JSON
			$.getJSON(reqUrl, function (data) {
				// get the total of results
				var suggestions = data,
					ansLength = suggestions.length,
					listTotal = ansLength;

				// if there are results populate the results div
				if(ansLength === 0) {
					app.searchsuggest.clearResults();
					return;
				}
				suggestionsJson = suggestions;
				var html = "";
				var i, len=ansLength;
				var rowclassname = "";
				for(i=0; i < len; i++) {
					if(i == 0){ rowclassname = "first"}
					else if(i == (len - 1)){rowclassname = "last"}
					else{rowclassname = "";}

					if(i == 0 && len == 1){ rowclassname = "singlerow"}
					html+='<div class="'+rowclassname+'"><div class="suggestionterm">'+suggestions[i].suggestion+'</div><span class="hits">'+suggestions[i].hits+'</span></div>';
				}

				// update the results div
				$newresultscont.find('.suggestions').html(html).show().on("hover", "div", function () {
					$(this).toggleClass = "selected";
				}).on("click", "div", function () {
					// on click copy suggestion to search field, hide the list and submit the search
					$searchField.val($(this).children(".suggestionterm").text());
					app.searchsuggest.clearResults();
					$searchForm.trigger("submit");
				});
			});
		},
		/**
		 * @function
		 * @description
		 */
		clearResults : function () {
			if (!$resultsContainer) { return; }
			$(".suggestions").empty().hide();
			$searchContainer.removeClass('active');
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.searchsuggestbeta
 */
(function (app, $) {
	var currentQuery = null,
	    lastQuery = null,
	    runningQuery = null,
        listTotal = -1,
		listCurrent = -1,
		delay = 30,
		fieldDefault = null,
		$searchForm,
		$searchField,
		$searchContainer,
		$resultsContainer;
	/**
	 * @function
	 * @description Handles keyboard's arrow keys
	 * @param keyCode Code of an arrow key to be handled
	 */
	function handleArrowKeys(keyCode) {
		switch (keyCode) {
			case 38:
				// keyUp
				listCurrent = (listCurrent <= 0) ? (listTotal - 1) : (listCurrent - 1);
				break;
			case 40:
				// keyDown
				listCurrent = (listCurrent >= listTotal - 1) ? 0 : listCurrent + 1;
				break;
			default:
				// reset
				listCurrent = -1;
				return false;
		}

		$resultsContainer.children().removeClass("selected").eq(listCurrent).addClass("selected");
		$searchField.val($resultsContainer.find(".selected div.suggestionterm").first().text());
		return true;
	}

	/******* app.searchsuggestBeta public object ********/
	app.searchsuggestbeta = {
		/**
		 * @function
		 * @description Configures parameters and required object instances
		 */
		init : function (container, defaultValue) {
			// initialize vars
			$searchContainer = $(container);
			$searchForm = $searchContainer.find("form[name='simpleSearch']");
			$searchField = $searchForm.find("input[name='q']");
			fieldDefault = defaultValue;

			// disable browser auto complete
			$searchField.attr("autocomplete", "off").addClass('noKeyword');

			// on focus listener (clear default value)
			$searchField.focus(function () {
				if(!$resultsContainer) {
					// create results container if needed
					$resultsContainer = $("<div/>").attr("id", "search-suggestions").appendTo($searchContainer);
				}
				if($searchField.val() === fieldDefault) {
					$searchField.val("").removeClass('noKeyword');
				}
			});
			// on blur listener
			$searchField.blur(function () {
				setTimeout(app.searchsuggestbeta.clearResults, 200);
			});
			// on key up listener
			$searchField.keyup(function (e) {

				// get keyCode (window.event is for IE)
				var keyCode = e.keyCode || window.event.keyCode;

				// check and treat up and down arrows
				if(handleArrowKeys(keyCode)) {
					return;
				}
				// check for an ENTER or ESC
				if(keyCode === 13 || keyCode === 27) {
					app.searchsuggestbeta.clearResults();
					return;
				}

				currentQuery = $searchField.val().trim();

                // no query currently running, init a update
                if (runningQuery == null)
                {
                    runningQuery = currentQuery;
                    setTimeout("app.searchsuggestbeta.suggest()", delay);
                }
			});
		},

        /**
		 * @function
		 * @description trigger suggest action
		 */
		suggest : function()
		{
		    // check whether query to execute (runningQuery) is still up to date and had not changed in the meanwhile
            // (we had a little delay)
            if (runningQuery !== currentQuery)
            {
                // update running query to the most recent search phrase
                runningQuery = currentQuery;
            }

            // if it's empty clear the results box and return
            if(runningQuery.length === 0) {
                app.searchsuggestbeta.clearResults();
                runningQuery = null;
                return;
            }

            // if the current search phrase is the same as for the last suggestion call, just return
            if (lastQuery === runningQuery)
            {
                runningQuery = null;
                return;
            }

            // build the request url
            var reqUrl = app.util.appendParamToURL(app.urls.searchsuggest, "q", runningQuery);
            reqUrl = app.util.appendParamToURL(reqUrl, "legacy", "false");

            // execute server call
            $.get(reqUrl, function (data)
            {

                var suggestionHTML = data,
                    ansLength = suggestionHTML.trim().length;

                // if there are results populate the results div
                if(ansLength === 0) {
                    app.searchsuggestbeta.clearResults();
                }
                else
                {
                    // update the results div
                    $resultsContainer.html(suggestionHTML).fadeIn(200);
                }

                // record the query that has been executed
                lastQuery = runningQuery;
                // reset currently running query
                runningQuery = null;

                // check for another required update (if current search phrase is different from just executed call)
                if (currentQuery !== lastQuery)
                {
                    // ... and execute immediately if search has changed while this server call was in transit
                    runningQuery = currentQuery;
                    setTimeout("app.searchsuggestbeta.suggest()", delay);
                }
                app.searchsuggestbeta.hideLeftPanel();
            });
		},
		/**
		 * @function
		 * @description
		 */
		clearResults : function () {
			if (!$resultsContainer) { return; }
			$resultsContainer.fadeOut(200, function() {$resultsContainer.empty()});
		},
		/**
		 * @function
		 * @description
		 */
		hideLeftPanel : function () {
			//hide left panel if there is only a matching suggested custom phrase
			if($('.search-suggestion-left-panel-hit').length == 1 && ($('.search-phrase-suggestion a').text().replace(/(^[\s]+|[\s]+$)/g, '').toUpperCase() == $('.search-suggestion-left-panel-hit a').text().toUpperCase())){
				$('.search-suggestion-left-panel').css('display','none');
				$('.search-suggestion-wrapper-full').addClass('search-suggestion-wrapper');
				$('.search-suggestion-wrapper').removeClass('search-suggestion-wrapper-full');
			}
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.searchplaceholder
 */
(function (app, $) {
	/**
	 * @private
	 * @function
	 * @description Binds event to the place holder (.blur)
	 */
	function initializeEvents() {
		//if($('.bottom-banner-cell.search-match-product').length>0){$('.bottom-banner-cell.search-match-product').syncHeight(); }
		/*  Start JIRA PREV-53:No search result page: When the search text field is
		 	empty,on clicking of "GO" button user is navigating to Home page.
		 	Replaced #q with 'input[name=q]'*/
		if($('#q').val() == ""){
			$('#q').val($('#q').attr("data-placeholder")).addClass('noKeyword');;
		}

		$('input[name=q]').focus(function () {
			/*End JIRA PREV-53 */
			var input = $(this);
			if (input.val() === input.attr("data-placeholder")) {
				input.val("").removeClass('noKeyword');
			}
		})
		.blur(function () {
			var input = $(this);
			/* Start JIRA PREV-53:No search result page: When the search text field is empty,on clicking of "GO"
			   button user is navigating to Home page.Added $.trim(input.val()) === ""*/
			if ($.trim(input.val()) === "" || input.val() === input.attr("placeholder")) {
				/*End JIRA PREV-53*/
				input.val(input.attr("data-placeholder")).addClass('noKeyword');
			}
		})
		.blur();
		/* Start JIRA-PREV-54:General Error page: When the new search field empty, on clicking of "GO" user is navigating to Home page.
		   Added condition for disabling search button in header and No search results page and error pages.
		   Start JIRA-PREV-53:No search result page: When the search text field is empty,on clicking of "GO" button user is navigating to Home page.*/
		$("input[name=q]").closest("form").submit(function(e){
			var input = $(this).find("input[name=q]");
			if($.trim(input.val()) === input.attr("placeholder") || $.trim(input.val()) === ""){
				e.preventDefault();
				return false;
	}
		});
		/*End JIRA PREV-53,PREV-54 */
	}

	/******* app.searchplaceholder public object ********/
	app.searchplaceholder = {
		/**
		 * @function
		 * @description Binds event to the place holder (.blur)
		 */
		init : function () {
			initializeEvents();
		}
	};
}(window.app = window.app || {}, jQuery));

/**
 * @class app.mulitcurrency
 */
(function (app, $) {
	/**
	 * @private
	 * @function
	 * @description Binds event to the place holder (.blur)
	 */
	function initializeEvents() {
		//listen to the drop down, and make a ajax call to mulitcurrency pipeline
		$('.currency-converter').on("change", function () {
 			// request results from server
 	 		app.ajax.getJson({
 	 		 	url: app.util.appendParamsToUrl(app.urls.currencyConverter , {format:"ajax",currencyMnemonic:$('select.currency-converter').val()}),
 	 		 	callback: function(data){
 	 				location.reload();
 	 		 	}// end ajax callback
 	 		 });
		});

		//hide the feature if user is in checkout
		if(app.page.title=="Checkout"){
			$('.mc-class').css('display','none');
		}

	}

	/******* app.mulitcurrency public object ********/
	app.mulitcurrency = {
		/**
		 * @function
		 * @description
		 */
		init : function () {
			initializeEvents();
		}
	};
}(window.app = window.app || {}, jQuery));



/**
 * @class app.uievents
 */
(function (app, $) {
	/**
	 * @private
	 * @function
	 * @description Binds event to the place holder (.blur)
	 */
	/******* app.uievents public object ********/
	app.uievents = {
		/**
		 * @function
		 * @description
		 */
		init : function ($con) {
			if($con == null){
				var $con = $('body');
			}

			//custom radio events
			$con.find('span.custom-radio').each(function(){
				var $check = $(this).find('input[type="radio"]');
				if($check.is(':checked')){ $(this).addClass('active');}else{$(this).removeClass('active');}
			});

			$con.find('span.custom-radio input[type="radio"]').unbind('change').on('change', function(){
				var $name = $(this).attr('name');
				if($name){
					$con.find('input[name="'+ $name +'"]').closest('.custom-radio').removeClass('active');
				}
				$(this).closest('.custom-radio').toggleClass('active');
			});

			//custom checkbox events
			$con.find('span.custom-checkbox').each(function(){
				var $check = $(this).find('input[type="checkbox"]');
				if($check.is(':checked')){
					$(this).addClass('active');
				}else{
					$(this).removeClass('active');
				}
			});

			$con.find('span.custom-checkbox input[type="checkbox"]').unbind('change').on('change', function(){
				if($(this).is(':checked')){
					$(this).closest('.custom-checkbox').addClass('active');
				}else{
					$(this).closest('.custom-checkbox').removeClass('active');
				}
			});

			//custom selectbox events
			if(!$('body').hasClass('panasonic_device')){
				$con.find('.custom-select').each(function(){
					if($(this).attr('disabled')){ $(this).selectbox('disable');}
					else{ $(this).selectbox();}
					$('.sbOptions li:last').addClass('last');
				}).focus(function(){
					//PANC-1109 $(this).next('.sbHolder').trigger('focus');
				}).on('change', function(){
				$(this).selectbox('detach');
					$(this).selectbox('attach');
				});
			}

			if($('.search-result-items').length > 0){
				$('.search-result-items').each(function(){
					var $currentlength = $(this).find('li.grid-tile').length;
					var $lastrowitems = 12 - $currentlength;
					if($lastrowitems === 0 || $currentlength%3 === 0){
						$(this).find('li.grid-tile').slice(0,$(this).find('li.grid-tile').length - 3).addClass('tile-border');
					}else{
						$(this).find('li.grid-tile').slice(0,$(this).find('li.grid-tile').length - $currentlength%3).addClass('tile-border');
					}
					$(this).find('li.grid-tile.new-row').next().addClass('middle-row');
				});
			}

			if($con.find('.product-thumbnails ul').length > 0 && $con.find('.product-thumbnails ul li').length > 3){
				setTimeout(function(){
					$con.find('.product-thumbnails ul').jcarousel({
						scroll : 1,
						itemFallbackDimension: '100%',
						buttonNextHTML: "<div>Next</div>",
						buttonPrevHTML: "<div>Prev</div>",
						itemVisibleInCallback : app.captureCarouselRecommendations,
						visible : 3
					});
				}, 1000);
			}

				/**phone number customization***/
				$con.find('input[name$="phone"]').each(function(){
					var phoneVal = $(this).val().replace(/[- ()\s]/gi, "");
					if($(this).closest('div').hasClass('form-row') && $(this).closest('.form-row').find('.custom-phone').length == 0){
						$(this).closest('div.form-row').addClass('customphone-row');
						$(this).before('<div class="custom-phone"><input type="text" maxlength="16" class="phone_alt"/></div>');
					}
					if(!phoneVal){return false;}
					$(this).closest('.customphone-row').find('.phone_alt').val(phoneVal);
					$(this).val($(".phone_alt").val().replace(/[- ()\s]/gi, ""));
				}).on('change', function(){
					var cur_val= $(this).val();
					if(cur_val.length == 0){
						return false;
					}else{
						$(this).closest('.customphone-row').find('.phone_alt').val(cur_val.substring(0, 3) +" - "+ cur_val.substring(3, 6) + " - " + cur_val.substring(6, 10));
					}
				});


				var cur_val= "",
				str1 = "",
				str2 = "",
				str3 = "";
				$(document).find('.phone_alt').on("keyup keydown", function(e){
					if(!e.ctrlKey){
						if (e.shiftKey || e.altKey) {
	        				e.preventDefault();
	            		} else {
	            			var key = e.keyCode;
	            			if (!((key == 8) || (key == 46) || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105))) {
	            				e.preventDefault();
		            		}
	            		}
					}

					var hyp_count = $(this).val().split(" - ").length - 1;
					 cur_val= $(this).val().replace(/[A-Za-z` ~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					 str1 = cur_val.substring(0, 3);
					 str2 = cur_val.substring(3, 6);
					 str3 = cur_val.substring(6, 10);
					if(cur_val.length == 4 && cur_val.indexOf(' - ') == -1){
						$(this).val(str1 + " - " + str2);
					}else if(cur_val.length == 7 && hyp_count == 1){
						$(this).val(str1 +" - "+ str2 + " - " + str3);
					}
					$(this).closest('.customphone-row').find('input[name$="phone"]').val($(".phone_alt").val().replace(/[- ()\s]/gi, ""));

				}).on('blur', function(){
					 cur_val= $(this).val().replace(/[A-Za-z` ~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					 if(cur_val.length == 0){
						 $(this).closest('.customphone-row').find('input[name$="phone"]').val($(".phone_alt").val().replace(/[- ()\s]/gi, ""));
						 $(this).closest('.customphone-row').find('input[name$="phone"]').trigger('blur');
						 return false;
					 }
					 str1 = cur_val.substring(0, 3);
					 str2 = cur_val.substring(3, 6);
					 str3 = cur_val.substring(6, 10);
					$(this).val(str1 +" - "+ str2 + " - " + str3);
					$(this).closest('.customphone-row').find('input[name$="phone"]').val($(".phone_alt").val().replace(/[- ()\s]/gi, ""));
					$(this).closest('.customphone-row').find('input[name$="phone"]').trigger('blur');
				});

				$con.find('.phone_alt').each(function(){
					 cur_val= $(this).val().replace(/[A-Za-z` ~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					 if(cur_val.length == 0){return false;}
					 str1 = cur_val.substring(0, 3);
					 str2 = cur_val.substring(3, 6);
					 str3 = cur_val.substring(6, 10);
					$(this).val(str1 +" - "+ str2 + " - " + str3);
					$(this).closest('.customphone-row').find('input[name$="phone"]').val($(".phone_alt").val().replace(/[- ()\s]/gi, ""));
				});
				
				/* Farhan's dev team PANC-1201 17/02/2016 12:45pm */
				$('.login-postalcode,.ssrpostalcode').keypress(function(e) {
	    	        var key = (e.charCode) ? e.which : event.keyCode
		            if(!((key>=48 && key<=57)||(key==45 && $(this).val().length==5 )))
	                 	e.preventDefault();
	                if($(this).val().length==5 &&key!=45){
	                	$(this).val($(this).val()+"-");
	                } 
                }); 
				$("#dwfrm_ordertrack_postalCode,.ssrpostalcode").bind("paste", function(e){
   					 var pastedData = e.originalEvent.clipboardData.getData('text');
    					var pattern = /^\d{1,5}(?:[-]\d{1,4})?$/;
    				if(!(pattern.test(pastedData))){
       					 e.preventDefault();
       				}
        			
				});
				/* End of PANC-1201 17/02/2016 12:45pm */


        

	/****************ends*********************/
			$con.find('.payment-method input[type="text"], .CreditCardCont input[type="text"]').each(function(){
				if($(this).closest('.form-row').find('.removeval').length == 0){
					$(this).closest('.form-row').prepend('<span class="removeval"></span>');
					if($(this).val().length > 0){
						$(this).closest('.form-row').find('.removeval').show();
					}else{
						$(this).closest('.form-row').find('.removeval').hide();
					}

				}
			});

			$con.find('.payment-method input[type="text"], .CreditCardCont input[type="text"]').on('keyup', function(){
				if($(this).val().length > 0){
					$(this).closest('.form-row').find('.removeval').show();
				}else{
					$(this).closest('.form-row').find('.removeval').hide();
				}
			});

			$con.find('.removeval').unbind('click').on('click', function(){
				$(this).closest('.form-row').find('input[type="text"],input[type="password"]').val('');
				$(this).closest('.form-row').find('.removeval').hide();
				$(this).closest('.form-row').find('.cardtypeimg > span').hide();
			});

			$con.find(".customphone-row input,input[name$='phone'], input[name$='cvn']").on('keypress keyup',function (e) {
				if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
					return false;
				}
			});
		}
	};
}(window.app = window.app || {}, jQuery));


/**
 * @class app.storeinventory
 */
(function (app, $) {

	var $cache = {};
	var pid = null;
	var currentTemplate = jQuery('#wrapper.pt_cart').length ? "cart" : "pdp";

	/******* app.storeinventory public object ********/
	app.storeinventory = {
		/**
		 * @function
		 * @description
		 */
	 	init : function(){
			app.storeinventory.initializeCache();
			app.storeinventory.initializeDom();
		},

	 	initializeCache : function () {
 			$cache = {
 				preferredStorePanel : jQuery('<div id="preferred-store-panel"/> '),
 				storeList : jQuery('<div class="store-list"/>')
 			};
 		},

  		initializeDom: function(){
  			// check for items that trigger dialog
  			jQuery('#cart-table .set-preferred-store').on('click', function(e){
  				e.preventDefault();
 				app.storeinventory.loadPreferredStorePanel(jQuery(this).parent().attr('id'));
  			});

  			//disable the radio button for home deliveries if the store inventory is out of stock
  			jQuery('#cart-table .item-delivery-options .home-delivery .not-available').each(function(){
  				jQuery(this).parents('.home-delivery').children('input').attr('disabled','disabled');
  			});


  			jQuery('body').on('click', '#pdpMain .set-preferred-store', function(e){
 				e.stopImmediatePropagation();
  				e.preventDefault();
 				app.storeinventory.loadPreferredStorePanel(jQuery(this).parent().attr('id'));
  			});

  			jQuery('.item-delivery-options input.radio-url').click(function(){
  				app.storeinventory.setLineItemStore(jQuery(this));
  			});

  			if(jQuery(".checkout-shipping").length > 0) app.storeinventory.shippingLoad();

  			//disable the cart button if there is pli set to instore and the status is 'Not Available' and it is marked as an instore pli
  			jQuery('.item-delivery-options').each(function(){
  				if((jQuery(this).children(".instore-delivery").children("input").attr('disabled')=='disabled')
  						&&  (jQuery(this).children('.instore-delivery').children('.selected-store-availability').children('.store-error').length > 0)
  							&& (jQuery(this).children(".instore-delivery").children("input").attr('checked')=='checked')
  				){
  					jQuery('.cart-action-checkout button').attr("disabled", "disabled");
  				}
  			});
 		},

		setLineItemStore: function(radio) {

			jQuery(radio).parent().parent().children().toggleClass('hide');
			jQuery(radio).parent().parent().toggleClass('loading');

			app.ajax.getJson({
				url: app.util.appendParamsToUrl(jQuery(radio).attr('data-url') , {storeid : jQuery(radio).siblings('.storeid').attr('value')}),
				callback: function(data){

					jQuery(radio).attr('checked','checked');
					jQuery(radio).parent().parent().toggleClass('loading');
					jQuery(radio).parent().parent().children().toggleClass('hide');

				}
			});

			//scan the plis to see if there are any that are not able to go through checkout, if none are found re-enable the checkout button
			var countplis = 0;
			jQuery('.item-delivery-options').each(function(){

  				if((jQuery(this).children(".instore-delivery").children("input").attr('disabled')=='disabled')
  						&&  (jQuery(this).children('.instore-delivery').children('.selected-store-availability').children('.store-error').length > 0)
  							&& (jQuery(this).children(".instore-delivery").children("input").attr('checked')=='checked')
  				){
  					jQuery('.cart-action-checkout button').attr("disabled", "disabled");
  				}else{
  					countplis++;
  				}
  			});
  			if(countplis > 0 && jQuery('.error-message').length == 0){
  				jQuery('.cart-action-checkout button').removeAttr("disabled", "disabled")

  			}


		},

 		buildStoreList: function(pid) {

 			// request results from server
 			app.ajax.getJson({
 				url: app.util.appendParamsToUrl(app.urls.storesInventory , {pid:pid, zipCode:app.user.zip}),
 				callback: function(data){

 					// clear any previous results, then build new
 					$cache.storeList.empty();
 					var listings = jQuery("<ul class='store-list'/>");
 					if(data && data.length > 0) {
 						for (var i=0; i < 10 && i < data.length; i++) {
 							var item=data[i];

 							//Disable button if there is no stock for item
 							if(item.statusclass == "store-in-stock"){
						    		var displayButton = '<button value="'+ item.storeId +'" class="button-style-1 select-store-button" data-stock-status="'+item.status+'">' + app.resources.SELECT_STORE + '</button>';
						    	}
						    	else
						    	{
						    		var displayButton = '<button value="'+ item.storeId +'" class="button-style-1 select-store-button" data-stock-status="'+item.status+'" disabled="disabled">' + app.resources.SELECT_STORE + '</button>';
						    	}

							// list item for cart
							if(currentTemplate === 'cart') {

								listings.append('<li class="store-' +item.storeId + item.status.replace(/ /g,'-') + ' store-tile">' +
							    		'<span class="store-tile-address ">' + item.address1 + ',</span>' +
								    	'<span class="store-tile-city ">' + item.city + '</span>' +
								    	'<span class="store-tile-state ">' + item.stateCode + '</span>' +
								    	'<span class="store-tile-postalCode ">' + item.postalCode + '</span>' +
								    	'<span class="store-tile-status ' + item.statusclass + '">' + item.status + '</span>' +
								    	displayButton +
								    	'</li>');
							}

							// list item for pdp
							else {
								listings.append('<li class="store-' +item.storeId +' ' + item.status.replace(/ /g,'-') + ' store-tile">' +
							    		'<span class="store-tile-address ">' + item.address1 + ',</span>' +
								    	'<span class="store-tile-city ">' + item.city + '</span>' +
								    	'<span class="store-tile-state ">' + item.stateCode + '</span>' +
								    	'<span class="store-tile-postalCode ">' + item.postalCode + '</span>' +
								    	'<span class="store-tile-status ' + item.statusclass + '">' + item.status + '</span>' +
								    	displayButton +
								    	'</li>');
							}
 						}
 					}

 					// no records
 					else {
 						if(app.user.zip){
 							$cache.storeList.append("<div class='no-results'>No Results</div>");
 						}
 					}

 					// set up pagination for results
 					var storeTileWidth = 176;
 					var numListings = listings.find('li').size();
 					var listingsNav = jQuery('<div id="listings-nav"/>');
 					for(var i = 0, link = 1; i <= numListings; i++){
 						if(numListings >  i) { listingsNav.append('<a data-index="'+ i +'">'+link+'</a>'); }
 					    	link++;
 					    	i = i + 2;
 					}
 					listingsNav.find('a').click(function(){
 						jQuery(this).siblings().removeClass('active');
 					    	jQuery(this).addClass('active');
 					    	jQuery('ul.store-list').animate({'left' : (storeTileWidth * jQuery(this).data('index') * -1) },1000);
 					}).first().addClass('active');
 					$cache.storeList.after(listingsNav);

 					// check for preferred store id, highlight, move to top
 					if(currentTemplate === 'cart'){
 					    var selectedButtonText = app.resources.SELECTED_STORE;
 					}
 					else {
 						var selectedButtonText = app.resources.PREFERRED_STORE;
 					}
 					listings.find('li.store-'+app.user.storeId).addClass('selected').find('button.select-store-button ').text(selectedButtonText);

 					app.storeinventory.bubbleStoreUp(listings,app.user.storeId);

 					// if there is a block to show results on page (pdp)
 					if( currentTemplate !== 'cart' ) {

 						var onPageList = listings.clone();
 					    	var thisDiv = jQuery('div#' + pid);

 					    	thisDiv.find('ul.store-list').remove();
 					    	thisDiv.append(onPageList);

 					    	if( onPageList.find('li').size() > 1 ){
 					    		thisDiv.find('li:gt(0)').each(function(){
 					    			jQuery(this).addClass('extended-list');
 					    		});
 					    		jQuery('.more-stores').remove();
 					    		thisDiv.after('<span class="more-stores">' + app.resources.SEE_MORE + '</span>');
 						    	thisDiv.parent().find('.more-stores').click(function(){
 						    		if( jQuery(this).text() ===  app.resources.SEE_MORE) {
 						    			jQuery(this).text(app.resources.SEE_LESS).addClass('active');
 						    		}
 						    		else {
 						    			jQuery(this).text(app.resources.SEE_MORE).removeClass('active');
 						    		}
 						    		thisDiv.find(' ul.store-list').toggleClass('expanded');

 						    	});
 					    	}

 					}

 					// update panel with new list
 					listings.width(numListings * storeTileWidth).appendTo($cache.storeList);

 					// set up 'set preferred store' action on new elements
 					listings.find('button.select-store-button').click(function(e){

 						var selectedStoreId = jQuery(this).val();

 						if(currentTemplate === 'cart') {

 							//update selected store and set the lineitem
 							var liuuid = jQuery('#preferred-store-panel').find('.srcitem').attr('value');
 							jQuery('div[name="'+liuuid+'-sp"] .selected-store-address').html(jQuery(this).siblings('.store-tile-address').text()+' <br />'+jQuery(this).siblings('.store-tile-city').text()+' , '+jQuery(this).siblings('.store-tile-state').text()+' '+jQuery(this).siblings('.store-tile-postalCode').text());
 							jQuery('div[name="'+liuuid+'-sp"] .storeid').val(jQuery(this).val());
 							jQuery('div[name="'+liuuid+'-sp"] .selected-store-availability').html(jQuery(this).siblings('.store-tile-status'));
 							jQuery('div[name="'+liuuid+'-sp"] .radio-url').removeAttr('disabled');
 							jQuery('div[name="'+liuuid+'-sp"] .radio-url').click();
 							$cache.preferredStorePanel.dialog("close");

 						}else{

	 						if( app.user.storeId !== selectedStoreId ) {

	 							// set as selected
	 							app.storeinventory.setPreferredStore(selectedStoreId);
	 							app.storeinventory.bubbleStoreUp (onPageList, selectedStoreId);
	 							jQuery('.store-list li.selected').removeClass('selected').find('button.select-store-button').text(app.resources.SELECT_STORE);
	 							jQuery('.store-list li.store-'+selectedStoreId+' button.select-store-button').text(app.resources.PREFERRED_STORE).parent().addClass('selected');
	 						}

 						}
						//if there is a dialog box open in the cart for editing a pli and the user selected a new store
						//add an event to for a page refresh on the cart page if the update button has not been clicked
						//reason - the pli has been updated but the update button was not clicked, leaving the cart visually in accurate.
						//when the update button is clicked it forces a refresh.
						if(jQuery('#cart-table').length > 0 && jQuery('.select-store-button').length > 0){
 							jQuery('.ui-dialog .ui-icon-closethick:first').bind( "click", function(){
 								window.location.reload();
 							});
						}

 					});

 				} // end ajax callback
 			});
 		},

 		bubbleStoreUp : function(list, id) {

 			var preferredEntry = list.find('li.store-'+id).clone();
 			preferredEntry.removeClass('extended-list');
 			list.find('.store-tile').not('extended-list').addClass('extended-list');
 			list.find('li.store-'+id).remove();
 			list.prepend(preferredEntry);

 		},

 		loadPreferredStorePanel : function(pid) {

			//clear error messages from other product tiles if they exists in the dom
 			if(jQuery('#preferred-store-panel div .error-message').length > 0){
 				jQuery('#preferred-store-panel div .error-message').remove();
 			}
 			// clear any previous results
 			$cache.preferredStorePanel.empty();

 			// show form if no zip set
 				if(app.user.zip === null || app.user.zip === "") {
 					$cache.preferredStorePanel
 						.append('<div><input type="text" id="userZip" class="entered-zip" placeholder="' + app.resources.ENTER_ZIP + '"/><button id="set-user-zip" class="button-style-1">' + app.resources.SEARCH + '</button></div>')
 							.find('#set-user-zip')
 								.click(function(){
 									var enteredZip = jQuery('.ui-dialog #preferred-store-panel input.entered-zip').last().val();
 									var regexObj = {
 											canada 		: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i ,
 											usa    		: /^\d{5}(-\d{4})?$/
 									};

 									var validZipEntry = false;

 									//check Canadian postal code
 									var regexp     = new RegExp(regexObj.canada);
 									if( regexp.test(enteredZip) ) {
 										validZipEntry = true;
 									}

 									//check us zip codes
 									var regexp     = new RegExp(regexObj.usa);
 									if( regexp.test(enteredZip) ) {
 										validZipEntry = true;
 									}

 									if( validZipEntry ) {
 										//good zip
 										jQuery('#preferred-store-panel div .error-message').remove();
 										app.storeinventory.setUserZip(enteredZip);
 										app.storeinventory.loadPreferredStorePanel(pid);
 									} else {
 										//bad zip
 										if(jQuery('#preferred-store-panel div .error-message').length == 0){
 											jQuery('#preferred-store-panel div').append('<div class="error-message">'+app.resources.INVALID_ZIP+'</div>');
 										}
 									}
 								});
 					$cache
 						.preferredStorePanel
 							.find('#userZip')
 								.keypress(function(e) {
 									code = e.keyCode ? e.keyCode : e.which;
 									if(code.toString() == 13) {
 										$cache.preferredStorePanel.find('#set-user-zip').trigger('click');
 									}
 					});

 					// clear any on-page results
 					jQuery('div.store-stock ul.store-list').remove();
 					jQuery('.availability .more-stores').remove();

 				}
 				// zip is set, build list
 				else {
 					app.storeinventory.buildStoreList(pid);
 					$cache
 						.preferredStorePanel
 						.append("<div>For " + app.user.zip + " <span class='update-location'>" + app.resources.CHANGE_LOCATION + "</span></div>" )
 						.append($cache.storeList);
 					$cache
 						.preferredStorePanel
 							.find('span.update-location')
 								.click(function(){
 									app.storeinventory.setUserZip(null);
 									app.storeinventory.loadPreferredStorePanel(pid);
 					});

 				}

 				// append close button for pdp
 				if(currentTemplate !== "cart") {
	 				if(app.user.storeId !== null) {
	 					$cache.preferredStorePanel.append("<button class='close button-style-1  set-preferred-store'>" + app.resources.CONTINUE_WITH_STORE + "</button>");
	 				}
	 				else if(app.user.zip !== null) {
	 					$cache.preferredStorePanel.append("<button class='close button-style-1'>" + app.resources.CONTINUE + "</button>");
	 				}
 				}else{
 					$cache.preferredStorePanel.append("<input type='hidden' class='srcitem' value='" + pid + "'>");
 				}

 				// open the dialog
 				$cache.preferredStorePanel.dialog({
 					width: 550,
 					modal: true,
 					title: app.resources.STORE_NEAR_YOU
 				});

 				// action for close/continue
 				jQuery('button.close').click(function(){
 					$cache.preferredStorePanel.dialog("close");
 				});

 				//remove the continue button if selecting a zipcode
 				if(app.user.zip === null || app.user.zip === "") {
 					jQuery('#preferred-store-panel .set-preferred-store').last().remove();
 				}

 	 			//disable continue button if a preferred store has not been selected
 	 			if($('.store-list .selected').length > 0){
 	 				$('#preferred-store-panel .close').attr('disabled', false);
 	 			}else{
 	 				$('#preferred-store-panel .close').attr('disabled', true);
 	 			}

 		},

 		setUserZip : function(zip) {

 			app.user.zip = zip;
 			jQuery.ajax({
 				type: "POST",
 				url: app.urls.setZipCode,
 				data: { zipCode : zip }
 			}).fail(function() {

 			});

 		},

 		setPreferredStore : function(id) {

 			app.user.storeId = id;
 			jQuery.post(app.urls.setPreferredStore, { storeId : id }, function(data) {
 				jQuery('.selected-store-availability').html(data);

 				//enable continue button when a preferred store has been selected
 		 		$('#preferred-store-panel .close').attr('disabled', false);
 			});

 		},

 		shippingLoad : function() {
 			$cache.checkoutForm = jQuery("form.address");
 			$cache.checkoutForm.off("click");
 			$cache.checkoutForm.on("click", ".is-gift-yes, .is-gift-no", function (e) {
 				jQuery(this).parent().siblings(".gift-message-text").toggle(jQuery(this).checked);
 			});
 			return null;
 		}

	};
}(window.app = window.app || {}, jQuery));


(function(app){

	function isMobile() {
		var mobileAgentHash = ["mobile","tablet","phone","ipad","ipod","android","blackberry","windows ce","opera mini","palm"];
		var	idx = 0;
		var isMobile = false;
		var userAgent = (navigator.userAgent).toLowerCase();

		while (mobileAgentHash[idx] && !isMobile) {
			isMobile = (userAgent.indexOf(mobileAgentHash[idx]) >= 0);
			idx++;
		}
		return isMobile;
	}

	app.isMobileUserAgent = isMobile();

	app.zoomViewerEnabled = !isMobile();

}(window.app = window.app || {}));

// jquery extensions
(function ($) {
	// params
	// toggleClass - required
	// triggerSelector - optional. the selector for the element that triggers the event handler. defaults to the child elements of the list.
	// eventName - optional. defaults to 'click'
	$.fn.toggledList = function (options) {
		if (!options.toggleClass) { return this; }

		var list = this;
		function handleToggle(e) {
			e.preventDefault();
			var classTarget = options.triggerSelector ? $(this).parent() : $(this);
			classTarget.toggleClass(options.toggleClass);
			// execute callback if exists
			if (options.callback) { options.callback(); }
		}

		return list.on(options.eventName || "click", options.triggerSelector || list.children(), handleToggle);
	};

	$.fn.syncHeight = function () {
		function sortHeight(a, b) {
			return $(a).height() - $(b).height();
		}

		var arr = $.makeArray(this);
		arr.sort(sortHeight);
		return this.height($(arr[arr.length-1]).height());
	};
}(jQuery));

// general extension functions
(function () {
	String.format = function() {
		var s = arguments[0];
		var i,len=arguments.length - 1;
		for (i = 0; i < len; i++) {
			var reg = new RegExp("\\{" + i + "\\}", "gm");
			s = s.replace(reg, arguments[i + 1]);
		}
		return s;
	};
})();

//initialize app
jQuery(document).ready(function () {
	app.init();
});

//app.dialogposition
(function (app, $) {
	var $cache = {};
	app.dialogposition = {
		init : function ($con) {
			if($con == null){
				$con = $('.ui-dialog');
			}
			//dialog position set
			if($('.ui-dialog').length == 1){
				var dialog_width = $('.ui-dialog').width();
				var dialog_height = $('.ui-dialog').height();
				var dialog_top = $('.ui-dialog').css('top');
				var window_width = $(window).width();
				var window_height = $(window).height();
				var dialog_style_left = (window_width - dialog_width)/2;
				var dialog_style_top = (window_height - dialog_height)/3;

				if(window_height < dialog_height){
					var dialog_style_top = '30px';
					$('.ui-widget-overlay').css({'position':'fixed'});
				}

				$('.ui-dialog').css('left', dialog_style_left);

				if(dialog_height > window_height){
					$(window).scrollTop($('.ui-dialog').offset().top);
				}

			}
			app.uievents.init();

		}
	};

}(window.app = window.app || {}, jQuery));

//app.validateAddress
(function (app, $) {
	var $cache = {};

	function initializeCache() {
		$cache.primary = $("#primary");
		$cache.checkoutForm = $cache.primary.find(".checkout-shipping.address");
		$cache.validatoionDialog = $cache.primary.find("#address-validation-dialog");
		$cache.byPassUPS = $cache.checkoutForm.find(".bypassUPS");
		$cache.address1 = $cache.checkoutForm.find("input[name$='_address1']");
		$cache.address2 = $cache.checkoutForm.find("input[name$='_address2']");
		$cache.city = $cache.checkoutForm.find("input[name$='_city']");
		$cache.stateCode = $cache.checkoutForm.find("select[id$='_state']");
		$cache.checkoutForm.find("select[id$='_country']").val("US");
		$cache.countryCode = $cache.checkoutForm.find("select[id$='_country']");
		$cache.postalCode = $cache.checkoutForm.find("input[name$='_postal']");
    }

	function initializeDom() {
		if($cache.validatoionDialog.length > 0){
			$cache.validatoionDialog.dialog({
				autoOpen : false,
				height : 'auto',
				width : 670,
				dialogClass : 'address-validation-dialog',
				resizable : false,
				position : 'center',
				modal : true,
				open: function() {
					initializeEvents();
				}
			});

			$cache.validatoionDialog.show().dialog("open");
		}
    }

	function initializeEvents() {

		$cache.validatoionDialog.on('click','#original-address-edit', function(e){
			$cache.validatoionDialog.dialog('close');
		});

		$cache.validatoionDialog.on('click','#ship-to-original-address', function(e){

			$cache.validatoionDialog.dialog('close');
			$cache.byPassUPS.attr('value','true');
			$('button.saveShipping').click();
		});

		$cache.validatoionDialog.on('click',"[id|='suggested-address-edit']", function(e){
			var selectedAddress = $(this).data("address").split("||");
			$cache.address1.val(selectedAddress[0]);
			if(selectedAddress[1] != 'undefined' && selectedAddress[1] != ''){
				$cache.address2.val(selectedAddress[1]);
			}
			$cache.city.val(selectedAddress[2]);
			$cache.stateCode.val(selectedAddress[3]);
			$cache.countryCode.val("US");
			$cache.postalCode.val(selectedAddress[5]);
			$cache.validatoionDialog.dialog('close');
		});

		$cache.validatoionDialog.on('click',"[id|='ship-to-address-selected']", function(e){
			var selectedAddress = $(this).data("address").split("||");
			$cache.address1.val(selectedAddress[0]);
			if(selectedAddress[1] != 'undefined' && selectedAddress[1]!= ''){
				$cache.address2.val(selectedAddress[1]);
			}
			$cache.city.val(selectedAddress[2]);
			$cache.stateCode.val(selectedAddress[3]);
			$cache.countryCode.val("US");
			$cache.postalCode.val(selectedAddress[5]);
			$cache.byPassUPS.attr('value','true');
			$cache.validatoionDialog.dialog('close');

			$('button.saveShipping').click();
		});
	}

	 app.validateAddress = {
        init: function() {
            initializeCache();
            initializeDom();
        }
	 };

}(window.app = window.app || {}, jQuery));

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function runBrowseraTest(){
	var click_selector = decodeURI(getUrlVars()['click']);
	if(click_selector != ''){
		click_selector = click_selector.replace(' eq ','=');
		if( $(click_selector).length>0){
			$(click_selector).trigger('click');
		}
	}
	var hover_selector = decodeURI(getUrlVars()['hover']);
	if(hover_selector != ''){
		hover_selector = hover_selector.replace(' eq ','=');
		if( $(hover_selector).length>0){
			$(hover_selector).trigger('mouseenter');
		}
	}
}

$(window).load(function(){
	if($.trim($('#divGigyaAchievements').text()).length == 0 && $('#divGigyaAchievements').length == 1){$('#divGigyaAchievements').hide();}
	if($.trim($('#divGigyaChallengeStatus').text()).length == 0 && $('#divGigyaChallengeStatus').length == 1){$('#divGigyaChallengeStatus').hide();}
	if($.trim($('#divGigyaLeaderboard').text()).length == 0 && $('#divGigyaLeaderboard').length == 1){$('#divGigyaLeaderboard').hide();}

	// Listrak recommendations
	if($("#carousel-recomendations").length > 0 && $('#enableListrakRecom').val()){
		var MerchandiseBlockUID = $('#MerchandiseBlockUID').val();
		var skuId = $('#ltkSkuId').val();
		var type = $('#ltkEventType').val();
		var prodCategory = $('#ltkProdCategory').val();
		var json = {"activities": [{ "Sku": skuId, "Type": type, "Subcategory":prodCategory}],"additionalFields": ["Category"],"optionalConditions": { "Subcategory": prodCategory }};
		var currentcont = "";
		if($('#profileEmail').val()){
			/* Farhans Dev Team : 30/03/2-16 11:00PM PANC-1797 */
			_ltk.MerchandiseBlock.Email = $('#profileEmail').val().toLowerCase();
			/* PANC-1797 END */
		}
		_ltk.MerchandiseBlock.GetRecommendations(MerchandiseBlockUID, json,
		function (recommendations) {
				for (var i = 0; i < recommendations.length; i++) {
					var rec = recommendations[i];
					if(currentcont.length == 0){
						currentcont = "<li><div class='product-tile'><div class='product-image recommendation_image'><a href='"+ rec.LinkUrl +"'><img src='"+ rec.ImageUrl +"' alt='"+ rec.Title +"' title='"+ rec.Title +"'/></a></div><div class='product-name'><a href='"+ rec.LinkUrl +"'>"+ rec.Title +"</a></div><div class='product-price'>$"+ rec.Price +"</div></div></li>"
					}else{
						currentcont = currentcont + "<li><div class='product-tile'><div class='product-image recommendation_image'><a href='"+ rec.LinkUrl +"'><img src='"+ rec.ImageUrl +"' alt='"+ rec.Title +"' title='"+ rec.Title +"'/></a></div><div class='product-name'><a href='"+ rec.LinkUrl +"'>"+ rec.Title +"</a></div><div class='product-price'>$"+ rec.Price +"</div></div></li>"

					}
				}
				$("#carousel-recomendations").html(currentcont);
				$("#carousel-recomendations").jcarousel(app.components.carouselSettings);
		});
	}

	if($(".cart-recent-views .product-tile").length > 0){
		$(".cart-recent-views .product-tile").syncHeight();
	}

	if($('.ccnumber').length > 0 && $('.ccnumber').val().length > 0){
		$('.ccnumber').trigger('blur');
	}
});

// Return Policy Logic PANC-447 self service returns

$(document).on('click','.visually-hidden1',function(e){
	
	
	e.preventDefault();
	if($('input[name="dwfrm_returnpolicy_returncheckbox"]').is(':checked')){
		var products=[];
		var showError = false;
		var showErrorReason = false;
		var showErrorRbox = false;
		var showErrorRparts = false;
		$('.reasonCodeError').hide();
		$('.boxCodeError').hide();
		$('.partsCodeError').hide();
		$('input[name="dwfrm_returnpolicy_returncheckbox"]:checked').each(function() {
					
			var product={};			
			var reason = $(this).closest(".order-row-holder").find(".return_res select").val();
			var rbox = $(this).closest(".order-row-holder").find(".product-box-return input:checked").val();
			var rparts = $(this).closest(".order-row-holder").find(".return-parts input:checked").val();
			var rqty = $(this).closest(".order-row-holder").find(".priceDetails input").val();		
			var productId = $(this).closest(".order-row-holder").find(".productId input").val();
			var productPrice = $(this).closest(".order-row-holder").find(".productPrice input").val();
			var salePrice = $(this).closest(".order-row-holder").find(".salePrice input").val();
			
			if(!((reason != undefined && reason.length > 0) && (rbox != undefined && rbox.length > 0) && (rparts != undefined && rparts.length > 0))){
				showError = true;
			}
			
			if(!(reason != undefined && reason.length > 0)){
				showErrorReason = true;
				if(!($('.reasonCodeError').is(':visible'))){
					$('.reasonCodeError').show();
				}
			}
			
			if(!(rbox != undefined && rbox.length > 0)){
				showErrorRbox = true;
				if(!($('.boxCodeError').is(':visible'))){
					$('.boxCodeError').show();
				}			
			}
			
			if(!(rparts != undefined && rparts.length > 0)){
				showErrorRparts = true;
				if(!($('.partsCodeError').is(':visible'))){
					$('.partsCodeError').show();
				}
			}
			
			product.ProductId=productId;
			product.Reason=reason;
			product.Rbox=rbox;
			product.Rparts=rparts;
			product.Rqty=rqty;
			product.Price=productPrice;
			product.SalePrice=salePrice;
			products.push(product);
			
		});
		var grossPrice = $(this).siblings('#grossPrice').val();
		var ordID = $(this).siblings('#orderId').val();
		var jsonString = JSON.stringify(products);
		
		var url = app.util.appendParamsToUrl(app.urls.returnPolicy, {'Products' : jsonString});
		url =  app.util.appendParamsToUrl(url, {'orderID' : ordID});
		url =  app.util.appendParamsToUrl(url, {'GrossPrice' : grossPrice});
		if(!(showError)){
			window.location.assign(url);
		}
		else{
			
			
		}
	}else return false;
	
});	 

$(document).ready(function(){
	$(".ccnumber").focusin(function(){
	    $('.pt_checkout .paymentmethodsCont .form-caption').remove();
	}); 
});