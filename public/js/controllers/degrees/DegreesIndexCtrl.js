angular.module('teachur').controller('DegreesIndexController', function($scope, degrees, Models, $rootScope) {
    var currentUser = $rootScope.user;
    $scope.degrees = degrees;

    $scope.createdByMe = 1;

    $scope.loadData = function (createdByMe) {
      if (createdByMe === 0) {
        return Models
        .User
        .getFavorites({ id: currentUser._id, modelName: 'degree' }, function(items) {
          return $scope.degrees = items;
        });
      }

      return $scope.degrees = degrees;
    };
});
