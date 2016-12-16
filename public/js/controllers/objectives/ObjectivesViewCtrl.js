angular.module('teachur').controller('ObjectivesViewController', function ($scope, $http, $state, Models, $uibModal, objective, currentUse, $window, AssessmentService) {
  $scope.objective = objective;
  $scope.currentUse = currentUse;

  AssessmentService.set($scope.objective.assessments);

  $scope.save = function () {
    $scope.objective.$save(function (response) {
      console.log('objective updated');
    });
  };

  $scope.$on('addedMedia', function (event, data) {
    $scope.save();
  });

  $scope.delete = function () {
    $scope.objective.$delete(function (data) {
      $window.history.back();
    });
  };

  $scope.delete = function () {
    sweetAlert({
      title: "Are you sure?",
      text: "Your will not be able to recover this item!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Delete",
      closeOnConfirm: true
    }, function (isConfirm) {
      if (isConfirm) {
        $scope.objective.$delete(function (data) {
          $window.history.back();
        });
      }
    });
  };

});
