var debug = require('debug');
var log   = debug('metal-forge_webhooks');
var error = debug('metal-forge_webhooks:error');

var express = require('express');
var router = express.Router();
var path   = require('path');

var basic_auth = require('basic-auth');

// Modules
var build_tasks = require('build_tasks');

// Get config
var config = require(path.join(process.cwd(), 'config.json'));

var unauthorised = function (response) {
    'use strict';
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return response.send(401);
};


router.use('/:webhook_path', function (req, res) {
    'use strict';
    var webhook_path = req.params.webhook_path;
    var webhook      = config.webhooks && config.webhooks[webhook_path];
    var user         = basic_auth(req);

    log('Attempting %s', webhook_path);
    log('Associated config: %o', webhook);

    // Check webhook exists
    if (webhook && webhook.method === req.method) {
        // Check request for request headers
        if (webhook.expected_header) {
            for (var header in webhook.expected_header) {
                var content = webhook.expected_header[header];
                log('Checking for request header - %s: %s', header, content);
                if (req.headers[header] !== content) {
                    error('Missing Headers. Headers passed: %o', req.headers);
                    return res.send(404);
                }
            }
        }

        // Check username and password
        if (webhook.username && webhook.password) {
            log('Checking against username: %s', webhook.username);
            log('Checking against password: %s', webhook.password);

            if (!user || !user.name || !user.pass) {
                error('Username or Password not provided');
                return unauthorised(res);
            }

            if (user.name !== webhook.username || user.pass !== webhook.password) {
                error('Username or Password not correct');
                return unauthorised(res);
            }
        }

        // Success
        build_tasks.trigger_build(webhook.name);
        return res.send(204);
    }
    else {
        return res.send(404);
    }


});

module.exports = router;
