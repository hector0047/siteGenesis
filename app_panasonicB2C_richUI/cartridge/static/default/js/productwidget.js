/* PANC-1273 Farhan's Dev team 22-sep-2015 11:20am IST */

$(window).bind('scroll', function () {
    if ($(window).scrollTop() > 100) {
        $('#compare-items').addClass('compare-items-fixed');
        $('.compare-item').addClass('compare-items-small');
    } else {
        $('#compare-items').removeClass('compare-items-fixed');
        $('.compare-item').removeClass('compare-items-small');
    }
});