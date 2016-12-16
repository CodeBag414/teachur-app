var _ = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var db = require('../config/db');

mongoose.connect(process.env.MONGOLAB_URI || db.url);

var User = require('../app/models/user');

User.find().then(function(users) {
  Promise.each(users, function(user) {
    return fixUserInterests(user);
  })
  .then(function() {
    process.exit();
  })
});

function fixUserInterests(user) {
  user.interests = null;
  return user.save().then(function(user) {
    user.interests = [];
    return user.save();
  });
};