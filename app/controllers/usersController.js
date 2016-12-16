// Load required packages
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');
var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();
var getCompletionStatuses = require('../lib/getCompletionStatuses');

var userPerformanceDeepPopulateOptions = {
    populate: {
        'completedObjectives': {
            select: '_id, name'
        }
    },
};

// Create endpoint /api/users for GET
exports.getCurrentUser = function (req, res) {
    var userId = req.user._id;

    req.models.User.findById(userId).deepPopulate('image myObjectives myLessons myCourses myCourses.image myDegrees.image myDegrees.components.image croppedImage interests personalInterests completedObjectives enrolledDegrees enrolledCourses enrolledDegrees.components.components.components enrolledCourses.components.components enrolledCourses.image enrolledDegrees.components.image mandatoryCourses projects projects.project projects.file', userPerformanceDeepPopulateOptions).exec(function (err, user) {
        if (err)
            return res.send(err);

        user.calculateStreak();

        user.save().then(function() {
            user = user.toJSON();
            user.completionStatuses = getCompletionStatuses(user);
            user = optimizeUser(user);
            res.json(user);
        }, function(err) {
            console.error(err.stack || err);
            res.status(500).send(err);
        });
    });
};

exports.getInvitedUsers = function (req, res) {
    var userId = req.user._id;
    req.models.WannabeUser.find({ invitedBy: userId }).exec(function (err, users) {
        if (err)
            return res.send(err);

        return res.json(users);
    });
};


exports.populateUserFields = function (req, userId, fields, callback) {
    req.models.User.findById(userId).deepPopulate(fields || 'image myObjectives myLessons myCourses myCourses.image myDegrees.image myDegrees.components.image croppedImage interests personalInterests completedObjectives enrolledDegrees enrolledCourses enrolledDegrees.components.components.components enrolledCourses.components.components enrolledCourses.image enrolledDegrees.components.image').exec(function (err, user) {
        if (err) {
            return false;
        }
        if (typeof callback === 'function') {
            callback(user);
        }
    });
};

exports.updateCurrentUser = function (req, res) {
    var user = req.user;
    var data = req.body;

    user.username = data.username;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.email = data.email;
    user.profession = data.profession;
    user.company = data.company;
    user.degrees = data.degrees;
    user.social = data.social;
    user.interests = _.map(data.interests, '_id');
    user.bio = data.bio;
    user.personalInterests = _.map(data.personalInterests, '_id');
    user.welcomed = data.welcomed || user.welcomed;
    user.isTeacher = data.isTeacher || !data.isStudent;
    user.isStudent = data.isStudent;
    user.projects = data.projects || user.projects;

    user.save(function (err) {
        req.models.User.findById(user._id).populate('image croppedImage interests personalInterests').exec(function (err, user) {
            if (err)
                return res.send(err);

            res.json(user);
        });
    });
};

exports.addToMyModules = function (req, res) {
    var user = req.user;
    var data = req.body;

    user.addToMyModules(data.module, data.moduleName, function () {
        res.json({success: true});
    });
};

exports.confirmEmail = function (req, res) {
    var data = req.body;
    req.models.User.findOne({confirmationToken: data.confirmationToken}).exec(function (err, user) {
        if (err)
            return res.send(err);

        if (user) {
            user.confirmed = true;

            user.save(function (err) {
                if (err)
                    return res.send(err);

                res.json({success: true});
            });
        } else {
            res.json({success: false});
        }

    })
};

exports.forgotPassword = function (req, res) {
    var data = req.body;
    req.models.User.findOne({$or: [{username: data.userId}, {email: data.userId}]}).exec(function (err, user) {
        if (err)
            return res.send(err);

        if (user) {
            user.sendForgotPasswordEmail(function (err) {
                if (err)
                    return res.send(err);

                res.json({success: true});
            });
        } else {
            res.status(404).send('Not found');
        }

    })
};

exports.resetPassword = function (req, res) {
    var data = req.body;

    req.models.User.findOne({resetPasswordToken: data.resetPasswordToken}).exec(function (err, user) {
        if (err)
            return res.send(err);

        if (user) {
            user.password = data.newPassword;
            user.resetPasswordToken = null;

            user.save(function (err) {
                if (err)
                    return res.send(err);

                res.json({success: true});
            });
        } else {
            res.status(404).send('Not found');
        }

    })
};

// GET /api/users
exports.getAll = function (req, res) {
    var limit = req.query.limit;
    var skip = (req.query.page - 1) * req.query.limit;
    var order = req.query.order || 'name';
    var searchField = req.query.searchField;
    var query = {};
    var response = {};

    var searchText = new RegExp(req.query.searchText, 'i');

    if (searchField) {
        query[searchField] = { $regex: searchText };
    }

    if (!req.user.admin) {
        return res.status(403).send('Forbidden');
    }

    return req.models.User
    .find(query)
    .count()
    .exec()
    .then(function(count) {
        response.count = count;
        return req.models.User
        .find(query)
        .limit(limit)
        .skip(skip)
        .sort(order)
        .exec();
    })
    .then(function(users) {
        response.items = users;
        return res.json(response);
    });
};

exports.getOne = function (req, res) {
    req.models.User
    .findById(req.params.id)
    .deepPopulate('image croppedImage mandatoryCourses completedObjectives enrolledDegrees enrolledCourses enrolledDegrees.components.components.components enrolledCourses.components.components')
    .then(function (user) {

        user = user.toJSON();
        user.completionStatuses = getCompletionStatuses(user);

        res.json(user);
    })
    .catch(function (err) {
        return res.send(err);
    });
};


// PUT /api/users/1
exports.update = function (req, res) {
    var currentUser = req.user;
    var data = req.body;

    req.models.User.findById(req.params.id, function (err, user) {

        if (currentUser.admin) {
            user.username = data.username || user.username;
            user.firstName = data.firstName || user.firstName;
            user.lastName = data.lastName || user.lastName;
            user.email = data.email || user.email;
            user.profession = data.profession || user.profession;
            user.company = data.company || user.company;
            user.degrees = data.degrees || user.degrees;
            user.social = data.social || user.social;
            user.interests = data.interests || user.interests;
            user.personalInterests = data.personalInterests || user.personalInterests;
            user.welcomed = data.welcomed || user.welcomed;
            user.bio = data.bio || user.bio;
            user.admin = data.admin;
            user.isTeacher = data.isTeacher || !data.isStudent;
            user.isStudent = data.isStudent;

            user.save(function (err) {
                if (err)
                    return res.send(err);

                req.models.User.findById(req.params.id).populate('image croppedImage').exec(function (err, user) {
                    if (err)
                        return res.send(err);

                    res.json(user);
                });

            });
        } else {
            res.status(403).send('Forbidden');
        }

    });
};

exports.delete = function (req, res) {

    req.models.User.findById(req.params.id).exec(function (err, user) {
        if (err)
            return res.send(err);

        var currentUser = req.user;
        if (currentUser.admin) {
            user.remove(function (err, success) {
                if (err)
                    return res.send(err);

                res.json({success: true});
            })
        } else {
            res.status(403).send('Forbidden');
        }
    });
};

exports.checkUsername = function (req, res) {
    var username = req.body.username;
    var usernameTaken = false;

    req.models.User.findOne({username: username}).exec(function (err, user) {
        if (err)
            return res.send(err);

        if (user) {
            usernameTaken = true;
        }

        res.json({usernameTaken: usernameTaken});
    })
};

exports.getObjectives = function (req, res) {
    var authorId = req.params.id;

    req.models.Objective.find({author: authorId}).exec(function (err, modules) {
        if (err)
            return res.send(err);

        res.json(modules);
    });
};

exports.getLessons = function (req, res) {
    var authorId = req.params.id;

    req.models.Lesson.find({author: authorId}).exec(function (err, modules) {
        if (err)
            return res.send(err);

        res.json(modules);
    });
};

exports.getCourses = function (req, res) {
    var authorId = req.params.id;

    req.models.Course.find({author: authorId}).populate('image').exec(function (err, modules) {
        if (err)
            return res.send(err);

        res.json(modules);
    });
};

exports.getDegrees = function (req, res) {
    var authorId = req.params.id;

    req.models.Degree
    .find({$or: [{published: true, private: false, author: authorId}]})
    .deepPopulate('author relatedDegrees prerequisites components components.image')
    .then(function (degrees) {
        res.json(degrees);
    });
};

exports.getFavorited = function (req, res) {
    modelMap.init(req.models);
    var currentUser = req.user;
    var modelName = req.params.modelName;
    var pathMap = {
        degree: 'myDegrees',
        course: 'myCourses',
        lesson: 'myLessons',
        objective: 'myObjectives'
    }

    if (modelName !== 'degree') {
        return modelMap[modelName]
        .find({ _id: { $in: currentUser[pathMap[modelName]] } })
        .populate('image')
        .then(function(items) {
            return res.json(items);
        })
        .catch(function(err) {
            console.error(err.stack || err);
            return res.send(err);
        });
    }

    return Degree.find({ _id: { $in: currentUser[pathMap[modelName]] } }).populate('author').populate({
        path: 'components',
        match: {image: {$ne: null}},
        options: {limit: 4}
    }).exec(function (err, degrees) {
        if (err)
            return res.send(err);

        Promise.map(degrees, function (degree) {
            return Promise.map(degree.components, function (component) {
                return Course.findById(component._id).populate('image').exec(function (course) {
                    return course;
                });
            }).then(function (courses) {
                degree.components = courses;
                return degree;
            });
        }).then(function (degrees) {
            res.json(degrees);
        });
    });

};

exports.getStatistics = function (req, res) {
    var todayStart = moment().startOf('day').format();
    var thisWeekStart = moment().startOf('isoweek').format();
    var thisMonthStart = moment().startOf('month').format();

    var todayQuery = {lastActive: { $gt: todayStart }};
    var thisWeekQuery = {lastActive: { $gt: thisWeekStart }};
    var thisMonthQuery = {lastActive: { $gt: thisMonthStart }};

    return Promise.all([
      req.models.User.count(todayQuery),
      req.models.User.count(thisWeekQuery),
      req.models.User.count(thisMonthQuery),
      req.models.User.count()
    ])
    .spread(function(todayUsers, thisWeekUsers, thisMonthUsers, totalUsers) {
      return res.json({
        today: todayUsers,
        thisWeek: thisWeekUsers,
        thisMonth: thisMonthUsers,
        total: totalUsers
      });
    });
};

exports.enroll = function (req, res) {
    var currentUser = req.user;
    var itemName = req.params.itemName;
    var itemId = req.params.itemId;

    return currentUser
    .enroll(itemName, itemId)
    .then(function() {
        return res.json({ success: true });
    }, function(err) {
        console.error(err.stack || err);
        return res.send(err);
    });
};

exports.dropOut = function (req, res) {
    var currentUser = req.user;
    var itemName = req.params.itemName;
    var itemId = req.params.itemId;

    return currentUser
    .dropOut(itemName, itemId)
    .then(function() {
        return res.json({ success: true });
    }, function(err) {
        console.error(err.stack || err);
        return res.send(err);
    });
};

exports.manageMandatoryCourses = function (req, res) {
    var userId = req.params.id;
    var mandatoryCoursesIds = _.map(req.body.mandatoryCourses || [], '_id');

    return req.models.User
    .findById(userId)
    .then(function(user) {

        if (!user) {
            return res.status(404).send('Not found');
        }

        console.log('USER ID:', user._id);

        return user.updateMandatoryCourses(mandatoryCoursesIds)
    })
    .then(function(user) {
        return res.json(user);
    })
};

exports.toggleComplete = function (req, res) {
    var objectiveId = req.params.itemId;
    var currentUser = req.user;

    return currentUser
    .toggleComplete(objectiveId)
    .then(function() {
        return res.json({ success: true });
    }, function(err) {
        console.error(err.stack || err);
        return res.send(err);
    });
};

function optimizeUser(user) {
    user.enrolledCourses = _.map(user.enrolledCourses, function(course) {
        return _.pick(course, ['_id', 'name', 'image', 'shortDescription']);
    });

    user.enrolledDegrees = _.map(user.enrolledDegrees, function(degree) {
        degree.components = _.chain(degree.components).filter(function(c) { return c.image && c.image.url; }).take(4).value();
        return _.pick(degree, ['_id', 'name', 'shortDescription', 'components']);
    });

    return user;
}
