function Server() {
    this._socket = io.connect('/');
    this._socket.on("photo", this._photoReceived.bind(this));
    getCurrentPosition(function(position) {
       this._position = position;
    }.bind(this), 7000);
}

Server.prototype = {
    _photoReceived: function(photo)
    {
        console.log("Photo received");
        addPhoto(photo.id, photo.src, photo.longitude, photo.latitude, "top");
    },

    sendPhoto: function(base64)
    {
        var photo = {
            id: uuid.v1(),
            base64: base64
        };
        if (this._position) {
            photo.longitude = location.longitude;
            photo.latitude = location.latitude;
        }
        this._socket.emit("photo", photo);
        console.log("send photo");
    }
}

var ServerBackend = new Server();

