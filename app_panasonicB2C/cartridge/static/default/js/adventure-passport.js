$(document).ready(function(){
    var passportID = window.location.search.split('passport=')[1].split('&')[0];

    $.ajax({
        url: 'http://162.220.240.247/panasonic.php',
        crossDomain: true,
        data: { passport: passportID },
        success: populateData,
        error: showErrorMessage
    });

    $('.product-carousel').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3
    });
});

function generateTemplate(contentType, id, thumbnailURL, contentURL) {

    var contentString;
    if (contentType === "video") {
        contentString = "<iframe width='252' height='252' class='lightbox-item' frameborder='0' allowfullscreen src='" + contentURL + "'></iframe>";
    } else {
        contentString = "<img class='lightbox-item' src='" + contentURL + "'/>";
    }

    var htmlString = "<a href='#gallery-" + id + "' target='_self' class='litebox' data-litebox-group='group-1'>"
        + "     <div class='gallery-overlay gallery-" + contentType + "'>"
        + "         <img class='gallery-item' src='" + thumbnailURL + "'/>"
        + "     </div>"
        + "</a>"
        + "<div style='display: none;'>"
        + "    <div id='gallery-" + id + "'>" + contentString
        + "		    <div class='lightbox-footer'>"
        + "			  <a class='download' href='" + contentURL + "' download><div class='ico-download'></div>Download</a>"
        + "			  <div class='addthis_toolbox addthis_toolbox_modal' addthis:url='" + window.location.href + "' addthis:title='Check out my Panasonic 360&deg; videos!'>"
        + "             <div class='custom_images'>"
        + "                 <a class='addthis_button_facebook'><div></div></a>"
        + "                 <a class='addthis_button_twitter'><div></div></a>"
        + "                 <a class='addthis_button_email'><div></div></a>"
        + "             </div>"
        + "           </div>"
        + "         </div>"
        + "     </div>"
        + "</div>"

    return $(htmlString);
}

function populateData(data) {
    if (data[0].type) {
        $.each(data, function(i, media) {
            if (i == 0 ) {
              if(media.video) {
                $('iframe.spartan-content').attr('src', media.video);
                $('img.spartan-content').hide();
              } else {
                $('img.spartan-content').attr('src', media.image);
                $('iframe.spartan-content').hide();
              }
                //$('#spartan-title').html(media.location);
                //$('#spartan-date').html(media.date);
            }

            var $template;
            if (media.video) {
                $template = generateTemplate('video', i, media.thumbnail, media.video);
            } else {
                $template = generateTemplate('image', i, media.thumbnail, media.image);
            }
            $('.gallery').append($template);
        });
        $('.litebox').liteBox({
            callbackAfterOpen: function() {
                addthis.toolbox('.addthis_toolbox_modal');
            }
        });
    } else {
        showErrorMessage();
    }
}


function showErrorMessage() {
    $(".passport-success").hide();
    $(".passport-error").show();
}
