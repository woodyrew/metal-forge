var express = require('express');
var router = express.Router();
var path   = require('path');

// Subroutes
var webhooks = require('./webhooks');
var redirects = require('./redirects');

// Get config
var config = require(path.join(process.cwd(), 'config.json'));

router.get('/status', function (req, res) {
    res.sendStatus(JSON.stringify({status: 'ok'}));
});

// Webhooks
router.use('/' + config.path_to_webhook, webhooks);

// Redirects
router.use('/', redirects);

// Static site
router.use(express.static('site/live'));

module.exports = router;
