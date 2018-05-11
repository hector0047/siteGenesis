/* PANC-1272  Farhan's Dev team 24-sep-2015 12:40am IST */
var rrConfigData = {};
		rrConfigData.productId = $(".configdataproductId").val();
		rrConfigData.doShowContent = function(json) {
		var  reviewscript = $(".bvRRShowReviewsTabJavascript").val();
		};
		jQuery(document).ready(function(){
			app.bvconfig.init();
		});
		//app.bvconfig
		(function (app, $) {
			var $cache = {};
			app.bvconfig = {
				init : function () {
					$BV.ui("rr", "show_reviews", rrConfigData);
					app.product.reviewsimg();
				}
			};

		}(window.app = window.app || {}, jQuery));
