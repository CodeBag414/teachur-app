angular.module('teachur').controller('DegreesCreateController', ['$scope', '$http', '$state', 'Models', '$uibModal', '$rootScope', 'ProjectService', function ($scope, $http, $state, Models, $uibModal, $rootScope, ProjectService) {

  $scope.degree = new Models.Degree();
  $scope.degree.recommendedMedia = [];
  $scope.degree.relatedDegrees = [];
  $scope.degree.prerequisites = [];
  $scope.degree.components = [];
  $scope.degree.goals = [];
  $scope.degree.keywords = [];
  $scope.degree.private = false;

  $scope.newGoalName = '';

  ProjectService.reset();

  $scope.onDropCompletePrerequisites = function (prerequisiteDegree, event) {
    $scope.degree.prerequisites.push(prerequisiteDegree);
  };

  $scope.onDropCompleteRelated = function (relatedDegree, event) {
    $scope.degree.relatedDegrees.push(relatedDegree);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.degree.components.push(componentObjective);
  };

  $scope.createDegree = function () {
    ProjectService.saveAll().then(function(projects) {
      $scope.degree.projects = projects;
      $scope.degree.$create(function (response) {
        $state.go('degrees.view', {id: response._id});
      });
    });
  };

  $scope.checkIfEnterAndAddGoal = function (event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      event.preventDefault();
      $scope.degree.goals.push($scope.newGoalName);
      $scope.newGoalName = '';
    }
  };

  $scope.removeGoal = function (goal) {
    _.pull($scope.degree.goals, goal);
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.degree.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.degree = data;
  });

  $scope.saveAndCreateNew = function (routeName) {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.name = 'course';
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
      $scope.degree.components.push(newObj);
    });
  };

  $scope.publish = function () {
    $scope.degree.published = true;
    $scope.createDegree();
  }

}]);

angular.module('teachur').controller('DegreesEditController', function ($scope, $http, $state, Models, $uibModal, degree, $rootScope, ProjectService) {
  $scope.degree = degree;

  ProjectService.set($scope.degree.projects);

  $scope.newGoalName = '';

  $scope.onDropCompletePrerequisites = function (prerequisiteDegree, event) {
    $scope.degree.prerequisites.push(prerequisiteDegree);
  };

  $scope.onDropCompleteRelated = function (relatedDegree, event) {
    $scope.degree.relatedDegrees.push(relatedDegree);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.degree.components.push(componentObjective);
  };

  $scope.createDegree = function () {
    ProjectService.saveAll().then(function(projects) {
      $scope.degree.projects = projects;
      $scope.degree.$save(function (response) {
        $state.go('degrees.view', {id: response._id});
      });
    });
  };

  $scope.checkIfEnterAndAddGoal = function (event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      event.preventDefault();
      $scope.degree.goals.push($scope.newGoalName);
      $scope.newGoalName = '';
    }
  };

  $scope.removeGoal = function (goal) {
    _.pull($scope.degree.goals, goal);
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.degree.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.degree = data;
    $scope.degree._id = degree._id;
  });

  $scope.saveAndCreateNew = function (routeName) {
    $scope.degree.$save(function () {
      var modalInstance = $uibModal.open({
        controller: function ($scope, $uibModalInstance, Models) {
          $scope.name = 'course';
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
        $scope.degree.components.push(newObj);
      });
    });
  };

  $scope.publish = function () {
    $scope.degree.published = true;
    $scope.createDegree();
  }

});