function showPopup(text) {
    var $c = $('#popupContainer');
    var $p = $('#popupBox').clone().detach();
    $c.append($p);
    $p.fadeIn('slow');
    $p.find('.popup_text').text(text);
    $p.find('.buttonCancel').click(function () {
        $(this).parent().parent().fadeOut('slow');
    });
}