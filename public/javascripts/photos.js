var photos = [];
var sentPhotos = [];

function Photo(id, src, lat, lon, liked) {
    this.id = id;
    this.src = src;
    this.lat = lat;
    this.lon = lon;
    this.liked = liked;
}

function findPhotoById(id) {
    for (var i = 0; i < photos.length; ++i) {
        if (photos[i].id === id) {
            return photos[i];
        }
    }
    return null;
}

function addPhotoToModel(photo) {
    photos.push(photo);
}

function updatePhotoLikeStats() {
    var amount = 0;
    for(var i = 0; i < sentPhotos.length; ++i) {
        amount += sentPhotos[i].liked ? 1 : 0;
    }
    $("#likes-amount").text(amount);
    $("#photos-sent").text(sentPhotos.length);
    $("#likeStats").show();
}

$(document).ready(function(){

    $("#takeapic").click(function() {
        showCamera();
    });

    function addPhotos(photos) {
        var sent = photos.sent;
        var received = photos.received;
        var cmp = function(a, b) {
            return new Date(b.date) - new Date(a.date);
        };
        received.sort(cmp);

        for (var i = 0; i < sent.length; ++i) {
            sentPhotos.push({id:sent[i].id, liked:sent[i].liked});
        }

        for(var i = 0; i < received.length; ++i) {
            var photo = received[i];
            addPhotoToBottom(photo.id, photo.src, photo.latitude, photo.longitude, photo.liked);
        }
        updatePhotoLikeStats();
    }
    $(document).ready(function() {
        $.get('/photos')
            .done(addPhotos);
    });

});

function addPhoto(id, src, lat, lon, liked, position) {
    addPhotoToModel(new Photo(id, src, lat, lon, liked));
    var photo = '<div class="photo" id="'+id+'" style="background:url('+src+');">' +
        '<div class="actions_bar">' +
        '<img class="like" src="' + (liked ? "images/heart-yes.png" : "images/heart-no.png") + '"/>' +
        '<img class="geo" src="images/map.png"/>' +
        '</div>' +
        '</div>';
    if (position === "top") {
        $("#feed").prepend(photo);
    } else if (position === "bottom") {
        $("#feed").append(photo);
    }
    var $photoDiv = $("#"+id); $photoDiv.get(0)._lat = lat; $photoDiv.get(0)._lon = lon;
    var $like = $photoDiv.find('.like');
    $like.click(function(){
        if ($(this).attr('src') === "images/heart-no.png") {
            $(this).attr('src', "images/heart-yes.png");
            likePhoto(id);
        }
    });
    var $geo = $photoDiv.find('.geo');
    $geo.click(function(){
        var $img = $(this).parent().parent();
        $img.addClass('animated_flip');
        $img.get(0)._onMap = !$img.get(0)._onMap;
        window.setTimeout(function () {
            return function () {
                var src = "";
                var photo = findPhotoById(id);
                if ($img.get(0)._onMap) {
                    src = getMapImageUrl(photo.lat, photo.lon);
                } else {
                    src = photo.src;
                }
                console.log(src);
                $img.css('background', 'url(' + src + ')');
            };
        }(), 500);

        $img.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', function() {
            $img.removeClass('animated_flip');
        });
    });
}

function addPhotoToBottom(id, src, lat, lon, liked) {
    addPhoto(id, src, lat, lon, liked, "bottom");
}

function addPhotoToTop(id, src, lat, lon, liked) {
    addPhoto(id, src, lat, lon, liked, "top");
}

//client-server stuff

function photoReceived(id, img, lat, lon, liked) {
    addPhotoToTop(id, img, lat, lon, liked);
}

function photoSent(id) {
    sentPhotos.push({id:id, liked:false});
    updatePhotoLikeStats();
}

function likePhoto(id) {
    ServerBackend.likePhoto(id);
    findPhotoById(id).liked = true;
}

function myPhotoWasLiked(photoId) {
    for(var i = 0; i < sentPhotos.length; ++i) {
        if (sentPhotos[i].id === photoId) {
            sentPhotos[i].liked = true;
            break;
        }
    }
    updatePhotoLikeStats();
}
