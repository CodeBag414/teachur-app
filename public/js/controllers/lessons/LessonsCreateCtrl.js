angular.module('teachur').controller('LessonsCreateController', ['$scope', '$http', '$state', 'Models', '$uibModal', '$rootScope', 'ProjectService', function ($scope, $http, $state, Models, $uibModal, $rootScope, ProjectService) {

  $scope.lesson = new Models.Lesson();
  $scope.lesson.recommendedMedia = [];
  $scope.lesson.relatedLessons = [];
  $scope.lesson.prerequisites = [];
  $scope.lesson.components = [];
  $scope.lesson.keywords = [];
  $scope.lesson.private = false;

  ProjectService.reset();

  $scope.onDropCompletePrerequisites = function (prerequisiteLesson, event) {
    $scope.lesson.prerequisites.push(prerequisiteLesson);
  };

  $scope.onDropCompleteRelated = function (relatedLesson, event) {
    $scope.lesson.relatedLessons.push(relatedLesson);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.lesson.components.push(componentObjective);
  };

  $scope.createLesson = function () {
    ProjectService.saveAll().then(function(projects) {
      $scope.lesson.projects = projects;
      $scope.lesson.$create(function (response) {
        $state.go('lessons.view', {id: response._id});
      });
    });
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.lesson.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.lesson = data;
  });

  $scope.saveAndCreateNew = function (routeName) {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.name = 'objective';
        $scope.createdObject = new Models[routeName]();

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.create = function () {
          $scope.createdObject.$create(function (response) {
            $uibModalInstance.close(response);
          });
        };
      },
      templateUrl: window.baseUrl + '/views/modals/fastCreateModal.html'
    });

    modalInstance.result.then(function (newObj) {
      $scope.lesson.components.push(newObj);
    });
  };

  $scope.publish = function () {
    $scope.lesson.published = true;
    $scope.createLesson();
  }

}]);

angular.module('teachur').controller('LessonsEditController', function ($scope, $http, $state, Models, $uibModal, lesson, $rootScope, ProjectService) {
  $scope.lesson = lesson;

  ProjectService.set($scope.lesson.projects);

  $scope.onDropCompletePrerequisites = function (prerequisiteLesson, event) {
    $scope.lesson.prerequisites.push(prerequisiteLesson);
  };

  $scope.onDropCompleteRelated = function (relatedLesson, event) {
    $scope.lesson.relatedLessons.push(relatedLesson);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.lesson.components.push(componentObjective);
  };

  $scope.createLesson = function () {
    ProjectService.saveAll().then(function(projects) {
      debugger;
      $scope.lesson.projects = projects;
      $scope.lesson.$save(function (response) {
        $state.go('lessons.view', {id: response._id});
      });
    });
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.lesson.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.lesson = data;
    $scope.lesson._id = lesson._id;
  });

  $scope.saveAndCreateNew = function (routeName) {
    $scope.lesson.$save(function () {
      var modalInstance = $uibModal.open({
        controller: function ($scope, $uibModalInstance, Models) {
          $scope.name = 'objective';
          $scope.createdObject = new Models[routeName]();

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.create = function () {
            $scope.createdObject.$create(function (response) {
              $uibModalInstance.close(response);
            });
          };
        },
        templateUrl: window.baseUrl + '/views/modals/fastCreateModal.html'
      });

      modalInstance.result.then(function (newObj) {
        $scope.lesson.components.push(newObj);
      });
    });
  };

  $scope.publish = function () {
    $scope.lesson.published = true;
    $scope.createLesson();
  }

});