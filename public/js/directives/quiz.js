angular.module('teachur')
.directive('quiz', function (QuizService, $uibModal) {
  return {
    restrict: 'AEC',
    scope: {
      item: '=',
      itemName: '@'
    },
    templateUrl: window.baseUrl + '/views/directives/quiz/quizWidget.html',
    replace: true,
    link: function($scope, $element, attr, ctrl){
      loadQuiz();

      var classMap = {
        'objective': 'panel-primary',
        'lesson': 'panel-lesson',
        'course': 'panel-course',
        'degree': 'panel-degree'
      };

      $scope.getPanelClass = function() {

        return classMap[$scope.itemName];
      };

      function loadQuiz() {
        QuizService
        .getByItem($scope.itemName, $scope.item._id)
        .then(function(quiz) {
          $scope.quiz = quiz;
        });
      };

      $scope.showCorrectAnswers = function(attemptIndex) {
        var modalInstance = $uibModal.open({
          templateUrl: window.baseUrl + "/views/directives/quiz/correctAnswersModal.html",
          keyboard: false,
          backdrop  : 'static',
          controller: function($scope, userAnswers, $uibModalInstance, quiz) {
            $scope.attempt = quiz.attempts[attemptIndex];
            $scope.attemptIndex = attemptIndex;
            $scope.userAnswers = userAnswers;
            $scope.quiz = quiz;

            $scope.getCorrectAnswer = function(assessment) {
              var correctAnswer = _.find(assessment.answers, { correct: true });
              return correctAnswer.text;
            }

            $scope.isCorrectAnswer = function(assessment, assessmentIndex) {
              var correctIndex = _.findIndex(assessment.answers, { correct: true });
              return correctIndex === $scope.attempt.userAnswers[assessmentIndex].index;
            }

            $scope.close = function() {
              $uibModalInstance.close();
            };
          },
          resolve: {
            quiz: function() {
              return $scope.quiz;
            },
            userAnswers: function(QuizService) {
              return QuizService.getUserAnswersForAttempt($scope.quiz._id, attemptIndex);
            }
          }
        });
      };

      $scope.startQuiz = function() {
        var modalInstance = $uibModal.open({
          templateUrl: window.baseUrl + "/views/directives/quiz/quizModal.html",
          keyboard: false,
          backdrop  : 'static',
          controller: function($scope, quiz, $uibModalInstance) {
            $scope.quiz = quiz;
            $scope.attempt = _.last(quiz.attempts);

            if (!_.isEmpty($scope.attempt.assessments)) {
              $uibModalInstance.dismiss(false);
            };

            $scope.userAnswers = _.map($scope.attempt.assessments, function(assessment) {
              if (assessment.type === 'multipleChoice') {
                return { index: -1 };
              };
            });

            $scope.submit = function() {
              return QuizService
              .submit(quiz._id, $scope.userAnswers)
              .then(function(quiz) {
                console.log(quiz);
                $uibModalInstance.close();
              })
            };
          },
          resolve: {
            quiz: function(QuizService) {
              return QuizService.start($scope.itemName, $scope.item._id);
            }
          }
        });

        modalInstance.result.then(function (newFile) {
          return loadQuiz();
        }, function (error) {
          if (error) {
            sweetAlert({
              title: "You can't take this quiz",
              text: "There is no assessment on this " + _.capitalize($scope.itemName),
              type: "warning",
              confirmButtonText: "OK",
              closeOnConfirm: true
            }, function (isConfirm) {
            });
          }
        });
      };
    }
  };
})
.service('QuizService', function($q, $http) {

  this.start = function(itemName, itemId) {
    return $q(function(resolve, reject) {
        $http.get('/api/quiz/start/' + itemName + '/' + itemId)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.submit = function(quizId, userAnswers) {
    return $q(function(resolve, reject) {
        $http.post('/api/quiz/' + quizId + '/finish', { userAnswers: userAnswers })
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.getByItem = function(itemName, itemId) {
    return $q(function(resolve, reject) {
        $http.get('/api/quiz/by-item/' + itemName + '/' + itemId)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.getUserAnswersForAttempt = function(quizId, attemptIndex) {
    return $q(function(resolve, reject) {
        $http.get('/api/quiz/' + quizId + '/user-answers/' + attemptIndex)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  return this;

});