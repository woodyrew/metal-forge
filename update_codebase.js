// var cmd    = require("child_process");
var async  = require('async');

var codebase = require('./modules/builder_codebase');
// var config = require("./config.json").builder;





// an example using an object instead of an array
async.series(
    {
        check: codebase.check
      , pull : codebase.pull
      , npm  : codebase.npm
      , build: codebase.build
      , show : codebase.show_site
    },
    function (err, results) {
        'use strict';

        if (err) {
            throw err;
        }

        // results is now equal to: {one: 1, two: 2}
        //console.log(results);
    }
);
