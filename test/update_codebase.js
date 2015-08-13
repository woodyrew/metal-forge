var async  = require('async');

var codebase = require('./modules/builder_codebase');


async.series(
    {
        check: codebase.check
      , pull : codebase.pull
      , npm  : codebase.npm
      , build: codebase.build
      , copy : codebase.copy_to_serve
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
