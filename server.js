// Set Debugging up:
if (process.env.NODE_ENV === 'development' && !process.env.DEBUG) {
    process.env.DEBUG = '*';
}

// var path = require('path');
var cc    = require('config-multipaas');
var debug = require('debug');
var log   = debug('metal-forge');
var error = debug('metal-forge:error');

var express = require('express');
var app = express();

// Configurations
var config = require('./config.json');
var conf = cc();

// modules
var routes = require('routes');
var build_tasks = require('build_tasks');

if (!config.webhooks) {
    error("webhooks isn't defined in `config.json`");
    throw new Error("webhooks isn't defined in `config.json`");
}

app.use(routes);

var server = app.listen(conf.get('PORT'), function () {
    'use strict';
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

// Output the cURL commands for testing webhooks
Object.keys(config.webhooks).forEach(function (path) {
    'use strict';
    var webhook = config.webhooks[path];
    var curl_parts = [
        'curl -X ' + webhook.method
    ];
    if (webhook.username && webhook.password) {
        curl_parts.push('-u ' + webhook.username + ':' + webhook.password);
    }
    if (webhook.expected_header) {
        Object.keys(webhook.expected_header).forEach(function (key) {
            var element = webhook.expected_header[key];
            curl_parts.push('--header "' + key + ': ' + element + '"');
        });
    }
    curl_parts.push(server.address().address + ':' + server.address().port + '/' + config.path_to_webhook + '/' + path);

    console.log('Test `' + webhook.name + '` Webhook with:\n' + curl_parts.join(' ') + '\n');
});

// Initialise codebase and build
build_tasks.init_build();
