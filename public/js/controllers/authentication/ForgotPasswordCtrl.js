angular.module('teachur').controller('ForgotPasswordController', function($scope, $http, $state, Models, $rootScope) {
    $scope.user = new Models.User();
    $scope.submit = function() {
        $scope.formSubmitted = true;
        if ($scope.forgotPasswordForm.$valid) {
            $http.post('/api/forgot-password', {userId: $scope.userId})
            .then(function(response) {
                $scope.success = true;
            }, function(error) {
                $scope.invalid = true;
            });    
        }
        
    };

});