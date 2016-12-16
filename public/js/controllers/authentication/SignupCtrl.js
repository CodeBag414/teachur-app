angular.module('teachur').controller('SignupController', function ($scope, $http, $state, Models, $stateParams) {
  $scope.user = new Models.User();
  $scope.signupToken = $stateParams.signupToken;

  $scope.submit = function () {
    $scope.formSubmitted = true;
    if ($scope.signupForm.$valid) {
      $http.post('/api/signup', {user: $scope.user, token: $scope.signupToken})
        .then(function (response) {
          console.log(response.data);
          if (response.data.success) {
            console.log('SUCCESS');
            $scope.signupCompleted = true;
          } else if (response.data.error.message) {
            $scope.error = response.data.error.message;
            $state.go('signup');
          } else {
            $scope.error = 'User with given email already exists';
          }
        }, function (error) {
          $scope.invalidLogin = true;
        });
    } else {
      $scope.error = 'Please fill in all the fields and select if you are a teacher or a student.';
    }

  };

  $scope.checkUsername = function () {
    var username = $scope.user.username;
    $http.post('/api/users/check-username', {username: username}).success(function (data) {
      if (data.usernameTaken) {
        $scope.signupForm.$valid = false;
        $scope.usernameError = 'Username is already taken.'
      } else {
        $scope.usernameError = null;
      }
    })
  };

});