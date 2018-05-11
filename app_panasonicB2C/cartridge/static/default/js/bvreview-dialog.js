/*PANC-1272 Farhan's Dev team 22-sep-2015 11:20am IST */

$(window).load(function(){
			if($(".flLeft").length >0){
			  var src = $(".flLeft").attr("src");
			  var titleimage = '<img src="' + src + '" class="flLeft"/>'; 
			}
	        $(document).on('click', 'a.ui-corner-all', function(){
	            $("#cboxOverlay").css({"display":"none","opacity":"0"});
	        });
	        
	        $("#ReviewsSubmissionContainerWrapper").dialog({
	            height: 600,
	            width: 950,
	            modal: true,
	            autoFocus: false,
	            position: ['center','5%'],
	            resizable: false,
	            draggable: false,
	            zIndex: 9999,
	            close: function(event, ui) {$("#BVSubmissionContainer").html('');
	                $("#cboxOverlay").css({"display":"none","opacity":"0"});
	                $('body').removeAttr("style");
	 
	            },
	            open : function(event, ui) {
	            	if($(".ui-dialog-title .flLeft").length == 0) {
		            	$(".ui-dialog-title").append(titleimage);
	            	}
	            }
	        });
	 
	 
	        $("#ReviewsSubmissionContainerWrapper").dialog('close');
	 
	    });
	 
	    $BV.configure('global', {
	        allowSamePageSubmission: true,
	        doShowSubmission: doShow,
	        onSubmissionReturn: onReturn,
	        submissionLoadingTimeout: 30000,
	        doScrollSubmission: onScrollSubmit
	    });
	 
	    function onScrollSubmit(){
	   		$('#ReviewsSubmissionContainerWrapper').scrollTop(0)
	        return false;
	    }
	 
	    function doShow() {
	        $("#cboxOverlay").css({"display":"block","opacity":"0.5"});
	        $('#ReviewsSubmissionContainerWrapper').dialog('open');
	        $('body').css('overflowY', 'hidden');
	    }
	 
	    function onReturn() {
	        $("#ReviewsSubmissionContainerWrapper").dialog('close');
	        $("#cboxOverlay").css({"display":"none","opacity":"0"});
	    }
