var mongoose = require('mongoose');

var db = require('../config/testDb');

mongoose.connect(db.url);

var User = require('../app/models/user');

User.findOne({username: 'anovoselnik'}).then(function(user) {
  if (!user) {
    var user = new User({username: 'anovoselnik', password: 131213, confirmed: true, isTeacher: true, welcomed: true});
    return user.save().then(function() {
        console.log('created user');
        process.exit();
    });
  } else {
    process.exit();
  }
});