	var Chat = function(socket) {
		this.socket = socket;
	};


	Chat.prototype.sendMessage = function(room, text) {
	  var message = {
	    room: room,
	    text: text
	  };
	  this.socket.emit('message', message);
	};
	
	Chat.prototype.changeRoom = function(room) {
		  this.socket.emit('join', {
			      newRoom: room
			    });
	};
	
	Chat.prototype.joinRomm = function(roomName) {
		this.changeRoom(roomName);
	};
	
	Chat.prototype.changeNick = function(newNick){
		this.socket.emit('nameAttempt', newNick);
	};