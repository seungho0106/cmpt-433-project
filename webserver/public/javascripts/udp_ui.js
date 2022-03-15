"use strict";
// Client-side interactions with the browser.

// Make connection to server when web page is fully loaded.
var socket = io.connect();
$(document).ready(function() {

	$('#functionTest').click(function(){
		sendMonitorCommand("test");
	});

	socket.on('commandTest', function(result) {
		$('#status-text').text(result);
	});
	
});

function sendMonitorCommand(message) {
	socket.emit('monitor', message);
};