var Metalsmith  = require('metalsmith');
var debug       = require('metalsmith-debug');
var markdown    = require('metalsmith-markdown');
var templates   = require('metalsmith-templates');
var contentful  = require('contentful-metalsmith');

var Handlebars  = require('handlebars');

var apis        = require('./api_keys.json');

Handlebars.registerHelper("log", function(something) {
  console.log(something);
});

var list_files = function(files, metalsmith, done) {
    for (var file in files) {
        console.log(file);
    }
    done();
};
var file_details = function(files, metalsmith, done) {
    console.log(files);
    done();
};

var addContentfulSpaceID = function(config) {
    return function(files, metalsmith, done) {
        for (var file in files) {
            var _f = files[file];
            if (!_f.contentful.space_id) {
                _f.contentful.space_id = apis.contentful.spaces.pages.id;
            }
        }
        done();
    };
};

Metalsmith(__dirname)
    .source('./src')
    .use(debug())
    .use(markdown())
    .use(addContentfulSpaceID())
    .use(contentful({
        accessToken: apis.contentful.accessToken
    }))
    // .use(list_files)
    .use(templates({
        engine: 'handlebars',
        directory: 'templates',
        partials: {
            header: 'partials/header',
            footer: 'partials/footer'
        }
    }))
    .destination('./site')
    .build(function (err) { if(err) console.log(err) });
