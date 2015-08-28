var debug  = require('debug');
var log    = debug('builder');
var error  = debug('builder:error');

var cmd    = require('child_process');
var path   = require('path');
var moment = require('moment');
var config = require('../config.json').builder;

var cd = 'cd ' + config.path + ' && ';


var run_command = function (comment, command, callback) {
    'use strict';

    log(comment, command);
    command = "echo '" + comment + "'; " + command;

    cmd.exec(command, function (err, stdout, stderr) {

        if (err !== null) {
            error('exec error: ' + err, stderr);
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
    var command = cd + 'npm install && echo "Installed Dependancies"';

    run_command(comment, command, callback);
};

var build = function (callback) {
    'use strict';
    var comment = 'Build';
    var command = cd + 'node ./';

    run_command(comment, command, callback);
};

var copy_to_serve = function (callback) {
    'use strict';
    var comment = 'Copy files to serve';

    var now = moment().format('YYYY-MM-DD_HH-mm');
    var dest_path = path.resolve(__dirname, '../site/' + now);
    var live_path = path.resolve(__dirname, '../site/live');

    // create a new directory, copy files to it and link to it.
    var command = 'mkdir -p ' + dest_path + ' && cp -R ' + config.path + 'site/* ' + dest_path;
    // ln -sfn replaces a symlink for a directory
    command += ' && ln -sfn ' + dest_path + ' ' + live_path;

    run_command(comment, command, callback);
};


module.exports = {
    check        : check
  , pull         : pull
  , npm          : npm
  , build        : build
  , copy_to_serve: copy_to_serve
};
