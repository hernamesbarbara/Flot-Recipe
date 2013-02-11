var app     = require('express')()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , Series  = require('./series').Series;

app.use(require('connect').static(__dirname + '/public'))
server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

function make_series() {
    var series = [{ 
        data: Series.create(),
        label: "Series " + Series.randint(1,10).toString()
      }];

    return series
};

io.sockets.on('connection', function (socket) {

    socket.emit('plot data', make_series() );

    // push new data every 2 sec
    setInterval(function(){
        socket.emit('plot data', make_series() );
    }, 2000);
});
