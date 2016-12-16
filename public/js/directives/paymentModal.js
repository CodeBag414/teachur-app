angular.module('teachur').directive('paymentModal', ['$uibModal', function($uibModal) {
    return {
        restrict: 'AEC',
        scope: {
            buttonText: '@'
        },
        templateUrl: window.baseUrl + '/views/directives/paymentModal/paymentButton.html',
        replace: true,
        link: function($scope, $element, attr, ctrl){
            $scope.open = function (size) {

              var modalInstance = $uibModal.open({
                templateUrl: window.baseUrl + '/views/directives/paymentModal/paymentModal.html',
                controller: 'PaymentModalCtrl',
                backdrop: true,
                size: 'sm',
                windowClass:'modal-payment'
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
.controller('PaymentModalCtrl', function ($rootScope, $scope, $uibModalInstance, $http) {
  $scope.success = false;

  $scope.handleStripe = function(status, response){
      if(response.error) {
        // there was an error. Fix it.
      } else {
        // got stripe token, now charge it or smt
        var token = response.id;

        $http.post('/api/payments/charge', {stripeToken: token}).then(function(response) {
          $rootScope.user.subscribed = true;
          $scope.success = true;
        }, function() {
          alert('Error happened processing your card');
        });
      }
  };

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
