var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var config = require('../config/config');
var authenticateUser = require('./lib/authenticateUser');

var router = express.Router();

var User = require('./models/user');
var WannabeUser = require('./models/wannabeUser');

var usersController = require('./controllers/usersController.js');
var objectivesController = require('./controllers/objectivesController.js');
var lessonsController = require('./controllers/lessonsController.js');
var coursesController = require('./controllers/coursesController.js');
var degreesController = require('./controllers/degreesController.js');
var discussionController = require('./controllers/discussionController.js');
var searchController = require('./controllers/searchController.js');
var uploadsController = require('./controllers/uploadsController.js');
var paymentsController = require('./controllers/paymentsController.js');
var waitingListController = require('./controllers/waitingListController.js');
var assessmentsController = require('./controllers/assessmentsController.js');
var projectsController = require('./controllers/projectsController.js');
var amazonController = require('./controllers/amazonController');
var keywordsController = require('./controllers/keywordsController');
var settingsController = require('./controllers/settingsController');
var interestsController = require('./controllers/interestsController');
var personalInterestsController = require('./controllers/personalInterestsController');
var organizationsController = require('./controllers/organizationsController');
var quizzesController = require('./controllers/quizzesController');
var seedDataCtrl = require('./controllers/seedData.js');

var multerUpload = multer({limits: {fileSize: 20 * 1024 * 1024}});

//router.get('/seed-data', seedDataCtrl.seedData);

router.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}), function (req, res) {
  var user = req.user;

  // create a token
  var token = jwt.sign({userId: user._id}, config.secret, {
    expiresIn: 86400 // expires in 24 hours
  });

  user.accessToken = token;

  user.save(function (err) {
    // return the information including token as JSON
    res.redirect('/app#/dashboard?token=' + token);
  });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/'}), function (req, res) {
  var user = req.user;

  // create a token
  var token = jwt.sign({userId: user._id}, config.secret, {
    expiresIn: 86400 // expires in 24 hours
  });

  user.accessToken = token;

  user.save(function (err) {
    // return the information including token as JSON
    res.redirect('/app#/dashboard?token=' + token);
  });

});

router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/login'}),
  function (req, res) {
    console.log(req.user);
    var user = req.user;

    // create a token
    var token = jwt.sign({userId: user._id}, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    user.accessToken = token;

    user.save(function (err) {
      // return the information including token as JSON
      res.redirect('/app#/dashboard?token=' + token);
    });
  });

// server routes ===========================================================
// authentication routes

router.post('/signup', function (req, res) {
  var user = req.body.user;

  // // req.models.WannabeUser.findOneAsync({signupToken: signupToken, signupTokenUsed: false}).then(function (wannabeUser) {
  // //   if (!wannabeUser) {
  // //     return res.json({
  // //       success: false,
  // //       error: {
  // //         message: 'Invalid signup token'
  // //       }
  // //     })
  // //   }

  //       req.models.User.create({
  //         username: user.username,
  //         email: user.email,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         password: user.password,
  //         isTeacher: false,
  //         isStudent: true,
  //         admin: false,
  //         organizationSlug: req.organization ? req.organization.slug : 'main'
  //       }, function (err, account) {
  //         if (err) {
  //           return res.json({success: false, error: err});
  //         }

  //         wannabeUser.signupTokenUsed = true;

  //         wannabeUser.saveAsync().then(function () {
  //           res.json({success: true});
  //         });
  //       });
    
  // // });

  return req.models.User.create({
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    isTeacher: false,
    isStudent: true,
    admin: false,
    organizationSlug: req.organization ? req.organization.slug : 'main'
  }, function (err, account) {
    if (err) {
      return res.json({success: false, error: err});
    }

    res.json({success: true});
  });
});

router.post('/login', function (req, res) {
  var data = req.body;

  req.models.User.findOne({ username: data.username }).then(function(user) {
    if (!user) {
      res.status(404).send('Authentication failed. User not found.');
    } else if (user) {

      // create a token
      var token = jwt.sign({userId: user._id}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      usersController.populateUserFields(req, user._id, false, function (populatedUser) {
        user = populatedUser;
        user.accessToken = token;

        user.save(function (err) {
          if (err) {
            console.log(err);
          }

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: user.accessToken,
            user: user
          });
        })
      });
    }
  });

});

router.post('/users/check-username', usersController.checkUsername);
router.post('/confirm-email', usersController.confirmEmail);
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);

router.post('/waiting-list', waitingListController.signup);
router.get('/degrees/:id/export-csv', degreesController.exportCsv);
router.get('/degrees/:id/export-xls', degreesController.exportXls);
router.get('/courses/:id/export-csv', coursesController.exportCsv);
router.get('/courses/:id/export-xls', coursesController.exportXls);

// setup token authentication middleware
router.use(function (req, res, next) {
  if (req.originalUrl !== 'api/waiting-list') {
    return authenticateUser(req, res, next);
  };
    
  return next();
});

router.post('/search', searchController.search);

router.get('/objectives', objectivesController.getAll);
router.get('/objectives/search', objectivesController.search);
router.get('/objectives/:id', objectivesController.getOne);
router.get('/objectives/:id/current-use', objectivesController.getCurrentUse);

router.get('/lessons', lessonsController.getAll);
router.get('/lessons/search', lessonsController.search);
router.get('/lessons/:id', lessonsController.getOne);
router.get('/lessons/:id/current-use', lessonsController.getCurrentUse);

router.get('/courses', coursesController.getAll);
router.get('/courses/search', coursesController.search);
router.get('/courses/:id', coursesController.getOne);
router.get('/courses/:id/current-use', coursesController.getCurrentUse);

router.get('/degrees', degreesController.getAll);
router.get('/degrees/search', degreesController.search);
router.get('/degrees/:id', degreesController.getOne);
router.get('/degrees/:id/current-use', degreesController.getCurrentUse);


router.get('/current-user', usersController.getCurrentUser);
router.get('/current-user/invited-users', usersController.getInvitedUsers);
router.put('/current-user', usersController.updateCurrentUser);
router.post('/current-user/add-to-my-modules', usersController.addToMyModules);
router.post('/current-user/enroll/:itemName/:itemId', usersController.enroll);
router.post('/current-user/drop-out/:itemName/:itemId', usersController.dropOut);
router.post('/current-user/toggle-complete/:itemId', usersController.toggleComplete);

router.get('/users', usersController.getAll);
router.get('/users/statistics', usersController.getStatistics);
router.get('/users/:id', usersController.getOne);
router.put('/users/:id', usersController.update);
router.delete('/users/:id', usersController.delete);
router.get('/users/:id/objectives', usersController.getObjectives);
router.get('/users/:id/lessons', usersController.getLessons);
router.get('/users/:id/courses', usersController.getCourses);
router.get('/users/:id/degrees', usersController.getDegrees);
router.get('/users/:id/favorited/:modelName', usersController.getFavorited);
router.post('/users/:id/manage-mandatory-courses', usersController.manageMandatoryCourses);

router.get('/objective/author', objectivesController.getAllByAuthor);
router.get('/objective/statistics', objectivesController.getStatistics);
router.post('/objectives', objectivesController.create);
router.put('/objectives/:id', objectivesController.update);
router.delete('/objectives/:id', objectivesController.delete);

router.get('/lesson/author', lessonsController.getAllByAuthor);
router.get('/lesson/statistics', lessonsController.getStatistics);
router.post('/lessons', lessonsController.create);
router.put('/lessons/:id', lessonsController.update);
router.delete('/lessons/:id', lessonsController.delete);

router.get('/course/author', coursesController.getAllByAuthor);
router.get('/course/statistics', coursesController.getStatistics);
router.post('/courses', coursesController.create);
router.put('/courses/:id', coursesController.update);
router.delete('/courses/:id', coursesController.delete);

router.get('/degree/author', degreesController.getAllByAuthor);
router.get('/degree/statistics', degreesController.getStatistics);
router.post('/degrees', degreesController.create);
router.put('/degrees/:id', degreesController.update);
router.delete('/degrees/:id', degreesController.delete);

router.post('/discussions', discussionController.create);
router.post('/discussions/:id', discussionController.create);
router.put('/discussions/:id', discussionController.update);
router.get('/discussions/:model/:id', discussionController.getModelDiscussions);
router.delete('/discussions/:id', discussionController.delete);

router.delete('/reply/:id', discussionController.deleteReply);
router.post('/reply/:id', discussionController.createReply);
router.post('/reply', discussionController.createReply);
router.put('/reply', discussionController.updateReply);

router.get('/waiting-list', waitingListController.getAll);
router.put('/waiting-list/:id/grant-access', waitingListController.grantAccess);
router.post('/waiting-list/add-email', waitingListController.addEmail);
router.delete('/waiting-list/:id', waitingListController.delete);

router.post('/assessments', assessmentsController.create);
router.put('/assessments/:id', assessmentsController.update);
router.delete('/assessments/:id', assessmentsController.delete);
router.post('/assessments/:itemName/:itemId', assessmentsController.createAndUpdateParent);

router.post('/projects', projectsController.create);
router.put('/projects/:id', projectsController.update);
router.delete('/projects/:id', projectsController.delete);
router.post('/projects/:itemName/:itemId', projectsController.createAndUpdateParent);

router.get('/interests', interestsController.getAll);
router.post('/interests', interestsController.create);
router.get('/interests/search', interestsController.search);
router.get('/personal-interests', personalInterestsController.getAll);
router.post('/personal-interests', personalInterestsController.create);
router.get('/personal-interests/search', personalInterestsController.search);

router.post('/payments/charge', paymentsController.charge);

router.post('/uploads/crop', multerUpload.single('file'), uploadsController.uploadCroppedImage);
router.post('/uploads/course/:id/crop', multerUpload.single('file'), uploadsController.uploadCourseCroppedImage);

router.post('/uploads/image', multerUpload.single('file'), uploadsController.uploadImage);
router.post('/uploads/course/:id', multerUpload.single('file'), uploadsController.uploadCourseImage);
router.post('/uploads/student-project/:projectId', multerUpload.single('file'), uploadsController.uploadStudentProject);

router.post('/uploads/:itemName/:id/file/:fileId', multerUpload.single('file'), uploadsController.uploadFile);

router.get('/amazon-search', amazonController.search);

router.get('/keywords/search', keywordsController.search);

router.get('/settings', settingsController.getAll);
router.put('/settings/:id', settingsController.update);

router.get('/organizations', organizationsController.getAll);
router.post('/organizations', organizationsController.create);
router.get('/organizations/main-content', organizationsController.searchMainContent);
router.post('/organizations/copy-content', organizationsController.copyMainContent);

router.get('/quiz/start/course/:courseId', quizzesController.startQuiz);
router.get('/quiz/by-item/course/:courseId', quizzesController.getQuizByItem);
router.post('/quiz/:quizId/finish', quizzesController.finishQuiz);
router.get('/quiz/:quizId/user-answers/:attemptIndex', quizzesController.getUserAnswersForAttempt);

module.exports = router;
