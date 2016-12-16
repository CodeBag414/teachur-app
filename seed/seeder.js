var _ = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var interestsData = require('./interests.json');
personalInterestsData = require('./personalInterests.json');

var db = require('../config/db');

mongoose.connect(process.env.MONGOLAB_URI || db.url);

var Interest = require('../app/models/interest');
var PersonalInterest = require('../app/models/personalInterest');
var User = require('../app/models/user');

Interest.find().then(function(interests) {
  if (!_.isEmpty(interests)) {
    console.log('No seed');
    process.exit();
  }

  return Promise.each(interestsData, seedInterest)
  .then(function() {
    return User.find();
  })
  .then(function(users) {
    console.log(users);
    return Promise.each(users, fixUserInterests);
  })
  .then(function() {
    return Promise.each(personalInterestsData, seedPersonalInterest)
  })
  .then(function() {
    process.exit();
  })
  .catch(function(err) {
    console.error('Error: ', err);
    process.exit();
  });
  
})
.catch(function(err) {
  console.error('Error: ', err);
  process.exit();
});

function fixUserInterests(user) {
  user.interests = [];
  return user.save();
};

function seedInterest(interest, i) {
  return Interest.create(interest);
};

function seedPersonalInterest(interest, i) {
  return PersonalInterest.create(interest);
};