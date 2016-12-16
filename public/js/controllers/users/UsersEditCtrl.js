angular.module('teachur').controller('UsersEditController', function ($scope, user, $translate) {
  $scope.user = user;
  $scope.hideImage = true;

  $scope.interests = [];

  if (_.isEmpty($scope.user.degrees)) {
    $scope.user.degrees.push({});
  }

  $scope.saveUser = function () {
    debugger;
    $scope.user.$save(function (response) {
      console.log('user saved');
    });
  };
});
