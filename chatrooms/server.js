var http	= require('http');
var fs		= require('fs');
var path	= require('path');
var mime	= require('mime');
var cache	= {};

function send404(response, details) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.write(details);
	response.end();
}


function sendFile(response, filePath, fileContents) {
	response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	}
	else {
		fs.exists(absPath, function(exists){
			if (exists){
				fs.readFile(absPath, function(err, data){
					if (err) {
						send404(response, 'Read file failed.');
					}
					else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			}
			else {
				send404(response, absPath + ' is not exist.');
			}
		});
	}
}

var server = http.createServer(function(request, response){
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	}
	else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(8889, function(){
	console.log("Server listening on port 8889.");
});

var chatServer = require('./lib/chat-server.js');
chatServer.listen(server);
