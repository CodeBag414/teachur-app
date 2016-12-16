angular.module('teachur').controller('ConfirmEmailController', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {

  $scope.confirmationCompleted = false;
  localStorage.clear();

  $http.post('/api/confirm-email', {confirmationToken: $stateParams.confirmationToken}).success(function (data) {
    $scope.confirmationSuccessful = data.success;
    $scope.confirmationCompleted = true;
  });

}]);