$(document).ready(function(){
    $('#button').click(function(){
        addPhotoToBottom(0, "http://i500.listal.com/image/3337547/500.jpg", 0, 0);
    });
    $('#button2').click(function(){
        addPhotoToTop(0, "http://i500.listal.com/image/3337547/500.jpg", 0, 0);
    });
});

function addPhoto(id, src, lat, lon, position) {
    var photo = '<div class="photo" id="'+id+'" style="background:url('+src+');">' +
//        '<img src="'+src+'" width=500px class="photo_img">' +
        '<div class="actions_bar">' +
        '<img class="like" src="images/heart-no.png"/>' +
        '<img class="geo" src="images/map.png"/>' +
        '</div>' +
//        '</img>' +
        '</div>';
    if (position === "top") {
        $("#feed").prepend(photo);
    } else if (position === "bottom") {
        $("#feed").append(photo);
    }
    var $photoDiv = $("#"+id); $photoDiv._lat = lat; $photoDiv._lon = lon;
    $('.like').click(function(){
        if ($(this).attr('src') === "images/heart-no.png") {
            $(this).attr('src', "images/heart-yes.png");
            likePhoto(id);
        }
    });
    $('.geo').click(function(){
        //show map will be here
        var $img = $(this).parent().parent();
        $img.addClass('animated_flip');
        window.setTimeout(function () {
            return function () {
                var src = "http://www.straitpinkie.com/wp-content/uploads/2011/12/04Kelly28-500x500.jpg";
                $img.css('background', 'url(' + src + ')');
            };
        }, 500);

        $img.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', function() {
            $img.removeClass('animated_flip');
        });
    });
}

function addPhotoToBottom(id, src, lat, lon) {
    addPhoto(id, src, lat, lon, "bottom");
}

function addPhotoToTop(id, src, lat, lon) {
    addPhoto(id, src, lat, lon, "top");
}

//client-server stuff

function photoReceived(id, img, lat, lon) {
    addPhotoToTop(id, img, lat, lon);
}

function likePhoto(id) {

}