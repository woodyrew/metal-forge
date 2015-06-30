// var path = require('path');
var Hapi = require('hapi');
var server  = new Hapi.Server();
var port    = process.env.PORT || 5000;

server.connection({ port: port });

server.route({
    method : 'GET'
  , path   : '/{param*}'
  , handler: {
        directory: {
            path: 'public'
        }
    }
});

server.start();
