angular.module('teachur').controller('DegreesViewController', function ($scope, $http, $state, Models, $uibModal, degree, currentUse, $window, $stateParams, ProjectService) {
  $scope.degree = degree;
  $scope.currentUse = currentUse;

  ProjectService.set($scope.degree.projects);

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
        $scope.degree.$delete(function (data) {
          $window.history.back();
        });
      }
    });
  };

  $scope.export = function(type) {
    var win = window.open('/api/degrees/' + $scope.degree._id + '/export-' + type, '_blank');
    win.focus();
  };
});
