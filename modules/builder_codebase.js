var cmd    = require('child_process');
// var async  = require("async");

var config = require('../config.json').builder;

var cd = 'cd ' + config.path + ' && ';


var run_command = function (comment, command, callback) {
    'use strict';

    command = "echo '" + comment + "'; " + command;
    cmd.exec(command, function (error, stdout, stderr) {
        console.log(stdout);
        console.log('stderr:\n' + stderr);

        if (error !== null) {
            console.log('exec error: ' + error, stderr);
            callback(error);
        }
        else {
            callback(null, {
                stdout: stdout
              , stderr: stderr
            });
        }
    });
};


var check = function (callback) {
    'use strict';
    var comment = 'Check the codebase exists and is on master.';
    var command = cd + "git branch | grep '* master' && echo 'On master'";
     // master && git fetch origin master && git status";

    run_command(comment, command, callback);
};

var pull = function (callback) {
    'use strict';
    var comment = 'Do Git Pull';
    var command = cd + 'git pull origin master';

    run_command(comment, command, callback);
};

var npm = function (callback) {
    'use strict';
    var comment = 'Install dependancies';
    var command = cd + 'npm install';

    run_command(comment, command, callback);
};

var build = function (callback) {
    'use strict';
    var comment = 'Build';
    var command = cd + 'node ./';

    run_command(comment, command, callback);
};

var show_site = function (callback) {
    'use strict';
    var comment = 'Show the files that were built';
    var command = cd + 'tree ./site';

    run_command(comment, command, callback);
};



module.exports = {
    check    : check
  , pull     : pull
  , npm      : npm
  , build    : build
  , show_site: show_site
};
