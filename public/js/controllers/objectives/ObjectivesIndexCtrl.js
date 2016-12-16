angular.module('teachur').controller('ObjectivesIndexController', function($scope, objectives, pagination, Models, $rootScope) {
  var currentUser = $rootScope.user;
  $scope.pagination = pagination;
  $scope.objectives = objectives;
  $scope.createdByMe = 1;

  $scope.loadData = function (createdByMe) {
    if (createdByMe === 0) {
      return Models
      .User
      .getFavorites({ id: currentUser._id, modelName: 'objective' }, function(items) {
        return $scope.objectives = items;
      });
    }

    return $scope.objectives = objectives;
  };
});
