angular.module('teachur').controller('CoursesIndexController', function ($scope, courses, Models, $rootScope) {
  var currentUser = $rootScope.user;
  $scope.courses = courses;
  $scope.createdByMe = 1;

  $scope.loadData = function (createdByMe) {
    if (createdByMe === 0) {
      return Models
      .User
      .getFavorites({ id: currentUser._id, modelName: 'course' }, function(items) {
        return $scope.courses = items;
      });
    }

    return $scope.courses = courses;
  };
});
