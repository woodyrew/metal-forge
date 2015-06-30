var contentful = require('contentful');
var config     = require('./config.json').contentful;
var fs         = require('fs');
var path       = require('path');
// var util       = require("util");

var client     = contentful.createClient({
	// A valid access token within the Space
	accessToken: config.accessToken
  , space      : config.space.id
  , secure     : true

	// host: 'cdn.contentful.com'
});


var stringed = function (data) {
	'use strict';
	// Convert circular references to [Circular]. See:
	// http://stackoverflow.com/questions/30236820/typeerror-converting-circular-structure-to-json-find-error-in-json
	// return util.inspect(data, {"depth" : null});
	return JSON.stringify(data);
};


var object_to_json_file = function (data, filename) {
	'use strict';

	var file_location = path.resolve(__dirname, config.space.location_to_store + filename + '.json');
	data = stringed(data);

	fs.writeFile(file_location, data, function (err) {
		if (err) {
			throw err;
		}
		console.log('Saved: ' + file_location);
	});
};

// Get Space
// client.space().then(console.log, console.log);

// Get Content Types
// client.contentTypes().then(console.log, console.log);


Object.keys(config.space.content_types).forEach(function(content_name) {
	'use strict';
	var content_type = config.space.content_types[content_name];

	// console.log("content_type", content_type, "content_name", content_name);
	// Get Assets using callback interface
	client.entries({'content_type': content_type}, function(err, entries) {
		if (err) { console.log(err); return; }

		object_to_json_file(entries, content_name);
	});
});
