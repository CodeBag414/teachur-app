angular.module('teachur').controller('ResetPasswordController', function($scope, $http, $state, $stateParams) {
    $scope.submit = function() {
        $scope.formSubmitted = true;
        if ($scope.resetPasswordForm.$valid) {

            if ($scope.newPassword === $scope.newPasswordConfirmation) {
                $http.post('/api/reset-password', {resetPasswordToken: $stateParams.resetPasswordToken, newPassword: $scope.newPassword}).success(
                    function(data) {
                        $state.go('login');
                    }, function(error) {

                    }
                );
            } else {
                $scope.passwordsMismatch = true;
            }
            
        }
        
    };

});