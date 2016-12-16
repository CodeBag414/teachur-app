var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require("bluebird");
var Settings = require('./settings');
var mandrill = require('../lib/mandrill');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var _ = require('lodash');
var moment = require('moment');
var Degree = require('./degree');

var userSchema = mongoose.Schema({
  email: {type: String},
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  username: String,
  password: String,
  isTeacher: Boolean,
  isStudent: Boolean,
  admin: {type: Boolean, default: false},
  accessToken: String,
  facebookId: String,
  twitterId: String,
  googleId: String,
  googleImage: String,
  twitterImage: String,
  facebookImage: String,
  croppedImage: {type: mongoose.Schema.ObjectId, ref: 'Image'},
  image: {type: mongoose.Schema.ObjectId, ref: 'Image'},
  confirmed: Boolean,
  confirmationToken: String,
  resetPasswordToken: String,
  myObjectives: [
    {type: mongoose.Schema.ObjectId, ref: 'Objective'}
  ],
  myLessons: [
    {type: mongoose.Schema.ObjectId, ref: 'Lesson'}
  ],
  myCourses: [
    {type: mongoose.Schema.ObjectId, ref: 'Course'}
  ],
  myDegrees: [
    {type: mongoose.Schema.ObjectId, ref: 'Degree'}
  ],
  profession: {type: String},
  company: {type: String},
  subscribed: {type: Boolean, default: false},
  lastActive: Date,
  degrees: [
    { name: String }
  ],
  social: {
    twitter: String,
    website: String,
    google: String,
    linkedin: String,
    quora: String,
    github: String
  },
  bio: String,
  interests: [
    {
      type: mongoose.Schema.ObjectId, ref: 'Interest'
    }
  ],
  personalInterests: [
    {
      type: mongoose.Schema.ObjectId, ref: 'PersonalInterest'
    }
  ],
  language: String,
  welcomed: Boolean,
  enrolledDegrees: [{type: mongoose.Schema.ObjectId, ref: 'Degree'}],
  enrolledCourses: [{type: mongoose.Schema.ObjectId, ref: 'Course'}],
  completedObjectives: [{type: mongoose.Schema.ObjectId, ref: 'Objective'}],
  testedObjectives: [{type: mongoose.Schema.ObjectId, ref: 'Objective'}],
  mandatoryCourses: [{type: mongoose.Schema.ObjectId, ref: 'Course'}],
  streak: Number,
  organizationSlug: String,
  projects: [
    {
      project: {type: mongoose.Schema.ObjectId, ref: 'Project'},
      file: {type: mongoose.Schema.ObjectId, ref: 'File'}
    }
  ]
}, 
{
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

userSchema.plugin(deepPopulate);

userSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.__v;
    ret.completionStatuses = doc.completionStatuses;
    return ret;
  }
};

userSchema
.virtual('completionStatuses');

userSchema.methods.verifyPassword = function (password) {
  var user = this;

  return bcrypt.compareSync(password, user.password);
};

userSchema.methods.getLanguage = function () {
  var user = this;

  return user.language || 'en';
};

userSchema.methods.calculateStreak = function () {
  var user = this;
  user.streak = user.streak || 1;
  var today = moment();
  var lastActive = moment(user.lastActive);

  if (today.diff(lastActive, 'days') > 1) {
    user.streak = 1;
  } else if (today.diff(lastActive, 'days') === 1) {
    user.streak++;
  }

  user.lastActive = Date.now();
};

userSchema.methods.addToMyModules = function addToMyModules(module, moduleName, cb) {
  if (moduleName === 'objective') {
    return addToMyObjectives(module, this, cb);
  } else if (moduleName === 'lesson') {
    return addToMyLessons(module, this, cb);
  } else if (moduleName === 'course') {
    return addToMyCourses(module, this, cb);
  } else if (moduleName === 'degree') {
    return addToMyDegrees(module, this, cb);
  } else {
    cb();
  }
};

userSchema.methods.sendForgotPasswordEmail = function sendForgotPasswordEmail(cb) {
  var user = this;

  var urlBase = process.env.URL || 'http://localhost:8080';
  user.resetPasswordToken = crypto.createHash('md5').update(user._id + user.email + new Date).digest('hex');

  return user
  .save()
  .then(function() {
    return Settings.findOne({ key: 'forgotPasswordTemplate' })
  })
  .then(function(setting) {

    var data = {
      forgotPasswordUrl: !user.organizationSlug || user.organizationSlug === 'main' ? urlBase + "/app#/resetPassword/" + user.resetPasswordToken : urlBase + "/org/" + user.organizationSlug + "#/resetPassword/" + user.resetPasswordToken
    }

    return mandrill.sendTemplate(user.email, setting.value, data)
  })
  .then(function() {
    cb();
  })
  .catch(function(err) {
    console.error(err.stack || err);
    cb(err);
  });
};

userSchema.methods.enroll = function (itemName, itemId) {
  var user = this;
  var enrolledItems = itemName === 'degree' ? user.enrolledDegrees || [] : user.enrolledCourses || [];
  
  var enrolledItemIds = _.map(enrolledItems, function(item) {
    return _.get(item, '_id', item);
  });

  var index = _.findIndex(enrolledItemIds, function(id) {
    return id.toString() === itemId;
  });

  if (index === -1) {
    itemName === 'degree' ? user.enrolledDegrees.push(itemId) : user.enrolledCourses.push(itemId);
  }

  if (itemName === 'course') {
    return new Promise(function(resolve, reject) {
      return user
      .save(resolve, reject);
    });
  }

  return Degree
  .findById(itemId)
  .then(function(degree) {
    var degreeComponentIds = _.map(degree.components, function(component) {
      return component.toString();
    });

    user.enrolledCourses = _.union(user.enrolledCourses, degreeComponentIds);

    return user.save();
  });

};

userSchema.methods.dropOut = function (itemName, itemId) {
  var user = this;
  var enrolledItems = itemName === 'degree' ? user.enrolledDegrees || [] : user.enrolledCourses || [];
  
  var enrolledItemIds = _.map(enrolledItems, function(item) {
    return _.get(item, '_id', item);
  });

  var index = _.findIndex(enrolledItemIds, function(id) {
    return id.toString() === itemId;
  });

  if (index !== -1) {
    itemName === 'degree' ? user.enrolledDegrees.splice(index, 1) : user.enrolledCourses.splice(index, 1);
  }

  return user
  .save();

};

userSchema.methods.toggleComplete = function (objectiveId) {
  var user = this;

  var objectiveIndex = _.findIndex(user.completedObjectives, function(id) {
    return id.toString() === objectiveId;
  });

  if (objectiveIndex === -1) {
    user.completedObjectives.push(objectiveId);
  } else {
    user.completedObjectives.splice(objectiveIndex, 1);
  }

  return user
  .save();

};

userSchema.methods.updateMandatoryCourses = function (courseIds) {
  var user = this;
  user.mandatoryCourses = courseIds || user.mandatoryCourses || [];

  return Promise.each(courseIds, function(courseId) {
    return user.enroll('course', courseId)
  })
  .then(function(userArray) {
    return userArray[0];
  });
};

userSchema.pre('save', function (next) {
  var user = this;

  if (user.isNew && user.email) {

    var urlBase = process.env.URL || 'http://localhost:8080';
    user.confirmationToken = crypto.createHash('md5').update(user._id + user.email + new Date).digest('hex');

    var data = {
      confirmUrl: !user.organizationSlug || user.organizationSlug === 'main' ? urlBase + "/app#/confirmEmail/" + user.confirmationToken : urlBase + "/org/" + user.organizationSlug + "#/confirmEmail/" + user.confirmationToken
    }

    return Settings
    .findOne({ key: 'welcomeTemplate' })
    .then(function(setting) {
      return mandrill.sendTemplate(user.email, setting.value, data)
    })
    .then(function() {
      next();
    })
    .catch(function(err) {
      console.error(err.stack || err);
      next(err);
    });
  } else {
    next();
  }

});

userSchema.pre('save', function (next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

var addToMyObjectives = function (objective, user, cb) {
  if (user.myObjectives.indexOf(objective._id) === -1) {
    user.myObjectives.push(objective._id);
    user.save(cb);
  } else {
    var itemIndex = user.myObjectives.indexOf(objective._id);
    user.myObjectives.splice(itemIndex, 1);
    user.save(cb);
  }
};

var addToMyLessons = function (lesson, user, cb) {
  if (user.myLessons.indexOf(lesson._id) === -1) {
    user.myLessons.push(lesson._id);
    user.save(cb);
  } else {
    var itemIndex = user.myLessons.indexOf(lesson._id);
    user.myLessons.splice(itemIndex, 1);
    user.save(cb);
  }
};

var addToMyCourses = function (course, user, cb) {
  if (user.myCourses.indexOf(course._id) === -1) {
    user.myCourses.push(course._id);
    user.save(cb);
  } else {
    var itemIndex = user.myCourses.indexOf(course._id);
    user.myCourses.splice(itemIndex, 1);
    user.save(cb);
  }
};

var addToMyDegrees = function (degree, user, cb) {
  if (user.myDegrees.indexOf(degree._id) === -1) {
    user.myDegrees.push(degree._id);
    user.save(cb);
  } else {
    var itemIndex = user.myDegrees.indexOf(degree._id);
    user.myDegrees.splice(itemIndex, 1);
    user.save(cb);
  }
};

module.exports = mongoose.model('User', userSchema);