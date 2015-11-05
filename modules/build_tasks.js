var async  = require('async');
var Promise = require('bluebird');
var path   = require('path');

var debug = require('debug');
var log   = debug('metal-forge_process');
var error = debug('metal-forge_process:error');

// Get config
var config = require(path.join(process.cwd(), 'config.json'));

var codebase          = require('builder_codebase');
var fetch_latest_json = Promise.promisify(require('contentful_to_files')(config.contentful));
var init_codebase     = require('init_codebase')(config.builder);


var trigger_build = function (webhook_name) {
    'use strict';
    log('Building... Triggered by %s', webhook_name);

    fetch_latest_json()
        .catch(error)
        .finally(function () {
            async.series(
                {
                    check  : codebase.check
                    , pull : codebase.pull
                    , npm  : codebase.npm
                    , build: codebase.build
                    , copy : codebase.copy_to_serve
                },
                function (err, results) {
                    if (err) {
                        error(err);
                    }

                    log('%s Build Complete: %o', webhook_name, results);
                }
            );
        });

    // TODO: archive existing files to store/archive/{yyyy-mm-dd_hh-mm-ss}/*.json
    // TODO: NEVER overwrite with empty files

    // TODO: keep latest 20
};

var init_build = function () {
    'use strict';

    if (!config.contentful) {
        error("contentful isn't defined in `config.json`");
        throw new Error("contentful isn't defined in `config.json`");
    }
    if (!config.builder) {
        error("builder isn't defined in `config.json`");
        throw new Error("builder isn't defined in `config.json`");
    }
    if (!config.json_files) {
        error("json_files isn't defined in `config.json`");
        throw new Error("json_files isn't defined in `config.json`");
    }

    async.series(
        {
            clone  : init_codebase
            , pull : codebase.pull
            , npm  : codebase.npm
            , build: codebase.build
            , copy : codebase.copy_to_serve
        },
        function (err, results) {
            if (err) {
                error(err);
            }

            log('Initial build complete: %o', results);
        }
    );
};

module.exports = {
    trigger_build: trigger_build
    , init_build : init_build
};
