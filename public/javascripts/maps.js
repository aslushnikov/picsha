$(document).ready(function () {
//    getCurrentPosition(function(coords) {
//        $("#header").append("<img src=\"" + getMapImageUrl(coords.latitude, coords.longitude) + "\">");
//    });
    $('div.image').click(function () {
        $(this).children(".map").toggle();
        $(this).children(".picture").toggle();
    });
});

function getMapImageUrl(latitude, longitude) {
//    if (latitude < longitude) {
//        return "http://maps.googleapis.com/maps/api/staticmap?zoom=10&size=480x480&markers=color:blue%7C" +
//            longitude + "," + latitude + "&sensor=false"
//    }
    return "http://maps.googleapis.com/maps/api/staticmap?zoom=10&size=480x480&markers=color:blue%7C" +
        latitude + "," + longitude + "&sensor=false"
}

function getCurrentPosition(callback, timeout) {
    // Try HTML5 geolocation
    timeout = timeout || 10000;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            callback({latitude: latitude, longitude: longitude});
        }, function () {
            callback(null);
        },
        { timeout: timeout});
    } else {
        callback(null);
    }
}
