(function( $, window, undefined ) {

var document = window.document,
	navigator = window.navigator,
	location = window.location;

var pageCache, pageContext;

var amp = (function(amp) {
	
	var initDomCache = function () {
		
		return {
			mainContainer : $('#main-container')
		};
	};
	
	
	var _amp =  {
		init : function () {
			
			pageCache = initDomCache();
			
			pageContext = pageCache.mainContainer.data('page-context');
			amp.page.setContext(pageContext);
			
			var ns = amp.page.ns;
			if (ns && amp[ns] && typeof amp[ns].init === 'function') {
				amp[ns].init();
			}
		}
	};
	
	return $.extend(amp, _amp);
	
})(window.amp = window.amp || {});

amp.ugc = (function() {
	
	var initViewersDialog = function (selectedStream) {
		
		var data = {
			'streamId' : selectedStream.attr('value')
		};
		
		$.ajax({
			method: 'POST',
			data: data,
			url: amp.urls.ampGetUGCViewers

		}).success(function (data) {
			createViewersDialog(data, selectedStream);
		});
		
	};

	var createViewersDialog = function (data, selectedStream) {
		
		var dialogButtons,
			dialogData = $(data),
			availableViewers = dialogData.find('.available-viewer');
		
		if (availableViewers.length > 0) {
			dialogButtons = [{
		    	text : 'OK',
		    	click : function () {
		    		
		    		var selectedViewer = $(this).find('input[type=radio]:checked');
		    		if ( selectedViewer.length == 0 ) {
						createAlertDialog(amp.resources.SELECT_VIEWER_MSG);
						return false;
					};
					
					selectedStream.data('viewer-id', selectedViewer.attr('value'));
					importStream(selectedStream, $(this));

		    	}
		    }];
		} else {
			dialogButtons = [{
		    	text : 'Close',
		    	click : function () {
		    		$( this ).dialog( 'close' );
		    	}
		    }];
		}
		
		dialogData.dialog({
			dialogClass : "viewers-dialog amp-dialog",
			modal : true,
			resizable : false,
			title : amp.resources.UGC_VIEWERC_DIALOG_TITLE,
			width : 500,
			buttons : dialogButtons
		});
		
	};
	
	var importStream = function (stream, dialogObj) {
		
		var data = {
			'streamId' 		   : stream.attr('value'),
			'streamName'	   : stream.data('stream-name'),
			'viewerId' 		   : stream.data('viewer-id')
		};

		$.ajax({
			method: "POST",
			data: data,
			url: amp.urls.ampImportStream

		}).done(function(data) {
			
			var objData = $.parseJSON( data ), message;
			
			if (objData['streamImported'] == true) {	
				message = amp.resources.IMPORTED_STREAM_MSG;
			} else {
				message = amp.resources.ERROR_IMPORT_STREAM_MSG;
			};
				
			dialogObj.dialog('option', 'buttons', [{
				text : 'Close',
		    	click : function () {
		    		dialogObj.dialog( 'close' );
		    		location.replace(amp.urls.ampUGCImportedStreams);
		    	}
			}]);
			
			dialogObj.find('.available-viewer').each(function () {
				$(this).hide('slow');
			}).promise().done(function () {
				dialogObj.find('tr.message-row')
					.find('.message-container').text(message)
					.end().show('slow');
			});
			
		});
	};
	
	var deleteStreams = function (streams) {
		
		var arr = $.map(streams, function (stream) {
			return $(stream).data('imported-stream-id');
		});
		
		var data = {
			'importedStreamIds' : arr.join(',')
		};
		
		$(".amp-module-body").addClass("loading");
		
		$.ajax({
			method: "POST",
			data: data,
			url: amp.urls.ampDeleteStream

		}).done(function(data) {
			
			$(".amp-module-body").removeClass("loading");
			
			var objData = $.parseJSON( data );
			if (objData['assetsDelete'] == true) {
				
				streams.each(function () {
					$(this).closest('tr').hide('slow');
				});
				
				document.location.reload(true);
				
			} else {
				
				alert(amp.resources.ERROR_DELETE_IMPORTED_STREAM_MSG);
				
			};
		});
	};
	
	var initEditDialog = function (selectedStream) {
		
		var data = {
			'streamId' : selectedStream.attr('value')
		};

		$.ajax({
			method: "POST",
			data: data,
			url: amp.urls.ampEditStream

		}).success(function (data) {
			createEditDialog(data);
		});
		
	};
	
	var createEditDialog = function (data) {
		
		$('body').css('overflow', 'hidden');
		
		var	dialogWidth = $(window).width(),
			dialogHeight = $(window).height();
		
		$.ui.dialog.prototype._focusTabbable = function(){};
		
		$(data).dialog({
			dialogClass : "edit-stream-dialog amp-dialog",
			modal : true,
			resizable : false,
			draggable : false,
			title : amp.resources.UGC_EDIT_STREAM_DIALOG_TITLE,
			autoOpen : true,
			width : dialogWidth - 6,
			height : dialogHeight,
			position: { my: "center top", at: "center top", of: window },
			close : function (e) {
				$('body').css('overflow', 'auto');
			}
		});
		
	};
	
	var createConfirmDialog = function (message, callback, param) {
		
		$('<div>').addClass('confirm-container').text(message).dialog({
			dialogClass : "edit-stream-dialog amp-dialog",
			modal : true,
			resizable : false,
			width : 500,
			buttons : [{
		    	text : 'OK',
		    	click : function () {
		    		callback(param);
		    		$(this).dialog('close');
		    	}
		    },
		    {
		    	text : 'Cancel',
		    	click : function () {
		    		$(this).dialog('close');
		    	}
		    }]
		});
	};
	
	var createAlertDialog = function (message) {
		
		$('<div>').addClass('confirm-container').text(message).dialog({
			dialogClass : "edit-stream-dialog amp-dialog",
			modal : true,
			resizable : false,
			width : 500,
			buttons : [{
		    	text : 'OK',
		    	click : function () {
		    		$(this).dialog('close');
		    	}
		    }]
		});
	};
	
	return {
		init : function () {
			
			$('button.streams-import').click(function (e) {
				e.preventDefault();
				
				var selectedStream = $('.available-streams-form input[type=radio]:checked');
				if ( selectedStream.length == 0 ) {
					createAlertDialog(amp.resources.SELECT_STREAM_MSG);
					return false;
				};
				
				initViewersDialog(selectedStream);
				
				return false;
				
			});
			
			$('button.streams-refresh').click(function (e) {
				e.preventDefault();
				
				document.location.reload(true);
				
				return false;
			});
			
			$('button.streams-delete').click(function (e) {
				e.preventDefault();
				
				var selectedStreams = $('.imported-streams-form input[type=checkbox]:checked');
				if ( selectedStreams.length == 0 ) {
					createAlertDialog(amp.resources.SELECT_STREAM_MSG);
					return false;
				};
				
				createConfirmDialog(amp.resources.CONFIRM_STREAM_DELETE_MSG, deleteStreams, selectedStreams);
				
				return false;
				
			});
			
			$('button.streams-edit').click(function (e) {
				e.preventDefault();
				
				var selectedStream = $('.available-streams-form input[type=radio]:checked');
				if ( selectedStream.length == 0 ) {
					createAlertDialog(amp.resources.SELECT_STREAM_MSG);
					return false;
				};
				
				initEditDialog(selectedStream);
				
				return false;
			});
			
			$('button.offline-streams-delete').click(function (e) {
				e.preventDefault();
				
				var selectedStreams = $('.offline-streams-list input[type=checkbox]:checked');
				if ( selectedStreams.length == 0 ) {
					createAlertDialog(amp.resources.SELECT_STREAM_MSG);
					return false;
				};
				
				createConfirmDialog(amp.resources.CONFIRM_STREAM_DELETE_MSG, deleteStreams, selectedStreams);
				
				return false;
				
			});
			
			$('a.select-all-streams').click(function (e) {
				e.preventDefault();
				var selectAllButton = $(this),
					tableContainer = selectAllButton.closest('table');
				
				if (selectAllButton.text() == amp.resources.SELECT_ALL) {
					
					$(tableContainer).find('input[type=checkbox]').prop( 'checked', true );
					selectAllButton.text(amp.resources.CLEAR_ALL);
					
				} else { // clear all
					
					$(tableContainer).find('input[type=checkbox]').prop( 'checked', false );
					selectAllButton.text(amp.resources.SELECT_ALL);
				}
			});
			
			amp.components.initThumbPreviewDialog();
			
		}
	};
})();


amp.components = {
	
	initThumbPreviewDialog : function () {
		$('.thumb-img').mouseover(function(event) {
			
			var img = $('<img />').attr('src', $(this).attr('src'));

			jQuery('<div/>', {
			    id: 'preview-dialog',
			}).append(img)
			  .appendTo($(this).parent());
			
        }).mouseout(function() {

        	$( "div#preview-dialog" ).remove();
        	
        });
		
	}

};


amp.page = {
	setContext : function (context) {
		$.extend(amp.page, context);
	}
}


amp.utils = {
	// Helper function for namespace initialization.
	initNamespace : function (ns, obj) {
		if (ns && obj[ns] && typeof obj[ns].init === 'function') {
			obj[ns].init();
		}
	},

	dlgGroupNameValidation : function() {
		
		if ($('.create-group-name').val().length == 0) {
			
			$('.create-group-name').addClass("dlg-field-error");
			
		} else {
			
			$('.create-group-name').removeClass("dlg-field-error");
		}
	},
	
	dlgGroupDescriptionValidation : function() {
		
		if ($('.create-group-description').val().length == 0) {
			
			$('.create-group-description').addClass("dlg-field-error");
			
		} else {
			
			$('.create-group-description').removeClass("dlg-field-error");
		}
	}
}

amp.im = (function() {
	
	return {
		init : function () {
			
			amp.components.initThumbPreviewDialog();
			
			$('.import-area').click(function(){
				
				var selectedAreaCheckboxes = $('input[name=area-id]:checked');
				
				if ( selectedAreaCheckboxes.length == 0 ) {
					
					alert(amp.resources.SELECT_AREA_MSG);
					return false;
				}

				var data = {};
				data.selectedAreas = [];
				var selectedAreaNames = new Array();
	
				$(selectedAreaCheckboxes).each(function(){
					var areaData = {
							areaid 		    : $(this).val(),
							name   		    : $(this).data('name'),
							width  		     : $(this).data('width'),
							height 		   	 : $(this).data('height'),
							associatedmodule : $(this).data('associatedmodule'),
							backgroundcolor : $(this).data('backgroundcolor')
					};
					
					data.selectedAreas.push(areaData);
					
					selectedAreaNames.push($(this).data('name'));
				});
				
				$(".amp-module-body").addClass("loading");
				
				$.ajax({
					type : "POST",
					dataType : "json",
					cache	: false,
					contentType : "application/json",
					url : amp.urls.ampImportArea,
					data : JSON.stringify(data)
				}).done(function(data) {
					
					if (data['areasImported'] == 'true') {

						$(selectedAreaCheckboxes).closest("tr").hide("slow");

						$.ajax({
				    	    url: amp.urls.ampGetImportedIMAreas,
				    	    context: document.body,
				    	    data: data,
				    	    success: function(s,x){
				    	    	
				    	    	var message = (selectedAreaNames.length == 1) ?
										  amp.resources.THE_MODULE + ' ' + selectedAreaNames[0] + ' ' + amp.resources.HAS_BEEN_IMPORTED
										: amp.resources.THE_MODULES + ' ' + selectedAreaNames.join(', ') + ' ' + amp.resources.HAVE_BEEN_IMPORTED;
				    	    	
								var dialogContent = $('<div>' + message + '</div>');
										  
				    	    	dialog = $(dialogContent).dialog({
							        title: amp.resources.AREA_IMPORT,
							        height: 200,
							        width: 400,
							        dialogClass: 'dlg-notification',
							        modal: true,
							        buttons: {
							        	"OK" : function() {
							        				$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
							        				window.amp.init();
							        				
							        				dialog.dialog( "close" );
							        				
							        				$(".amp-module-body").removeClass("loading");
									     	   }
							        },
							        close : function (e) {
							        	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
				        				window.amp.init();
				        				
				        				dialog.dialog( "close" );
				        				
				        				$(".amp-module-body").removeClass("loading");
									}
							    });


				    	    }
				    	});
						
					} else {
						
						$(".amp-module-body").removeClass("loading");
						
						alert(amp.resources.ERROR_IMPORT_AREA_MSG);
					}
				});

				return false;
			});
			
			$('.delete-imported-area').click(function(){

				var selectedContentAssets = $('input[name=selected-asset-id]:checked');
				
				if ( selectedContentAssets.length == 0 ) {
					
					alert(amp.resources.SELECT_AREA_TO_DELETE_MSG);
					return false;
				}
				
				var associatedgroupids = $('table.imported-streams-table').data('associatedgroupids');
				var associatedgroupnames = $('table.imported-streams-table').data('associatedgroupnames');
				var noassociatedgroups = $('table.imported-streams-table').data('noassociatedgroups');

				var message = noassociatedgroups ? amp.resources.CONFIRM_AREA_DELETE_MSG
							: amp.resources.CONFIRM_AREA_DELETE_MSG + '<br /><br />'
							  + amp.resources.ASSOCIATED_GROUPS_MSG + ':'
							  + associatedgroupnames;
							  
				var dialogContent = $('<div id="confirm-delete-im-areas">' + message + '</div>');
				
				var notificationDialog = $(dialogContent).dialog({
				        title: amp.resources.CONFIRM_DELETE_AREAS,
				        height: 300,
				        width: 450,
				        dialogClass: 'dlg-notification',
				        modal: true,
				        buttons: {
				        	"OK" : function() {
				        		
					        		var arr = $.map( selectedContentAssets, function( asset, i ) {
										  return ( $(asset).val() );
										});
	
									var data = {
											'assetids' 		   : arr.join(','),
											'associatedgroupids' : associatedgroupids,
									};
									
									var orderby = $('table.imported-streams-table').data('orderby');

									$(".amp-module-body").addClass("loading");
									
									notificationDialog.dialog( "close" );

									$.ajax({
										method: "POST",
										data: data,
										url: amp.urls.ampDeleteImportedIMAreas
	
										}).done(function(data) {
											
											var objData = $.parseJSON( data );
											
											if (objData['assetsDeleted'] == 'true') {
		
												selectedContentAssets.closest("tr").hide("slow");
		
												$.ajax({
										    	    url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderby,
										    	    context: document.body,
										    	    data: data,
										    	    success: function(s,x){
										    	    	
										    	    	var message = noassociatedgroups ?
										    	    			amp.resources.AREAS_DELETE_MSG : amp.resources.AREAS_GROUPS_DELETE_MSG;
										    	    	
														var dialogContent = $('<div>' + message + '</div>');
																  
										    	    	dialog = $(dialogContent).dialog({
													        title: amp.resources.IMPORTED_AREAS_DELETED,
													        height: 250,
													        width: 350,
													        dialogClass: 'dlg-notification',
													        modal: true,
													        buttons: {
													        	"OK" : function() {
													        				$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
													        				window.amp.init();
													        				
													        				dialog.dialog( "close" );
													        				
													        				$(".amp-module-body").removeClass("loading");
															     	   }
													        },
													        close : function (e) {
													        	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
										        				window.amp.init();
										        				
										        				dialog.dialog( "close" );
										        				
										        				$(".amp-module-body").removeClass("loading");
															}
													    });
										    	    }
										    	});
												
											} else {
												
												$(".amp-module-body").removeClass("loading");
												
												alert(amp.resources.ERROR_DELETE_IMPORTED_AREA_MSG);
											}
									});
								
						     	},
						    "Cancel" : function() {
				        		
						    	notificationDialog.dialog( "close" );
				        				
						     	}
				        },
				        close : function (e) {
				        	notificationDialog.dialog( "close" );
						}
				});
				
				return false;
			});

			$('.group-imported-area').click(function(){
				
				// get Content Assets IDs to Group
				var selectedContentAssets = $('input[name=selected-asset-id]:checked');
				
				if ( selectedContentAssets.length == 0 ) {
					
					alert(amp.resources.SELECT_AREAS_TO_GROUP_MSG);
					return false;
				}
				
				var assetIdsArr = $.map( selectedContentAssets, function( asset, i ) {
					  return ( $(asset).val() );
					});

				// Display dialog to Get new Group Name and Description
				var dialog, form = $('<form id="create-group-form" />');

				form.append('<label for="name" class="create-group-label">' + amp.resources.GROUP_NAME + ':</label>');
				form.append('<input type="text" name="name" id="name" class="text ui-widget-content ui-corner-all create-group-name" onkeyup="amp.utils.dlgGroupNameValidation()" />');
				form.append('<br />');
				form.append('<label for="name" class="create-group-label">' + amp.resources.GROUP_DESCRIPTION + ':</label>');
				form.append('<textarea name="description" id="description" class="text ui-widget-content ui-corner-all create-group-description" onkeyup="amp.utils.dlgGroupDescriptionValidation()" />');
				
				dialog = $(form).dialog({
			        title: amp.resources.CREATE_GROUP,
			        height: 350,
			        width: 350,
			        modal: true,
			        buttons: {
			        	"Create Group" : function() {
			        		
			        		var groupName = $('input.create-group-name').val();
			        		if ( groupName.length == 0 ) {
			        			
			        			$('input.create-group-name').addClass( "dlg-field-error" );
			        		}
			        		
			        		var groupDescription = $('textarea.create-group-description').val();
			        		if ( groupDescription.length == 0 ) {
			        			
			        			$('textarea.create-group-description').addClass( "dlg-field-error" );
			        		}
			        		
			        		if (groupName.length == 0 || groupDescription.length == 0) {
			        			return;
			        		}
			        		
			        		var data = {
									'assetids' 		   : assetIdsArr.join(','),
									'groupName'		   : groupName,
									'groupDescription' : groupDescription
							};
			        		
			        		dialog.dialog( "close" );
			        		
			        		$(".amp-module-body").addClass("loading");

			        		$.ajax({
								method: "POST",
								data: data,
								url: amp.urls.ampGroupImportedIMAreas
				
							}).done(function(data) {
								
								var objData = $.parseJSON( data );
								
								if (objData['areasGroupImported'] == 'true') {
									
									$.ajax({
							    	    url: amp.urls.ampGetGroupedIMAreas + '?orderby=creationdatedesc',
							    	    context: document.body,
							    	    data: data,
							    	    success: function(s,x){
							    	        
							    	    	var message = amp.resources.THE_GROUP + " '" 
							    	    		+ groupName + "' " + amp.resources.HAS_BEEN_CREATED;

											var dialogContent = $('<div>' + message + '</div>');
													  
							    	    	var notificationDialog = $(dialogContent).dialog({
										        title: amp.resources.GROUP_CREATED,
										        height: 250,
										        width: 350,
										        dialogClass: 'dlg-notification',
										        modal: true,
										        buttons: {
										        	"OK" : function() {								        		
												        		$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
										        				window.amp.init();
										        				
										        				notificationDialog.dialog( "close" );
										        				
										        				$(".amp-module-body").removeClass("loading");
												     	   }
										        },
										        close : function (e) {
										        	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
							        				window.amp.init();
							        				
							        				notificationDialog.dialog( "close" );
							        				
							        				$(".amp-module-body").removeClass("loading");
												}
										    });
							    	    }
							    	});
									
								} else {
									
									$(".amp-module-body").removeClass("loading");
									
									alert(amp.resources.ERROR_DELETE_IMPORTED_AREA_MSG);
								}
							});
			          },
			          	"Cancel" : function() {
			          		
			            dialog.dialog( "close" );
			          }
			        }
			      });
				
				return false;
			});
			
			$(".imported-streams-table input[name=asset-id]").change(function() {
			    if(this.checked) {
			    	
			    	var arr = new Array();
			    	$("input[name=selected-asset-id]").each(function(){
			    		arr.push( $(this).val() );
			    	});
			    	
			    	arr.push( $(this).val() );
			    	
			    	var data = {
						  'selectedAreaIDs' : arr.join(','),
						  'selectedAreaID'	: $(this).val()
					};
			    	
			    	var orderby = $('table.imported-streams-table').data('orderby');

			    	$(".amp-module-body").addClass("loading");
			    	
			    	$.ajax({
			    	    url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderby,
			    	    context: document.body,
			    	    data: data,
			    	    success: function(s,x){
			    	    	
			    	    	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
			    	    	window.amp.init();
			    	    	
			    	    	$(".amp-module-body").removeClass("loading");
			    	    }
			    	});
			    }
			});
			
			$("input[name=selected-asset-id]").change(function() {
			    if (!this.checked) {
			    	
			    	var areaIDtoExclude = $(this).val();
			    	
			    	var arr = new Array();
			    	$("input[name=selected-asset-id]").each(function(){
			    		if ( $(this).val() != areaIDtoExclude ) {
			    			arr.push( $(this).val() );
			    		}
			    	});
			    	
			    	var orderby = $('table.imported-streams-table').data('orderby');
			    	
			    	var data = {
						  'selectedAreaIDs' : arr.join(','),
						  'orderby'			: orderby
					};

			    	$(".amp-module-body").addClass("loading");
			    	
			    	$.ajax({
			    	    url: amp.urls.ampGetImportedIMAreas,
			    	    context: document.body,
			    	    data: data,
			    	    success: function(s,x){
			    	    	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
			    	    	window.amp.init();
			    	    	
			    	    	$(".amp-module-body").removeClass("loading");
			    	    }
			    	});
			    }
			});

			$('.ungroup-area').click(function(){
		
				var selectedContentAssets = $('input[name=asset-id]:checked');
				if ( selectedContentAssets.length == 0 ) {
					
					alert(amp.resources.SELECT_AREA_TO_UNGROUP_MSG);
					return false;
				}
				
				var dialogContent = $('<div id="confirm-delete-im-areas">' + amp.resources.CONFIRM_AREA_UNGROUP_MSG + '</div>');
				
				var notificationDialog = $(dialogContent).dialog({
			        title: amp.resources.CONFIRM_DELETE_GROUPS,
			        height: 250,
			        width: 350,
			        dialogClass: 'dlg-notification',
			        modal: true,
			        buttons: {
			        	"OK" : function() {
			        		
				        		var arr = $.map( selectedContentAssets, function( asset, i ) {
									  return ( $(asset).val() );
									});
	
								var data = {
										'assetids' 		   : arr.join(',')
								};
								
								$(".amp-module-body").addClass("loading");
								
								notificationDialog.dialog( "close" );
	
								$.ajax({
									method: "POST",
									data: data,
									url: amp.urls.ampDeleteGroupedIMAreas
	
								}).done(function(data) {
	
									var objData = $.parseJSON( data );
									
									if (objData['assetsDeleted'] == 'true') {
										
										$.ajax({
								    	    url: amp.urls.ampGetGroupedIMAreas,
								    	    context: document.body,
								    	    data: data,
								    	    success: function(s,x){
								    	    	
												var dialogContent = $('<div>' + amp.resources.GROUPS_DELETED_MSG + '</div>');
														  
								    	    	dialog = $(dialogContent).dialog({
											        title: amp.resources.GROUPS_DELETED,
											        height: 250,
											        width: 350,
											        dialogClass: 'dlg-notification',
											        modal: true,
											        buttons: {
											        	"OK" : function() {

											        				$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
											        				window.amp.init();
											        				
											        				dialog.dialog( "close" );
											        				
											        				$(".amp-module-body").removeClass("loading");
													     	   }
											        },
											        close : function (e) {
											        	
											        	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
											        	window.amp.init();
											        	
											        	dialog.dialog( "close" );
											        	
											        	$(".amp-module-body").removeClass("loading");
													}
											    });
								    	    }
								    	});
										
									} else {
										
										$(".amp-module-body").removeClass("loading");
										
										alert(amp.resources.ERROR_UNGROUP_IMPORTED_AREA_MSG);
									}
								});
					     	},
					    "Cancel" : function() {
			        		
					    	notificationDialog.dialog( "close" );
			        				
					     	}
			        },
			        close : function (e) {
			        	notificationDialog.dialog( "close" );
					}
				});

				return false;
			});
			
			$('.delete-offline-area').click(function(){

				if ( confirm(amp.resources.CONFIRM_AREA_DELETE_MSG) ) {
					
					var orderby = $('table.imported-streams-table').data('orderby');

					var data = {
							'assetids' : $(this).data('areasids'),
							'associatedgroupids' : '',
							'orderby' : orderby
					};
					
					$(".amp-module-body").addClass("loading");

					$.ajax({
						method: "POST",
						data: data,
						url: amp.urls.ampDeleteImportedIMAreas

					}).done(function(data) {
						
						var objData = $.parseJSON( data );
						
						if (objData['assetsDeleted'] == 'true') {
							
							$("div.offline-areas").hide("slow");

							$.ajax({
					    	    url: amp.urls.ampGetImportedIMAreas,
					    	    context: document.body,
					    	    data: data,
					    	    success: function(s,x){
					    	    	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
					    	    	window.amp.init();
					    	    	
					    	    	$(".amp-module-body").removeClass("loading");
					    	    }
					    	});
							
						} else {
							
							$(".amp-module-body").removeClass("loading");
							
							alert(amp.resources.ERROR_DELETE_IMPORTED_AREA_MSG);
						}
					});
				}
				
				return false;
			});
			
			$('.update-imported-area').click(function(){
				
				var selectedAreasForUpdate = $('li.area-for-update');
				
				var data = {};
				data.selectedAreas = [];
	
				$(selectedAreasForUpdate).each(function(){
					var areaData = {
							areaid 		     : $(this).data('areaid'),
							name   		     : $(this).data('name'),
							width  		     : $(this).data('width'),
							height 		   	 : $(this).data('height'),
							associatedmodule : $(this).data('associatedmodule')
					};
					
					data.selectedAreas.push(areaData);	
				});
				
				$(".amp-module-body").addClass("loading");
				
				$.ajax({
					type : "POST",
					dataType : "json",
					cache	: false,
					contentType : "application/json",
					url : amp.urls.ampImportArea,
					data : JSON.stringify(data)
				}).done(function(data) {
					
					if (data['areasImported'] == 'true') {

						$('div.needupdates-areas').hide("slow");
						
						var orderby = $('table.imported-streams-table').data('orderby');

						$.ajax({
				    	    url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderby,
				    	    context: document.body,
				    	    data: data,
				    	    success: function(s,x){
				    	    	$('div.amp-module-container').html($(s).find('div.amp-module-container').html());
				    	    	window.amp.init();
				    	    	
				    	    	$(".amp-module-body").removeClass("loading");
				    	    }
				    	});
						
					} else {
						
						$(".amp-module-body").removeClass("loading");
						
						alert(amp.resources.ERROR_IMPORT_AREA_MSG);
					}
				});

				return false;
			});
			
			function listener(event){
				
				// check if the message is to close edit area dlg
				if (event.data == "close-edit-area-dlg") {
					
					$('div.edit-im-wrapper').closest('.ui-dialog-content').dialog('close');
				}
			}

			if (window.addEventListener){

				addEventListener("message", listener, false);
			
			} else {
			
				attachEvent("onmessage", listener);
			}
			
			$('button.edit-area').click(function (e) {
				e.preventDefault();
				
				var selectedAreaCheckboxes = $('input[name=area-id]:checked');
				
				if ( selectedAreaCheckboxes.length == 0 ) {
					
					alert(amp.resources.SELECT_AREA_TO_EDIT_MSG);
					return false;
				}
				
				var areaId = selectedAreaCheckboxes.first().val();
				
				var editAreaURL = amp.urls.ampEditIMAreaURLPattern.replace('{areaid}', areaId);
				
				var dialogDiv = $('<div class="edit-im-wrapper" />'); 
				var imFrame = $('<iframe id="edit-im-area" allowfullscreen="true" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" />').attr('src', editAreaURL);

				dialogDiv.append(imFrame);
				
				$('body').css('overflow', 'hidden');
				
				var	dialogWidth = $(window).width(),
				dialogHeight = $(window).height();

				$.ui.dialog.prototype._focusTabbable = function(){};
				
				dialogDiv.dialog({
					dialogClass : "edit-stream-dialog amp-dialog",
					modal : true,
					resizable : false,
					title : amp.resources.EDIT_IM_AREA_MSG,
					width : dialogWidth - 6,
					height : dialogHeight,
					position: { my: "center top", at: "center top", of: window },
					close : function (e) {
						$('body').css('overflow', 'auto');
					}
				});

				return false;
			});
			
			$('a.select-all-available-areas').click(function (e) {
				e.preventDefault();
				
				if ($(this).text() == amp.resources.SELECT_ALL) {
					
					$('input[name=area-id]').prop( "checked", true );
					$(this).text(amp.resources.CLEAR_ALL);
					
				} else { // clear all
					
					$('input[name=area-id]').prop( "checked", false );
					$(this).text(amp.resources.SELECT_ALL);
				}
				
				var selectedAreasCheckboxes = $('.available-streams-table input[name=area-id]:checked');	
				if (selectedAreasCheckboxes.length == 0) {
					
					$('button.import-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.import-area').removeAttr("disabled");
				}
				
				var selectedAreaCheckboxes = $('input[name=area-id]:checked');		
				if (selectedAreaCheckboxes.length != 1) {
					
					$('button.edit-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.edit-area').removeAttr("disabled");
				}
			});

			$('a.select-all-grouped-areas').click(function (e) {
				e.preventDefault();
				
				if ($(this).text() == amp.resources.SELECT_ALL) {
					
					$('input[name=asset-id]').prop( "checked", true );
					$(this).text(amp.resources.CLEAR_ALL);
					
				} else { // clear all
					
					$('input[name=asset-id]').prop( "checked", false );
					$(this).text(amp.resources.SELECT_ALL);
				}
				
				// update Group button availability
				var selectedAssetCheckboxes = $('.grouped-streams-table input[name=asset-id]:checked');
				
				if (selectedAssetCheckboxes.length == 0) {
					
					$('button.ungroup-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.ungroup-area').removeAttr("disabled");
				}
			});
			
			$(".available-streams-table input[name=area-id]").change(function() {

				var selectedAreaCheckboxes = $('input[name=area-id]:checked');
				
				if (selectedAreaCheckboxes.length != 1) {
					
					$('button.edit-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.edit-area').removeAttr("disabled");
				}
			});
			
			$(".grouped-streams-table input[name=asset-id]").change(function() {
				
				var selectedAssetCheckboxes = $('.grouped-streams-table input[name=asset-id]:checked');
				
				if (selectedAssetCheckboxes.length == 0) {
					
					$('button.ungroup-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.ungroup-area').removeAttr("disabled");
				}
			});
			
			
			$(".available-streams-table input[name=area-id]").change(function() {
				
				var selectedAreasCheckboxes = $('.available-streams-table input[name=area-id]:checked');
				
				if (selectedAreasCheckboxes.length == 0) {
					
					$('button.import-area').attr("disabled", "disabled");
					
				} else {
					
					$('button.import-area').removeAttr("disabled");
				}
			});
			
			$("a#order-by-creation-date").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'creationdateasc' : 'creationdatedesc';
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetGroupedIMAreas + '?orderby=' + orderParameter,
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});
			
			$("a#order-by-group-name").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'groupnameasc' : 'groupnamedesc';
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetGroupedIMAreas + '?orderby=' + orderParameter,
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});

			$("a#order-by-im-name").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'nameasc' : 'namedesc';
				var arr = new Array();
		    	$("input[name=selected-asset-id]").each(function(){
		    		arr.push( $(this).val() );
		    	});
		    	arr.push( $(this).val() );
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderParameter + '&selectedAreaIDs=' + arr.join(','),
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});
			
			$("a#order-by-im-publisheddate").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'publisheddateasc' : 'publisheddatedesc';
				var arr = new Array();
		    	$("input[name=selected-asset-id]").each(function(){
		    		arr.push( $(this).val() );
		    	});
		    	arr.push( $(this).val() );
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderParameter + '&selectedAreaIDs=' + arr.join(','),
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});
			
			$("a#order-by-im-module-name").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'modulenameasc' : 'modulenamedesc';
				var arr = new Array();
		    	$("input[name=selected-asset-id]").each(function(){
		    		arr.push( $(this).val() );
		    	});
		    	arr.push( $(this).val() );
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderParameter + '&selectedAreaIDs=' + arr.join(','),
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});

			$("a#order-by-im-width").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'widthasc' : 'widthdesc';
				var arr = new Array();
		    	$("input[name=selected-asset-id]").each(function(){
		    		arr.push( $(this).val() );
		    	});
		    	arr.push( $(this).val() );
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderParameter + '&selectedAreaIDs=' + arr.join(','),
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});
			
			$("a#order-by-im-height").click(function (e) {
				e.preventDefault();
				
				var orderParameter = $(this).hasClass('amp-orderby-desc') ? 'heightasc' : 'heightdesc';
				
				var arr = new Array();
		    	$("input[name=selected-asset-id]").each(function(){
		    		arr.push( $(this).val() );
		    	});
		    	arr.push( $(this).val() );
								
				$(".amp-module-body").addClass("loading");

				$.ajax({ type: "GET",
						 url: amp.urls.ampGetImportedIMAreas + '?orderby=' + orderParameter + '&selectedAreaIDs=' + arr.join(','),
						 success: function(data) {
							 
							 $('div.amp-module-container').html($(data).find('div.amp-module-container').html());
							   window.amp.init();

							   $(".amp-module-body").removeClass("loading");
						 }
					   });
			});
			
		}
	};
})();

})(jQuery, window);

jQuery(window.amp.init());