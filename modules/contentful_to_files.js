// make contentful_to_files a module
// archive existing files to store/archive/{yyyy-mm-dd_hh-mm-ss}/*.json
// NEVER overwrite with empty files
var debug = require('debug');
var log   = debug('contentful_to_files');
var error = debug('contentful_to_files:error');

var Promise    = require('bluebird');
var fs         = Promise.promisifyAll(require('fs'));
var path       = require('path');
var util       = require('util');
var contentful = require('contentful');


var stringed = function (data) {
    'use strict';
    // Check for circular references by converting to to [Circular]. See:
    // http://stackoverflow.com/questions/30236820/typeerror-converting-circular-structure-to-json-find-error-in-json
    if (util.inspect(data, {'depth': null}).indexOf('[Circular]') !== -1) {
        error('Contentful data contains circular references, check Container Definitions');
        return '';
    }
    else {
        return JSON.stringify(data);
    }
};

var object_to_json_file = function (data, filepath) {
    'use strict';

    data = stringed(data);

    return fs.writeFileAsync(filepath, data)
        .then(function () {
            log('Saved: ' + filepath);
        })
        .catch(error);
};

var contentful_to_files = function (config) {
    'use strict';

    var client     = Promise.promisifyAll(contentful.createClient({
        // A valid access token within the Space
        accessToken: config.accessToken
        , space    : config.space.id
        , secure   : true
        //, host     : 'preview.contentful.com'
    }));

    var process_contentful = function (callback) {
        Promise.map(Object.keys(config.space.content_types), function (content_name) {
            var content_type = config.space.content_types[content_name];
            var filepath = path.resolve(config.space.location_to_store + content_name + '.json');

            log('Processing: %s', content_name);
            return client.entriesAsync({'content_type': content_type, limit: 1000})
                .then(function (entries) {
                    log('Attempting to save: %s', content_name);
                    return object_to_json_file(entries, filepath);
                })
                .catch(error);

        }).then(function () {
            log('Finished');
            callback(null, true);
        })
        .catch(callback);
    };

    return process_contentful;
};

module.exports = contentful_to_files;
