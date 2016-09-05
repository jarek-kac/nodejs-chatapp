var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/chat_db';

mongoose.connect(dbUrl, function(){
    console.log('mongodb connected');
});

module.exports = mongoose;