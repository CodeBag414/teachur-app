angular.module('teachur').controller('UserInviteController', function($scope, Models, $uibModal, $http) {
  $scope.users = [];

  $http.get('/api/current-user/invited-users').then(function(data) {
    $scope.users = data.data;
  });

  $scope.grantAccess = function (user) {
    console.log({id: user._id});
    user.$grantAccess(function (res) {
      user.signupToken = res.signupToken;
    });
  };

  $scope.openAddEmailPopup = function () {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.userEmail = '';
        $scope.cancel = function () {
          $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
          $uibModalInstance.close($scope.userEmail);
        };
      },
      templateUrl: window.baseUrl + '/views/modals/addEmailModal.html'
    });

    modalInstance.result.then(function (email) {
      Models.WannabeUser.addEmail({email: email}).$promise.then(function (res) {
        var user = new Models.WannabeUser(res.user);
        console.log(user);
        $scope.users.push(user);
        return $scope.grantAccess(user);
      });
    });
  };

});
