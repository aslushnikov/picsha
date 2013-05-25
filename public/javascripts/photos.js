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
    var photoDiv = $("#"+id); photoDiv._lat = lat; photoDiv._lon = lon;
    $('.like').click(function(){
        if ($(this).attr('src') === "images/heart-no.png") {
            $(this).attr('src', "images/heart-yes.png");
            likePhoto(id);
        }
    });
    $('.geo').click(function(){
        //show map will be here
    });
}

function addPhotoToBottom(id, src, lat, lon) {
    addPhoto(id, src, lon, lat, "bottom");
}

function addPhotoToTop(id, src, lat, lon) {
    addPhoto(id, src, lon, lat, "top");
}

//client-server stuff

function photoReceived(id, img, lat, lon) {
    addPhotoToTop(id, img, lat, lon);
}

function likePhoto(id) {

}