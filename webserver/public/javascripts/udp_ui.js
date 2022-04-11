"use strict";
// Client-side interactions with the browser.

var isMotionNotified = false;

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
  $('#modal-content').text("");
}

// Make connection to server when web page is fully loaded.
var socket = io.connect();
$(document).ready(function() {
	window.setInterval(function() {sendMonitorCommand('checkForMotion')}, 1000);
	window.setInterval(function() {sendMonitorCommand('checkForRecording')}, 3000);
  window.setInterval(function() {sendMonitorCommand('checkForAudio')}, 1000);

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];
	// When the user clicks on <span> (x), close the modal
	span.onclick = closeModal;
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = closeModal;

	$('#functionRecord').click(function(){
		sendMonitorCommand("record");
	});	
	
	$('#functionUpdateFrame').click(function(){
		sendMonitorCommand("updateFrame");
	});

  $('#functionStartPlayback1').click(function(){
		sendMonitorCommand("startPlayback1");
	});	

  $('#functionStartPlayback2').click(function(){
		sendMonitorCommand("startPlayback2");
	});	

  $('#functionStopPlayback').click(function(){
		sendMonitorCommand("stopPlayback");
	});

	socket.on('commandRecord', function(result) {
		preventRecording();
	});

	socket.on('commandUpdateFrame', function(result) {
    isMotionNotified = false;
	});	

	socket.on('commandUpdateMotion', function(result) {
		// Display modal
    if (result == "motion" && !isMotionNotified) {
      isMotionNotified = true;
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
      $('#modal-content').text("Motion Detected...");
    }
	});

	socket.on('commandUpdateRecording', function(result) {
		if (result == "noRecord") {
			allowRecording();
		}
		else {
			preventRecording();
		}
	});

  socket.on('commandAudioDetected', (result) => {
    if (result === "audioDetected") {
      $('#audio-detection').text("I hear sound...");
    } else {
      $('#audio-detection').text("No audio yet...");
    }
  })
});

function sendMonitorCommand(message) {
	socket.emit('monitor', message);
};

function allowRecording() {
	$("#functionRecord").prop("value", "Record");
	$("#functionRecord").prop('disabled', false);
}

function preventRecording() {
	$("#functionRecord").prop("value", "Recording...");
	$("#functionRecord").prop('disabled', true);
}