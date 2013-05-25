/**
 * Module dependencies.
 */
var express = require('express')

var app = module.exports = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , uuid = require('uuid');

var SITE_SECRET = "I have no idea what I'm doing";

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.cookieSession({secret:SITE_SECRET}));
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
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world, hello!' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('disconnect', function() {
        var index = activeSockets.indexOf(socket);
        if (index >= 0) activeSockets.splice(index, 1);
    });
    activeSockets.push(socket);
});

// Routing
app.get("/", function (req, res) {
    res.redirect('/index.html');
});

app.get("/clients", function (req, res) {
    res.send('Active clients: ' + activeSockets.length);
});

app.get('/session', function(req, res){
    req.session.count = req.session.count || 0;
    var n = req.session.count++;
    res.send('viewed ' + n + ' times\n');
});

server.listen(process.env.PORT || 3000);
