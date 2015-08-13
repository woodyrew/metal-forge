var express = require('express');
var router = express.Router();
var path   = require('path');

// Subroutes
var webhooks = require('./webhooks');

// Get config
var config = require(path.join(process.cwd(), 'config.json'));

router.get('/status', function (req, res) {
    res.send({status: 'ok'});
});

// Webhooks
router.use('/' + config.path_to_webhook, webhooks);
// Static site
router.use(express.static('site/live'));

module.exports = router;
