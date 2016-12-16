angular.module('teachur').directive('inviteUsers', ['$uibModal', function($uibModal) {
    return {
        restrict: 'AEC',
        scope: {
            buttonText: '@'
        },
        templateUrl: window.baseUrl + '/views/directives/inviteUsers/inviteUsersButton.html',
        replace: true,
        link: function($scope, $element, attr, ctrl){
            $scope.open = function (size) {

              var modalInstance = $uibModal.open({
                templateUrl: window.baseUrl + '/views/directives/inviteUsers/inviteUsersModal.html',
                controller: 'InviteUsersModalCtrl',
                backdrop: false,
                size: 'sm'
              });

              modalInstance.result.then(function (selectedItem) {
                console.log('Modal dismissed');
              }, function () {
                console.log('Modal dismissed at: ' + new Date());
              });
            };
        }
    };
}])
.controller('InviteUsersModalCtrl', function ($rootScope, $scope, $uibModalInstance, $http, $timeout) {
  $scope.success = false;

  $scope.invite = function(){
      $scope.success = true;
      $timeout(function() {
        $scope.success = false;
      }, 1000);
  }

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});