
var moment  = require('moment-range')
    , _     = require('underscore');

var Series = function () {
    
    return { create: create,
             randint: randint };
    
    // generates random int b/w min & max
    function randint (min,max) {
        return Math.floor( Math.random() * (max - min + 1)) + min ;
    }

    // fake data for y-axis
    function get_measure (n) {
        var n_samples = n
            , m =[];

        _.each(_.range(n_samples), function (index, day) {
            m.push(randint(800 , 1200 ))
        })
        return m
    }

    // array of dates in milliseconds
    // for the last 30 days
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

module.exports.Series = Series