angular.module('teachur').controller('WaitingListSignupController', function($scope, $http) {

    $scope.submit = function() {
        $scope.formSubmitted = true;

        if ($scope.form.$valid) {
            $http.post('/api/waiting-list', {email: $scope.email})
            .then(function(response) {
                console.log(response);
                $scope.success = true;
            }, function(error) {
                $scope.error = true;
            });    
        }
    };

});