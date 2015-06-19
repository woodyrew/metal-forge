var Metalsmith  = require('metalsmith');
var debug       = require('metalsmith-debug');
var markdown    = require('metalsmith-markdown');
var templates   = require('metalsmith-templates');
var collections = require('metalsmith-collections');
var permalinks  = require('metalsmith-permalinks');
var less        = require('metalsmith-less');
var webpack     = require('metalsmith-webpack');
var contentful  = require('contentful-metalsmith');

var Handlebars  = require('handlebars');
var fs          = require('fs');
var path        = require('path');

var apis        = require('./api_keys.json');

var log = function(files, metalsmith, done) {
    for (var file in files) {
    	console.log(file);
    }
    done();
};

var findTemplate = function(config) {
    var pattern = new RegExp(config.pattern);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (pattern.test(file)) {
                var _f = files[file];
                if (!_f.template) {
                    _f.template = config.templateName;
                }
            }
        }
        done();
    };
};

var removeSource = function(config) {

	var pattern = new RegExp(config.pattern);

	var keep = config.keep || '^&$';
	var keep_pattern = new RegExp(keep);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (pattern.test(file) && !keep_pattern.test(file)) {
                delete(files[file]);
            }
        }
        done();
    };
};

Handlebars.registerHelper("log", function(something) {
  console.log(something);
});

console.log(apis.contentful);

Metalsmith(__dirname)
	.source('./src')
	.use(debug())
	// .use(less({
	// 	pattern: 'styles/*.less'
	// }))
 //    .use(removeSource({
 //        pattern: '\.less$'
 //    }))
 //    .use(webpack({
	// 	context: path.resolve(__dirname, './src/js/'),
	// 	entry: './index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, './site/js/'),
	// 		filename: 'bundle.js'
	// 	}
	// }))
 //    .use(removeSource({
 //        pattern: '\.js$',
 //        keep: 'bundle\.js$'
 //    }))
	.use(markdown())
    .use(contentful({
    	accessToken: apis.contentful.accessToken
    }))
	// .use(findTemplate({
 //        pattern: 'posts',
 //        templateName: 'post.hbs'
 //    }))
	// .use(collections({
	// 	pages: {
	// 		pattern: 'content/pages/*.md'
	// 	},
	// 	posts: {
	// 		pattern: 'content/posts/*.md',
	// 		sortBy: 'date',
	// 		reverse: true
	// 	}
	// }))
	// .use(log)
	// .use(permalinks({
	// 	pattern: ':collection/:title'
	// }))
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
