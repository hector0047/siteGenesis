(function (app, $) {
	 app.squareTrade = {
			 
			 init : function () {
				 
					st_resale.defaults = {
						    warrantySelectHandlerName:    'onWarrantySelect',
						    templateRenderedHandlerName:  'onWarrantyTemplateRendered',
						    basePath: $('.configFilename-path').attr('href'),
						    configFilename: 'stwidgetconfig.js'
						};
						
						st_resale.displayTable = {
						    '2A': '2-Year Protection Plan',
						    '3A': '3-Year Protection Plan',
						    '4A': '4-Year Protection Plan',
						    '2AE': '2-Year Protection Plan PLUS Drops & Spills Coverage',
						    '3AE': '3-Year Protection Plan PLUS Drops & Spills Coverage',
						    '4AE': '4-Year Protection Plan PLUS Drops & Spills Coverage'
						};
						
						window.onWarrantySelect = function(productID, warrantyPrice, warrantyDescription) {
							    if (productID) {
							        jQuery(".product-warranty").val(productID);
							    } else {
							        jQuery(".product-warranty").val("");
							    }
						}
						
						st_resale.createProductPageWidget({
						    itemCondition: 'New',
						    itemCategory: $('#product-content').find('.product-category').val(),
						    itemPrice: $('#product-content').find('.price-sales').attr('warrantyprice'),
						    container: '.squaretrade_resale_pp'
						});	
						
			 }
		 
	 };
}(window.app = window.app || {}, jQuery));