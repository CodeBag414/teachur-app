var mongoose = require('mongoose');
var db = require('../config/testDb');

mongoose.connect(db.url, function(){
    mongoose.connection.once('open', function() {
        mongoose.connection.db.dropDatabase(function() {
            console.log('test database dropped');
            process.exit();
        }); 
    });
});