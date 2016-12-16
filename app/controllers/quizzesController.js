var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var getQuizAssessments = require('../lib/getQuizAssessments');

var modelPopulate = 'assessments components.assessments components.components.assessments components.components.components.assessments';
var quizPopulate = 'attempts attempts.correctAssessments attempts.assessments course';

exports.getQuizByItem = function(req, res) {
  var currentUser = req.user;
  var courseId = req.params.courseId;
  var findQuery = { user: currentUser, course: courseId };

  return req.models.Quiz
  .find(findQuery)
  .populate(quizPopulate)
  .then(function(quizes) {
    return res.json(_.last(quizes));
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};

exports.startQuiz = function(req, res) {
  var currentUser = req.user;
  var courseId = req.params.courseId;
  var itemAssessments = [];
  var quiz;

  return req.models.Quiz.findOne({
    user: currentUser,
    course: courseId
  })
  .then(function(q) {
    quiz = q || req.models.Quiz({ user: currentUser, score: 0, course: courseId, totalAssessments: 0 });

    quiz.attempts.push({
      takenAt: new Date(),
      score: 0,
      assessments: [],
      correctAssessments: [],
      userAnswers: []
    });

    return quiz;
  })
  .then(function() {
    return req.models.Course
    .findById(courseId)
    .deepPopulate(modelPopulate)
  })
  .then(function(course) {
    return getQuizAssessments(course, currentUser)
  })
  .then(function(quizAssessments) {
    if (_.isEmpty(quizAssessments)) {
      throw new Error('No assessments on this item');
    }
    var attemptIndex = quiz.attempts.length - 1;
    quiz.totalAssessments = quiz.totalAssessments === 0 ? quizAssessments.length : quiz.totalAssessments;
    quiz.attempts[attemptIndex].assessments = quizAssessments;
    return quiz.save();
  })
  .then(function(quiz) {
    return req.models.Quiz.findById(quiz._id).deepPopulate(quizPopulate);
  })
  .then(function(quiz) {
    quiz = removeCorrectAnswerInfo(quiz.toJSON());
    return res.json(quiz);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });

};

exports.finishQuiz = function(req, res) {
  var currentUser = req.user;
  var quizId = req.params.quizId;
  var userAnswers = req.body.userAnswers;
  var attemptIndex = 0;

  return req.models.Quiz
  .findOne({ user: currentUser, _id: quizId })
  .populate(quizPopulate)
  .then(function(quiz) {
    if (!quiz) {
      throw new Error('No quiz with given id')
    }

    attemptIndex = quiz.attempts.length - 1;
    quiz.attempts[attemptIndex].userAnswers = userAnswers;

    return calculateScore(quiz, userAnswers, currentUser, req.models.Objective)
    .then(function(quizTotalScore) {
      var attemptScore = quizTotalScore - quiz.score;
      quiz.attempts[attemptIndex].score = attemptScore;
      quiz.score = quizTotalScore;
      return quiz.save();
    });
  })
  .then(function(quiz) {
    return res.json(quiz);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};

exports.getUserAnswersForAttempt = function(req, res) {
  var currentUser = req.user;
  var quizId = req.params.quizId;
  var attemptIndex = parseInt(req.params.attemptIndex);

  return req.models.Quiz
  .findOne({ user: currentUser, _id: quizId })
  .populate(quizPopulate)
  .then(function(quiz) {
    return getUserAnswers(quiz.attempts[attemptIndex], req.models.Objective);
  })
  .then(function(userAnswers) {
    return res.json(userAnswers);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });

};

// HELPER METHODS

function getQuizAssessments(item, currentUser) {
  return getItemAssessments(item, currentUser);
}

function removeCorrectAnswerInfo(quiz) {
  var attemptIndex = quiz.attempts.length - 1;
  quiz.attempts[attemptIndex].assessments = _.map(quiz.attempts[attemptIndex].assessments, function(assessment) {
    assessment.answers = _.map(assessment.answers, function(answer) {
      return answer.text;
    });

    return assessment;
  });

  return quiz;
};

function calculateScore(quiz, userAnswers, currentUser, Objective) {
  var score = quiz.score || 0;
  var correctAssessmentIds = [];
  var attemptIndex = quiz.attempts.length - 1;

  _.forEach(quiz.attempts[attemptIndex].assessments, function(assessment, index) {
    if (userAnswers[index]) {
      var correctAnswerIndex = _.findIndex(assessment.answers, function(answer) {
        return answer.correct;
      });

      if (correctAnswerIndex !== -1 && correctAnswerIndex === userAnswers[index].index) {
        quiz.attempts[attemptIndex].correctAssessments.push(assessment._id);
        correctAssessmentIds.push(assessment._id);
        score++;
      }
    }
  });

  return Objective.find({
    assessments: { $in: correctAssessmentIds }
  }).then(function(objectives) {

    _.forEach(objectives, function(objective) {
      var index = _.findIndex(currentUser.testedObjectives, function(testedObjectiveId) {
        return testedObjectiveId.toString() === objective._id.toString();
      });

      if (index === -1) {
        currentUser.testedObjectives.push(objective._id);
      }
    });

    return currentUser.save().then(function() {
      return score;
    });
  });
};

function getUserAnswers(attempt, Objective) {
  var userAnswers = [];

  return Promise.map(attempt.assessments, function(assessment, assessmentIndex) {
    return Objective.findOne({
      assessments: { $in: [assessment._id] }
    })
    .then(function(objective) {
      var correctIndex = _.findIndex(assessment.answers, { correct: true });
      userAnswers.push({
        objective: _.pick(objective, ['_id', 'name']),
        assessment: assessment,
        correct: correctIndex === attempt.userAnswers[assessmentIndex].index
      });
      
      return userAnswers;
    });
  })
  .then(function() {
    return userAnswers;
  });
};
