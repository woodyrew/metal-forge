var contentful  = require('contentful');
var config = require('./api_keys.json').contentful;

var client = contentful.createClient({
  // A valid access token within the Space
  accessToken: config.accessToken,

  // ID of Space
  space: config.spaces.pages.id,

  // Enable or disable SSL. Enabled by default.
  secure: true

  // // Set an alternate hostname, default shown.
  // host: 'cdn.contentful.com'
});




var log = console.log.bind(console); // wat

// Get Space
client.space().then(log, log);

// Get all Entries
client.entries().then(log, log);

// Get Assets using callback interface
client.entries({}, function(err, entries) {
  if (err) { console.log(err); return; }
  console.log(entries);
});