// make contentful_to_files a module
// archive existing files to store/archive/{yyyy-mm-dd_hh-mm-ss}/*.json
// NEVER overwrite with empty files
var debug = require('debug');
var log   = debug('contentful_to_files');
var error = debug('contentful_to_files:error');

var contentful = require('contentful');
var fs         = require('fs');
var path       = require('path');
var util       = require('util');


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

    fs.writeFile(filepath, data, function (err) {
        if (err) {
            error(err);
        }
        log('Saved: ' + filepath);
    });
};

var contentful_to_files = function (config) {
    'use strict';

    var client     = contentful.createClient({
        // A valid access token within the Space
        accessToken: config.accessToken
      , space      : config.space.id
      , secure     : true

        // host: 'cdn.contentful.com'
    });

    var process_contentful = function (callback) {
        Object.keys(config.space.content_types).forEach(function(content_name) {
            var content_type = config.space.content_types[content_name];
            var filepath = path.resolve(config.space.location_to_store + content_name + '.json');

            // console.log("content_type", content_type, "content_name", content_name);
            // Get Assets using callback interface
            client.entries({'content_type': content_type, limit: 1000}, function(err, entries) {
                if (err) {
                    error(err);
                    callback(err);
                    return;
                }

                object_to_json_file(entries, filepath);
            });
        });
        callback(null, true);
    };

    return process_contentful;
};

module.exports = contentful_to_files;
