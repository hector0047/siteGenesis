'use strict';

var ajax = require('./ajax'),
	util = require('./util'),
	dialog = require('./dialog'),
	product = require('./pages/product'),
	minicart = require('./minicart'),
	quickview = require('./quickview'),
	_ = require('lodash'),
	imagesLoaded = require('imagesloaded'),
	TPromise = require('promise');

var ecommBridge = {
	capability : {
		/* 
		 * This boolean indicates that the e-commerce site
		 * has access to a quick view panel. In demandware
		 * this cannot be detected so should be specified via 
		 * a site preference which can default to true.
		 */
		hasQuickView : true,

		/* 
		 * this boolean indicates that the e-commerce site
		 * has user wish list keeping. In demandware this 
		 * cannot be detected so should be specified via 
		 * a site preference which can default to true.
 		 */
		hasWishList : true,


		/* 
		 * this boolean indicates that the e-commerce site
		 * is transactional. In demandware this cannot be 
		 * detected so should be specified via a site preference
		 * which can default to true.
		 */
		isTransactional : true
	},

	interaction : {
		/* 
		 * launching a quick view for a given product. The identifier
		 * could be SKU or SKU+Variant. Each E-Commerce platform
		 * may support a different set of product identifiers.
		 */
		launchQuickview : function(pid) {
			var dialog = quickview.show({url: Urls.getProductUrl + "?pid=" + $.trim(pid), source: "quickview"});
		},

		/* 
		 * Add a given product to basket. The identifier could be 
		 * SKU or SKU+Variant. Each E-Commerce platform may
		 * support a different set of product identifiers. Quantity
		 * defaults to 1 if not specified. The callback is invoked 
		 * with a success or error response.
		 */
		addToBasket : function (data, callback, skipMiniCartDisplay) {
			var pid 	 = data["id"],
				quantity = ~~data["quantity"] > 0 ? data["quantity"] : 1;

			$.ajax({
				type: 'POST',
				url:  util.ajaxUrl(Urls.addProduct),
				data: {
						pid: pid,
						cartAction : 'add',
						Quantity: quantity
				}
			})
			.done(function(data) {
				
				if ( typeof skipMiniCartDisplay === 'undefined' || !skipMiniCartDisplay ) {
					
					minicart.show(data);
				}
                
                if ( typeof callback == 'function' ) {
					return callback.apply(ecommBridge);
				}
            });
		},

		/* 
		 * Add a given product to the wish list. The identifier
		 * could be SKU or SKU+Variant. Each E-Commerce 
		 * platform may support a different set of product 
		 * identifiers. Quantity defaults to 1 if not specified. 
		 * The callback is invoked with a success or error response.
		 */
		addToWishList : function(data) {
			var pid 	 = data["id"],
				quantity = ~~data["quantity"] > 0 ? data["quantity"] : 1,
				url 	 = util.appendParamToURL(Urls.WishlistAdd, "pid", $.trim(pid));
				
			window.location.href = url;
		},
		
		actions : function (action, params, module) {
			switch (action) {
				case "quickview":
					// expected data $quickview(SKU)$
					window.ecommBridge.interaction.launchQuickview($.trim(params))
					break;
				case "addToCart":
					// expected data $addToCart(SKU)$ or $addToCart(SKU,quantity:int)$ 
					var splitParams = window.ecommBridge.interaction.CSVToArray(params);
					var quantity = 1;
					if (splitParams.length > 1) {
						quantity = $.trim(splitParams[1]);
					}
					window.ecommBridge.interaction.addToBasket({'id' : $.trim(splitParams[0]), 'quantity' : quantity });
					break;
				case "addToWishlis":
					// expected data $addToWishlis(SKU)$
					var splitParams = window.ecommBridge.interaction.CSVToArray(params);
					var quantity = 1;
					if (splitParams.length > 1) {
						quantity = $.trim(splitParams[1]);
					}
					window.ecommBridge.interaction.addToWishList({'id' : $.trim(splitParams[0]), 'quantity' : quantity });
					break;
				case "shopthelook":
					var productIDs = $.trim(params).split(',');
					
					for (var i = 0; i < productIDs.length; ++i) {
						
						var productId = $.trim(productIDs[i]);
						
						var skipMiniCartDisplay = (i != productIDs.length - 1);
						window.ecommBridge.interaction.addToBasket({'id' : productId, 'quantity' : 1 }, null, skipMiniCartDisplay);
					}
					break;
				default:
					console.log("Unknown action");
			}
		},
		
		CSVToArray : function (str) {
		    var arr = [];
		    var quote = false;
		    var col = 0;
		    var c = 0;
		    for (c = 0; c < str.length; c++) {
		        var cc = str[c], nc = str[c+1];
		        arr[col] = arr[col] || '';
		        
		        if (cc == '"' && quote && nc == '"') { arr[col] += cc; ++c; continue; }
		        if (cc == '"') { quote = !quote; continue; }
		        if (cc == ',' && !quote) { ++col; continue; }
		        if (cc == '\n' && !quote) { col = 0; continue; }
		        
		        arr[col] += cc;
		    }
		    return arr;
		}
	},

	site : {
		/* 
		 * Get URL can be given a standard page type from the table 
		 * above along with a associated parameter (optional) and 
		 * it returns a fully qualified URL to that page or returns 
		 * an error in the callback if this is not a supported type
		 * or type, parameter combination.
		 */
		getUrl : function(data) {
			var arg  = data["parameter"],
				urlObj = urlMap[data["type"]];
			
			if ( urlObj ) {
				if (urlObj.parameter) {
					return util.appendParamToURL(urlObj.url, urlObj.parameter, arg);
				}
				
				return urlObj.url;
			}
		},

		/* 
		 * we use ISO 3166-1 alpha-2 for country codes and ISO 639-1
		 * for language codes. They are combined together in a way
		 * consistent with the HTTP 1.1 RFC. Aka lang-country, lang on its own.
		 */
		locale : 'default',
		currency : {
			code : '',
			prefix : '',
			suffix : ''
		},

		page : {},

		getProduct : function(data, callback) {

			var productId = data["id"],
				productData;

			$.ajax({
				type: 'GET',
				url:  util.appendParamToURL( ecommBridge.site.getUrl({type: "product", parameter: productId}), 'format', 'amp-json'),
				async: false,
				success: function( res ) {
					productData = res;
				}
			})
			.done(function(data) {
				
                if ( typeof callback == 'function' ) {
					return callback.apply(ecommBridge);
				}
            });
			
			return $.parseJSON( productData );
		},

		/* 
		 * The event below is invoked when the user chooses a variant
		 * on a PDP (Color change). The parameter for the callback 
		 * includes the new product identifier and the media set name.
		 * The site.page data does not update when this event is called.
		 */
		bind : function(eventName, callback) {
			if (eventName == "productChanged") {
				$(window).bind("productChanged", function(event, error, value) {
					if (typeof callback == 'function') {
						callback.call(ecommBridge, error, value);
					}
				});
			}
		}
	},
	
	user : {
		name : ''		
	}
};

module.exports = ecommBridge;