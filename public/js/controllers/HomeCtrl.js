angular.module('teachur').controller('HomeController', function ($rootScope, $scope, $http, $state, objectives, lessons, courses, degrees, Models, Intro) {
  var currentUser = $rootScope.user;
  $scope.dataLoading = false;
  $scope.active = 0;

  $scope.page = 1;

  if (!$rootScope.organization) {
    Intro.start();
  }

  var map = {
    degree: {
      items: degrees
    },
    course: {
      items: courses
    },
    lesson: {
      items: lessons
    },
    objective: {
      items: objectives
    }
  };

  $scope.createdByMeDegrees = 1;
  $scope.createdByMeLessons = 1;
  $scope.createdByMeCourses = 1;
  $scope.createdByMeObjectives = 1;

  $scope.objectives = objectives;
  $scope.lessons = lessons;
  $scope.courses = courses;
  $scope.degrees = degrees;

  $scope.loadMore = function(modelName) {
    $scope.page++;

    switch(modelName) {
      case 'degrees':
        var model = Models.Degree;
        break;
      case 'courses':
        var model = Models.Course;
        break;
      case 'lessons':
        var model = Models.Lesson;
        break;
      case 'objectives':
        var model = Models.Objective;
        break;
    };

    return model.queryByAuthor({page: $scope.page}, function(items) {
      $scope[modelName] = _.concat($scope[modelName], items);
    });
  };

  $scope.loadData = function (modelName, createdByMe) {
    if (createdByMe === 0) {
      return Models
      .User
      .getFavorites({ id: currentUser._id, modelName: modelName }, function(items) {
        return $scope[modelName + 's'] = items;
      });
    }

    return $scope[modelName + 's'] = map[modelName].items;
  };


})

.controller('HowItWorksController', function($scope) {

});