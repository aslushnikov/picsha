$(document).ready(function(){
    $('#button').click(function(){
        addPhotoToBottom("http://i500.listal.com/image/3337547/500.jpg");
    });
    $('#button2').click(function(){
        addPhotoToTop("http://i500.listal.com/image/3337547/500.jpg");
    });
});

function swapImageSrc(imageObj, src1, src2) {
    var src = (imageObj.attr('src') === src1) ? src2 : src1;
    imageObj.attr('src', src);
}

function addPhoto(id, src, lon, lat, position) {
    var photo = '<div class="photo" id="+id+">' +
        '<img src='+src+' width=500px class="photo_img">' +
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
    var photoDiv = $("#"+id); photoDiv._lon = lon; photoDiv._lat = lat;
    $('.like').click(function(){
        swapImageSrc($(this), "http://images.wikia.com/clubpenguin/images/4/44/Like.png", "http://conecti.ca/wp-content/uploads/2013/04/Facebook-Like.png");
        likePhoto(id);
    });
    $('.geo').click(function(){
        swapImageSrc($(this), "geo.jpg", "geo_opened.jpg");
        //show map will be here
    });
}

function addPhotoToBottom(id, src, lon, lat) {
    addPhoto(id, src, lon, lat, "bottom");
}

function addPhotoToTop(id, src, lon, lat) {
    addPhoto(id, src, lon, lat, "top");
}

//client-server stuff

function photoReceived(id, img, lon, lat) {
    addPhotoToTop(id, img, lon, lat);
}

function likePhoto(id) {

}