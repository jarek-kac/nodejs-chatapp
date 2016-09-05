var http  = require('http'); 
var fs    = require('fs'); 
var path  = require('path'); 
var mime  = require('mime'); 
var cache = {};
var express = require('express');

function send404(response) {
	  response.writeHead(404, {'Content-Type': 'text/plain'});
	  response.write('Error 404: resource not found.');
	  response.end();
}

var app = express();

var env = process.env.NODE_ENV || 'development';
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	   res.render('index', {chat: 'Simple chat v 0.1'});
});

var server = app.listen(8081, function () {

	  var host = server.address().address;
	  var port = server.address().port;

	  console.log("Example app listening at http://%s:%s", host, port);

	});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

