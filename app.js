/**
 * Module dependencies.
 */
var express = require('express')
  , MongoStore = require('connect-mongo')(express);

var app = module.exports = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , uuid = require('uuid')
  , cookie = require('cookie')
  , connect = require('connect');

var SITE_SECRET = "I have no idea what I'm doing";
var DB_NAME = "picsha"

var sessionStore = new MongoStore({db: DB_NAME});
// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: SITE_SECRET, key: 'express.sid', store: sessionStore}));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Socket.IO
var activeSockets = [];

io.set('transports', [
            'websocket'
          , 'htmlfile'
          , 'xhr-polling'
          , 'jsonp-polling'
        ]);

io.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
        var sessionCookie = cookie.parse(data.headers.cookie);
        var sessionID = connect.utils.parseSignedCookie(sessionCookie['express.sid'], SITE_SECRET);
        sessionStore.get(sessionID, function(err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                data.session = session;
                data.sessionID = sessionID;
                accept(null, true);
            }
        });
    } else {
        accept('No cookie', false);
    }
});

io.sockets.on('connection', function (socket) {
    socket.on('photo', function(data) {
        for(var i = 0; i < activeSockets.length; ++i) {
            if (activeSockets[i] !== socket) {
                activeSockets[i].emit("photo", data);
                break;
            }
        }
    });
    socket.on('disconnect', function() {
        var index = activeSockets.indexOf(socket);
        if (index >= 0) activeSockets.splice(index, 1);
    });
    activeSockets.push(socket);
});

// Routing
app.get("/", function (req, res) {
    res.redirect('/underconstruction.html');
});

app.get("/clients", function (req, res) {
    res.send('Active clients: ' + activeSockets.length);
});

app.get('/session', function(req, res){
    req.session.count = req.session.count || 0;
    var n = req.session.count++;
    res.send('viewed ' + n + ' times\n');
});

// Mongo DB
var mongoose = require('mongoose')
  , photoSchema = mongoose.Schema({
        id: String,
        origin: String,
        routed: String,
        longitude: Number,
        latitude: Number,
        received: Date,
        liked: Boolean
    })
  , Photo = mongoose.model('photo', photoSchema);

mongoose.connect('mongodb://localhost/' + DB_NAME);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("success connect to mongodb");
    server.listen(process.env.PORT || 3000);
});

// Picture handling

function receivePhoto(photo) {
}
