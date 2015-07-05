var debug    = require('debug');
var log      = debug('initialise_codebase');
var error    = debug('initialise_codebase:error');

var cmd      = require('child_process');


var run_command = function (comment, command, callback) {
    'use strict';

    log(comment, command);
    command = "echo '" + comment + "'; " + command;

    cmd.exec(command, function (err, stdout, stderr) {
        log(stdout);
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


var initialise_codebase = function (config) {
    'use strict';

    var init_codebase = function (callback) {

        log('Initialising builder repository');
        var comment = 'Initialise repository';
        var command = 'ls ' + config.path + '.git || git clone ' + config.repository + ' ' + config.path + '';

        run_command(comment, command, callback);
    };

    return init_codebase;
};

module.exports = initialise_codebase;
