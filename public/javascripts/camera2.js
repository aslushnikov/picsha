$(document).ready(function () {
    $("#webcam").scriptcam({
        showMicrophoneErrors: false,
        onError: onError,
        cornerRadius: 20,
        cornerColor: 'e3e5e2',
        onWebcamReady: onWebcamReady
//        uploadImage: 'upload.gif'
//        onPictureAsBase64: base64_tofield_and_image
    });

});

function showCamera() {
    $("#camera").show();
}

function snapshot() {
    $('#image').attr("src","data:image/png;base64,"+$.scriptcam.getFrameAsBase64()).show();
    $("#snapshot-button").hide();
    $("#use-button").show();
}

function usePhoto() {
    var img = $('#image');
    ServerBackend.sendPhoto(img.src);
    $("#webcam").hide();
    $(img).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
}

function onError(errorId,errorMsg) {
    alert(errorMsg);
}

function onWebcamReady(cameraNames,camera,microphoneNames,microphone,volume) {
}

function base64_tofield_and_image(b64) {
    $('#image').attr("src","data:image/png;base64,"+b64);
}



