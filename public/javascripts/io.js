function Server() {
    this._socket = io.connect('/');
    this._socket.on("photo", this._photoReceived.bind(this));
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
            longitude: 0,
            latitude: 0,
            base64: base64
        };
        this._socket.emit("photo", photo);
    }
}

var ServerBackend = new Server();
