#### javascript plotting recipe

* [Flot](http://www.flotcharts.org/) graphics
* Socket.io for pushing data to the time-series
* [Moment.js][moment] for date parsing
* [moment-range](http://gf3.github.com/moment-range/) for generating date sequences

##### server

``` javascript
  var Plot = function () {
    
    return { create: create };
    
    // random number utility
    // generates random int b/w min & max
    function randint (min,max) {
        return Math.floor( Math.random() * (max - min + 1)) + min ;
    }

    // random y-axis data 
    // trends up over time
    function get_measure (n) {
        var n_samples = n
            , m =[]
            , i = 10;

        _.each(_.range(n_samples), function (index, day) {
            m.push(randint(800 + i, 1200 + i))
            i += 10
        })
        return m
    }

    // sequence of dates in milliseconds
    // for the last 30 days
    // returns array
    function get_dates () {
        var today     = moment()
            , start   = moment(today).subtract('days', 30)
            , range   = moment().range(start, today)
            , dates   = [];
      
        range.by('d', function (m) {
            dates.push(m.valueOf())
        });
        return dates
    }

    // multidimensional array w/ shape (30, 2)  
    //  [[1357788897349, 3932] ,
    //   [1358048097349, 1063]]
    function create () {
        var dates = get_dates()
            , measures = get_measure(dates.length)
        return _.zip(dates, measures)
    }
}();

io.sockets.on('connection', function (socket) {
    socket.emit('plot data', Plot.create() );
});
``` 

##### client

``` javascript
(function (d, b) {

    function scale_x_date(axes) {

        var ax = axes,
          xticks = [],
          xmin = moment(ax.xaxis.min).day(-7), // set the start date to last saturday
          xmax = moment(ax.xaxis.max),
          one_week = moment.duration(7, 'days').asMilliseconds(),
          weekend = moment.duration(2, 'days').asMilliseconds();

        for (i = xmin._i; i < xmax._i; i += one_week) {

          var week = {
              xaxis: {
                  from: i ,
                  to: i + weekend
              }
          }

          xticks.push(week)
        }
        
        return xticks

    }
    
    function bind_events () {
        var socket = io.connect('http://localhost');

        socket.on('plot data', function (d) {
            var d = d

            $.each(d, function (i, datum) {
                datum[0] = moment(datum[0]).utc()._i // Flot needs dates in UTC format
            })
            draw(d)
        });

        function draw (plt) {

            var options = {
                    series: {
                        lines: { 
                            show: true, 
                            fill: true, 
                            lineWidth: 1, 
                            steps: false, 
                            fillColor: { colors: [{opacity: 0.25}, {opacity: 0}] } 
                        },
                        points: { 
                            show: true, 
                            radius: 2.5, 
                            fill: true
                        }
                },
                legend: { 
                    position: "se"
                },
                xaxis: {
                    mode: "time",
                    tickLength: 5
                },
                tooltip: true,
                tooltipOpts: {
                    content: '%s: %y'
                },
                selection: {
                    mode: "x"
                },
                grid: {
                    hoverable: true,
                    borderWidth: 2,
                    markings: scale_x_date
                }
            };

            var plot = $.plot("#placeholder", [{data:plt, label: 'Series A'}], options);
            
            var overview = $.plot("#overview", [plt], {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 1
                    },
                    shadowSize: 0
                },
                xaxis: {
                    ticks: [],
                    mode: "time"
                },
                yaxis: {
                    ticks: [],
                    min: 0,
                    autoscaleMargin: 0.1
                },
                selection: {
                    mode: "x"
                }
            });

            // sub plot w/ zoom
            $("#placeholder").bind("plotselected", function (event, ranges) {
                
                plot = $.plot("#placeholder", [plt], $.extend(true, {}, options, {
                    xaxis: {
                        min: ranges.xaxis.from,
                        max: ranges.xaxis.to
                    }
                }));

                overview.setSelection(ranges, true);
            
            });

            $("#overview").bind("plotselected", function (event, ranges) {
                plot.setSelection(ranges);
            });
        }
    }

    $(document).ready(function (){
        // on page load
        // bind socket events
        // with plot functions
        bind_events()
    });

  })(jQuery, this)
``` 