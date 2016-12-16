angular.module('teachur').controller('LessonsIndexController', function($scope, lessons, Models, $rootScope) {
  var currentUser = $rootScope.user;
  $scope.lessons = lessons;
  $scope.createdByMe = 1;

  $scope.loadData = function (createdByMe) {
    if (createdByMe === 0) {
      return Models
      .User
      .getFavorites({ id: currentUser._id, modelName: 'lesson' }, function(items) {
        return $scope.lessons = items;
      });
    }

    return $scope.lessons = lessons;
  };
});
