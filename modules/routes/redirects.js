var debug    = require('debug');
var log      = debug('metal-forge_redirects');
var error    = debug('metal-forge_redirects:error');

var _        = require('lodash');
var express  = require('express');
var router   = express.Router();

// Get config
var redirects = {};
try {
    redirects = require('../../redirects.json');
}
catch (e) {
    error('No redirects.json located');
}

router.use('/', function (req, res, next) {
    'use strict';
    var target = _.result(_.findWhere(redirects, {source: req.url}), 'target');
    if (target) {
        log('Redirecting from: %s', req.url);
        log('Redirecting to: %s', target);
        return res.redirect(301, target);
    }
    return next();

});

module.exports = router;
