
var mongoose = require('./../config/config_db');

var chatRoom = new mongoose.Schema({
		  name: { type: String, required: true },
		  attenders: [ {suid: String, nick: String} ]
		});
		
module.exports = mongoose.model('ChatRoom', chatRoom); 