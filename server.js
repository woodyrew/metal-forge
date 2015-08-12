var path = require('path');
var cc    = require('config-multipaas');
var debug = require('debug');
var log   = debug('metal-forge');
var error = debug('metal-forge:error');

var async  = require('async');
var Hapi   = require('hapi');
var Basic  = require('hapi-auth-basic');
var server = new Hapi.Server();

var config = require('./config.json');

var codebase = require('./modules/builder_codebase');
// var contentful_to_files = require('./modules/contentful_to_files');
var fetch_latest_json = require('./modules/contentful_to_files')(config.contentful);
var init_codebase = require('./modules/init_codebase')(config.builder);


var conf = cc();
server.connection({
	address: conf.get('IP')
  , port   : conf.get('PORT')
});


var trigger_build = function (webhook_name) {
    'use strict';
    log('Building... Triggered by %s', webhook_name);

    async.series(
        {
            fetch: fetch_latest_json
          , check: codebase.check
          , pull : codebase.pull
          , npm  : codebase.npm
          , build: codebase.build
          , copy : codebase.copy_to_serve
        },
        function (err, results) {
            if (err) {
                error(err);
                throw err;
            }

            //log('Successfully built: ', results);
        }
    );
    // TODO: archive existing files to store/archive/{yyyy-mm-dd_hh-mm-ss}/*.json
    // TODO: NEVER overwrite with empty files

    // TODO: keep latest 20
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

    server.route({
        method : 'GET'
      , path   : '/status'
      , handler: function (request, reply) {
            reply({'status': 'ok'});
        }
    });
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

                    trigger_build(request.auth.credentials.name, config);
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

    // if (config.site.custom404) {
    //     server.route({
    //         method : '*'
    //       , path   : '/{p*}' // catch-all path
    //       , handler: function (request, reply) {
    //             reply.file('site/live/404.html').code(404);
    //         }
    //     });
    // }
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
    curl_parts.push(server.info.uri + '/' + config.path_to_webhook + '/' + webhook.path);

    console.log('Test `' + webhook.name + '` Webhook with:\n' + curl_parts.join(' ') + '\n');
});
// curl -X POST -u user:pass --header "X-Contentful-Topic: ContentManagement.Entry.publish" localhost:3000

server.start(function () {
    'use strict';
    console.log('Server started at: ' + server.info.uri);
});




async.series(
    {
        clone: init_codebase
      , fetch: fetch_latest_json
      , npm  : codebase.npm
      , build: codebase.build
      , copy : codebase.copy_to_serve
    },
    function (err, results) {
        if (err) {
            error(err);
            throw err;
        }

        //log('Successfully built: ', results);
    }
);
