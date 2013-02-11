var app     = require('express')()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , Series  = require('./series').Series;

app.use(require('connect').static(__dirname + '/public'))
server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    var series = [ { data: Series.create(),
                     label: "Series " + Series.randint(1,10).toString()} ]
    // push data immediately
    socket.emit('plot data', series );

    // push new data every 1.5 sec
    setInterval(function(){
        var series = [ { data: Series.create(),
                         label: "Series " + Series.randint(1,10).toString()} ]
        
        socket.emit('plot data', series );

    }, 1500);
});
