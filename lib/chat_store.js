
var ChatRoom = require('./../model/chat_room');

var maxUserInRoom = 20;

/**
 * Join room by user with given name.
 *
 * @param {socket} socket
 * @param {String} joinedRoom Room name to be joined.
 * @param {String} attender User name.
 * 
 */
exports.handleJoinRoom = function (socket, joinedRoom, attender){
	console.log('invoke handle join room');
		
		ChatRoom.findOne({name: joinedRoom}, function(err, chatRoom){
			if (err) return console.log(err);
			
			if (chatRoom.attenders.length < 20){ 
				var toInsert = true;
				for (var att in chatRoom.attenders){
					if (chatRoom.attenders[att].suid === socket.id){
						toInsert = false;
						break;
					}
				}
				if (toInsert){
					chatRoom.attenders.push({suid: socket.id, nick: attender});
					chatRoom.save(function(err, room) {
						  if (err) return console.log(err);
						  socket.emit('joinResult', {room: room.name, succ: true});
					});
				} else {
					socket.emit('joinResult', {room: chatRoom.name, succ: true});
				}
			} else{
				socket.emit('joinResult', {room: chatRoom.name, succ: false, msgErr: 'Maximum number of users in room'});
			}
		});
		
};

/**
 * List room attenders.
 *
 * @param {socket} socket
 * @param {String} croom Room name.
 * 
 */
exports.getRoommAttenders = function(socket, croom){
	ChatRoom.findOne({name: croom}, function(err, chatRoom){
		if (err) return console.log(err);
		if (chatRoom && chatRoom.attenders){
			var usersList = [];
			for (var i = 0, j=0; j= chatRoom.attenders.length, i < j; i++){
				usersList.push(chatRoom.attenders[i].nick);
			}
			socket.emit('roomAttenders', usersList);
		} else {
			socket.emit('roomAttenders', []);
		}
	});
};

/**
 * Initial room creation, util function invoked while environment setup.
 * 
 */
exports.createInitialRooms = function() {
	var roomNames = ["MeetUp", "Sport", "Movies", "Politics", "Business"];
	for (var room in roomNames){
		var chatRoom = new ChatRoom({name: roomNames[room], attenders: []});
		chatRoom.save(function(err, room) {
			  if (err) return console.log(err);
		});
	} 
};

/**
 * Show all rooms in chat application.
 *
 * @param {socket} socket
 * 
 */
exports.showAllActiveRooms = function(socket){
	ChatRoom.find(function(err, rooms) {
		  if (err) return console.log(err);
		  var allRooms = [];
		  for (var rm in rooms){
			  allRooms.push(rooms[rm].name);
		  }
		  socket.emit('rooms', allRooms);
	});
};


/**
 * Removes all attenders from all rooms, invoked while application start. 
 */
exports.clearAllRooms = function(){
	ChatRoom.find(function(err, rooms) {
		  if (err) return console.log(err);
		  var allRooms = [];
		  for (var rm in rooms){
			  var rm = rooms[rm];
			  rm.attenders = [];
			  rm.save(function(err, room) {
				  if (err) console.log(err);
			});
		  }
	});
};

/**
 * Change user name.
 *
 * @param {socket} socket
 * @param {String} newNick New nick.
 * @param {String} currentRoom User current room.
 * 
 */
exports.handleNickNameChange = function(socket, newNick, currentRoom){
	console.log('invoke handle nick change');
	ChatRoom.find({'attenders.nick': newNick}, function(err, roomsAtts) {
		  if (err) return console.log(err);
		  if (roomsAtts && roomsAtts.length > 0){
			  socket.emit('nameResult', { 
				success: false,
		        message: 'That name is already in use.'
		      });
		  } else {
			  ChatRoom.find({'attenders.suid': socket.id}, function(err, roomsToMod) {
				  if (err) return console.log(err);
				  var previousName;
				  for (var rm in roomsToMod){
					  var currRoom = roomsToMod[rm];
					  for (var i = 0, j=0; j= currRoom.attenders.length, i < j; i++){
							if (currRoom.attenders[i].suid === socket.id){
								if (!previousName){
									previousName = currRoom.attenders[i].nick;
								}
								currRoom.attenders[i].nick = newNick;
							}
						}
					  currRoom.save(function(err, room) {
						  if (err) console.log(err);
					});
				  }
				  socket.emit('nameResult', {
			          success: true,
			          name: newNick
			        });
				    socket.broadcast.to(currentRoom).emit('message', {
			          text: previousName + ' is now known as ' + newNick + '.'
			        });
			  });
			  
		  }
	});
};

/**
 * Disconnection by given user handling.
 *
 * @param {socket} socket
 * 
 */
exports.handleChatLeaving = function(socketId){
	console.log('invoke romm disconnection handler');
	ChatRoom.find({'attenders.suid': socketId}, function(err, roomsToMod) {
		  if (err) return console.log(err);
		  for (var rm in roomsToMod){
			  var currRoom = roomsToMod[rm];
			  for (var i = 0, j=0; j= currRoom.attenders.length, i < j; i++){
					if (currRoom.attenders[i].suid === socketId){
						currRoom.attenders.splice(i, 1);
					}
				}
			  currRoom.save(function(err, room) {
				  if (err) console.log(err);
			});
		  }
	
		});
};



