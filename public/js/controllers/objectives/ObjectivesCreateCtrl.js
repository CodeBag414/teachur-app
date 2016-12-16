angular.module('teachur').controller('ObjectivesCreateController', ['$scope', '$http', '$state', 'Models', '$uibModal', 'relatedObjectives', '$rootScope', 'AssessmentService', 'FilesService', function ($scope, $http, $state, Models, $uibModal, relatedObjectives, $rootScope, AssessmentService, FilesService) {

  $scope.objective = new Models.Objective();
  $scope.objective.recommendedMedia = [];
  $scope.objective.relatedObjectives = [];
  $scope.objective.prerequisites = [];
  $scope.objective.keywords = [];
  $scope.objective.private = false;
  $scope.relatedObjectives = relatedObjectives;

  AssessmentService.reset();

  $scope.onDragComplete = function (data, event) {
    console.log("drag success, data:", data);
  };

  $scope.onDropCompletePrerequisites = function (prerequisiteObjective, event) {
    $scope.objective.prerequisites.push(prerequisiteObjective);
  };

  $scope.onDropCompleteRelated = function (relatedObjective, event) {
    $scope.objective.relatedObjectives.push(relatedObjective);
  };

  $scope.createObjective = function () {
    var files = $scope.objective.recommendedMedia;
    AssessmentService.saveAll().then(function(assessments) {
      $scope.objective.assessments = assessments;
      $scope.objective.$create(function (response) {
        $scope.objective.recommendedMedia = files;
        FilesService.uploadObjectiveFiles($scope.objective).then(function() {
          $state.go('objectives.view', {id: response._id});
        });
      });
    });
  };

  $scope.publish = function () {
    $scope.objective.published = true;
    $scope.createObjective();
  };

  $rootScope.$on('copyItem', function (e, data) {
    $scope.objective = data;
  });

}]);

angular.module('teachur').controller('ObjectivesEditController', function ($scope, $http, $state, Models, $uibModal, objective, $rootScope, AssessmentService, FilesService) {
  $scope.objective = objective;

  Models.Objective.query(function (relatedObjectives) {
    $scope.relatedObjectives = relatedObjectives;
  });

  AssessmentService.set($scope.objective.assessments);

  $scope.onDragComplete = function (data, event) {
  };

  $scope.onDropCompletePrerequisites = function (prerequisiteObjective, event) {
    $scope.objective.prerequisites.push(prerequisiteObjective);
  };

  $scope.onDropCompleteRelated = function (relatedObjective, event) {
    $scope.objective.relatedObjectives.push(relatedObjective);
  };

  $scope.createObjective = function () {
    var files = $scope.objective.recommendedMedia;
    AssessmentService.saveAll().then(function(assessments) {
      $scope.objective.assessments = assessments;
      $scope.objective.$save(function (response) {
        $scope.objective.recommendedMedia = files;
        FilesService.uploadObjectiveFiles($scope.objective).then(function() {
          $state.go('objectives.view', {id: response._id});
        });
      });
    });
  };

  $scope.publish = function () {
    $scope.objective.published = true;
    $scope.createObjective();
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.objective.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.objective = data;
  });

});
