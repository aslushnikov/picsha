$(document).ready(function(){
    $('#button').click(function(){
        addPhotoToBottom("http://media.oboobs.ru/boobs_preview/07304.jpg");
    });
    $('#button2').click(function(){
        addPhotoToTop("http://media.oboobs.ru/boobs_preview/07304.jpg");
    });
});

function swapImageSrc(imageObj, src1, src2) {
    var src = (imageObj.attr('src') === src1) ? src2 : src1;
    imageObj.attr('src', src);
}

function addPhoto(src, position) {
    var photo = '<div class="photo">' +
        '<img src='+src+' width=500px height=500px class="photo_img">' +
        '<div class="actions_bar">' +
        '<img class="like" src="http://images.wikia.com/clubpenguin/images/4/44/Like.png" width=20px height=20px/>' +
        '<img class="geo" src="geo"/>' +
        '</div>' +
        '</img>' +
        '</div>';
    if (position === "top") {
        $("#feed").prepend(photo);
    } else if (position === "bottom") {
        $("#feed").append(photo);
    }
    $('.like').click(function(){
        swapImageSrc($(this), "http://images.wikia.com/clubpenguin/images/4/44/Like.png", "http://conecti.ca/wp-content/uploads/2013/04/Facebook-Like.png");
        //div class photo
        //$(this).parent().parent();
    });
    $('.geo').click(function(){
        swapImageSrc($(this), "geo.jpg", "geo_opened.jpg");
        //div class photo
        //$(this).parent().parent();

    });
}

function addPhotoToBottom(src) {
    addPhoto(src, "bottom");
}

function addPhotoToTop(src) {
    addPhoto(src, "top");
}