
function divEscapedContentElement(message, cssClass) {
  return  (cssClass && $('<div class='+cssClass+'></div>').text(message)) || $('<div></div>').text(message);
}
function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function addToChat(chatApp, socket) {
	  var message = $('#send-message').val();
	  chatApp.sendMessage($('#room').text(), message); 
	  $('#messages').append(divEscapedContentElement(message));
	  $('#messages').scrollTop($('#messages').prop('scrollHeight'));
	  $('#send-message').val('');
}


var socket = io.connect();
var currentRoom;
var dialog;
$(document).ready(function() {
	
	  var chatApp = new Chat(socket);
	  socket.on('nameResult', function(result) { 
	    var message;
	    if (result.success) {
	      message = 'You are now known as ' + result.name + '.';
	      $('#nick').text(result.name);
	    } else {
	      message = result.message;
	    }
	    $('#messages').append(divSystemContentElement(message));
	  });
	  socket.on('joinResult', function(result) { 
	    if (result.succ){
			$('#room').text(result.room);
		    currentRoom = result.room;
		    $('#messages').append(divSystemContentElement('Room changed.'));
	    } else {
	    	$('#messages').append(divSystemContentElement('Can not join '+result.room+ '. '+result.msgErr+'.'));
	    }
	  });
	  socket.on('message', function (message) { 
	    var newElement = $('<div></div>').text(message.text);
	    $('#messages').append(newElement);
	  });
	  socket.on('rooms', function(rooms) { 
	    $('#room-list').empty();
	    for(var room in rooms) {
	      if (rooms[room] === currentRoom){
	    	$('#room-list').append(divEscapedContentElement(rooms[room], 'current-room'));
	      } else {
	    	  $('#room-list').append(divEscapedContentElement(rooms[room])); 
	      }
	    }
	    $('#room-list div').click(function() { 
	      chatApp.joinRomm($(this).text());
	      $('#send-message').focus();
	    });
	  });
	  socket.on('roomAttenders', function(attenders){
		  $('#attenders-list').empty();
			 for (i=0; i < attenders.length; i++){
				 $('#attenders-list').append(divEscapedContentElement(attenders[i]));
			 } 
	  });
	  dialog = $("#changeNameForm").dialog({
	      autoOpen: false,
	      height: 200,
	      width: 350,
	      modal: true,
	      buttons: {
	        "Change my name": changeNickname,
	        Cancel: function() {
	          dialog.dialog( "close" );
	        }
	      }
	  });
	  $("#changeMyName").click(function() {
		    $("#changeNameForm").dialog("open");
		    return false;
	  });
	  function changeNickname(){
			chatApp.changeNick($('#nwck').val());
			dialog.dialog( "close" );
	  }
	  setInterval(function() { 
	    socket.emit('rooms');
	  }, 1000);
	  setInterval(function() { 
		  	//console.log(currentRoom);
		    socket.emit('roomAttenders', currentRoom);
		  }, 5000);
	  $('#send-message').focus();
	  $('#send-form').submit(function() {
		addToChat(chatApp, socket);
	    return false;
	  });
	});


