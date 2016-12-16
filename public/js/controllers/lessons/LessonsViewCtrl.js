angular.module('teachur').controller('LessonsViewController', function($scope, $http, $state, Models, $uibModal, lesson, currentUse, $window, ProjectService) {
    $scope.lesson = lesson;
    $scope.currentUse = currentUse;

    ProjectService.set($scope.lesson.projects);

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
          $scope.lesson.$delete(function(data) {
            $window.history.back();
          });
        }
      });
    };
});
