angular.module('teachur').controller('CoursesViewController', function ($scope, $http, $state, Models, $uibModal, course, currentUse, $window, ProjectService) {
  $scope.course = course;
  $scope.currentUse = currentUse;

  ProjectService.set($scope.course.projects);

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
        $scope.course.$delete(function (data) {
          $window.history.back();
        });
      }
    });
  };

  $scope.export = function(type) {
    var win = window.open('/api/courses/' + $scope.course._id + '/export-' + type, '_blank');
    win.focus();
  };
});
