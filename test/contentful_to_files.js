var config = require('./config.json');
var contentful_to_files = require('./modules/contentful_to_files');


var fetch_latest_json = (function (callback) {
    var process_files = contentful_to_files(config.contentful);
    process_files(callback);
}(function() {}));
