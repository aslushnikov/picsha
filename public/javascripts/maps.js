$(document).ready(function () {
    $('div.image').click(function () {
        $(this).children(".map").toggle();
        $(this).children(".picture").toggle();
    });
});

function getMapImageUrl(latitude, longitude) {
    return "http://maps.googleapis.com/maps/api/staticmap?zoom=4&size=480x480&markers=color:blue%7C" +
        latitude + "," + longitude + "&sensor=false"
}

function getCurrentPosition() {
    // Try HTML5 geolocation
    var latitude = null;
    var longitude = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        }, function () {
        });
    }
    return {latitude: latitude, longitude: longitude};
}
