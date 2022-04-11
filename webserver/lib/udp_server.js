"use strict";
/*
 * Respond to commands over a websocket to relay UDP commands to a local program
 */

var socketio = require('socket.io');
var io;

var dgram = require('dgram');

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level 1');

	io.sockets.on('connection', function(socket) {
		handleCommand(socket);
	});
};

function handleCommand(socket) {
	// Parsed command to relay
	socket.on('monitor', function(data) {
		console.log('monitor command: ' + data);

		// Info for connecting to the local process via UDP
		var PORT = 12345;
		var HOST = '127.0.0.1';
		var buffer = new Buffer(data);

		var client = dgram.createSocket('udp4');
		client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
			if (err) 
				throw err;
			console.log('UDP message sent to ' + HOST +':'+ PORT);
		});

		client.on('listening', function () {
			var address = client.address();
			console.log('UDP Client: listening on ' + address.address + ":" + address.port);
		});
		// Handle an incoming message over the UDP from the local application.
		client.on('message', function (message, remote) {
			console.log("UDP Client: message Rx" + remote.address + ':' + remote.port +' - ' + message);
			var reply = message.toString('utf8');
			if (reply === "recording") {
				socket.emit('commandRecord', reply);
			} else if (reply === "updating") {
				socket.emit("commandUpdateFrame", reply);
			}	else if (reply === "motion") {
				socket.emit("commandUpdateMotion", reply);
			}	else if (reply === "record" || reply === "noRecord") {
				socket.emit("commandUpdateRecording", reply);
			} else if (reply === "audioDetected" || reply === "audioNotDetected") {
        socket.emit("commandAudioDetected", reply);
      }

			client.close();

		});
		client.on("UDP Client: close", function() {
			console.log("closed");
		});
		client.on("UDP Client: error", function(err) {
			console.log("error: ", err);
		});
	});
};