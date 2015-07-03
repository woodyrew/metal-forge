// var path = require('path');
var debug = require('debug');
var log   = debug('metal-forge');
var error = debug('metal-forge:error');

log('still goes to stdout, but via console.info now');
var Hapi   = require('hapi');
var Basic  = require('hapi-auth-basic');
var server = new Hapi.Server();
var config = require('./config.json');
var port   = process.env.PORT || 5000;

server.connection({ port: port });

var trigger_build = function (webhook_name) {
    'use strict';
    console.log('Geddon, building... %s', webhook_name);
    // put into module
    //
    // make contentful_to_files a module
    // archive existing files to store/archive/{yyyy-mm-dd_hh-mm-ss}/*.json
    // NEVER overwrite with empty files
    // call contentful_to_files
    //
    // run builder_codebase
    //
    // copy files from build codebase to site/{yyyy-mm-dd_hh-mm-ss}
    // repoint site/live symlink to latest build
    // keep latest 20
};



if (!config.webhooks) {
    throw new Error("webhooks isn't defined in `config.json`");
}


var validate = function (username, password, callback) {
    'use strict';

    var user = config.webhooks[username];
    if (!user) {
        return callback(null, false);
    }

    if (user.password === password) {
        callback(null, true, {
            name           : user.name
          , path           : user.path
          , expected_header: user.expected_header
        });
    }
    else {
        callback(null, false);
    }
};

server.register(Basic, function (err) {
    'use strict';
    if (err) {
        throw new Error(err);
    }

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method : 'POST'
      , path   : '/' + config.path_to_webhook + '/{webhook_id}'
      , config : { auth: 'simple' }
      , handler: function (request, reply) {
            var missing_header = false;
            if (request.params.webhook_id === request.auth.credentials.path) {
                if (request.auth.credentials.expected_header) {
                    Object.keys(request.auth.credentials.expected_header).forEach(function(expected_key){
                        var expected_string = request.auth.credentials.expected_header[expected_key];
                        if (request.headers[expected_key.toLowerCase()] !== expected_string) {
                            // TODO: provide more information
                            error('Missing header', expected_key, expected_string, request.headers);
                            missing_header = true;
                        }
                    });
                }

                if (missing_header) {
                    reply().code(404);
                }
                else {
                    reply().code(204);
                    log('Build triggered from `%s` webhook', request.auth.credentials.name);
                    trigger_build(request.auth.credentials.name);
                }
            }
            else {
                error('Username/password success; Webhook failed. Attempted webhook url param: %s', request.params.webhook_id);
                reply().code(404);
            }

        }
    });

    server.route({
        method : 'GET'
      , path   : '/{param*}'
      , handler: {
            directory: {
                path: 'site/live'
            }
        }
    });
});

Object.keys(config.webhooks).forEach(function (username) {
    'use strict';
    var webhook = config.webhooks[username];
    var curl_parts = [
        'curl -X POST -u'
      , webhook.username + ':' + webhook.password
    ];
    if (webhook.expected_header) {
        Object.keys(webhook.expected_header).forEach(function (key) {
            var element = webhook.expected_header[key];
            curl_parts.push('--header "' + key + ': ' + element + '"');
        });
    }
    curl_parts.push('localhost:' + port + '/' + config.path_to_webhook + '/' + webhook.path);

    console.log('Test `' + webhook.name + '` Webhook with:\n' + curl_parts.join(' ') + '\n');
});
// curl -X POST -u user:pass --header "X-Contentful-Topic: ContentManagement.Entry.publish" localhost:3000

server.start(function () {
    'use strict';
    console.log('Listening on port: %s', port);
});

