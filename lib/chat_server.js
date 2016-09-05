
var socketio = require('socket.io');
var chatStore = require('./chat_store');
var io;
var guestNumber = 1;
var nickNames = {};
var currentRoom = {};

exports.listen = function(server) {
	console.log ("Application starting");
	io = socketio.listen(server);
	io.set('log level', 1);
	//chatStore.createInitialRooms();
	chatStore.clearAllRooms();
	io.sockets.on('connection',
			function(socket) {
				guestNumber = generateGuestName(socket, guestNumber, nickNames);
				joinRoom(socket, 'MeetUp');
				handleMessageBroadcasting(socket, nickNames);
				handleNameChangeAttempts(socket, nickNames);
				handleRoomJoining(socket);
				socket.on('rooms', function() {
					chatStore.showAllActiveRooms(socket);
				});
				socket.on('roomAttenders', function(room){
					chatStore.getRoommAttenders(socket, room);
				});
				handleClientDisconnection(socket, nickNames);
			}
	);
};



function generateGuestName(socket, guestNumber, nickNames) {
	var name = 'Unknown' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success : true,
		name : name
	});
	return guestNumber + 1;
}

function joinRoom(socket, room) {
	  socket.join(room); 
	  currentRoom[socket.id] = room;
	  chatStore.handleJoinRoom(socket, room, nickNames[socket.id]);
	  socket.broadcast.to(room).emit('message', { 
	    text: nickNames[socket.id] + ' has joined ' + room + '.'
	  });
}


function handleNameChangeAttempts(socket, nickNames) {
	  socket.on('nameAttempt', function(name) { 
	     chatStore.handleNickNameChange(socket, name, currentRoom[socket.id]);
	  });
}


function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}


function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}



function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
	console.log('disconnect called');
	chatStore.handleChatLeaving(socket.id);
    delete nickNames[socket.id];
  });
}
