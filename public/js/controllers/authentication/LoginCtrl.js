angular.module('teachur').controller('LoginController', function ($scope, $http, $state, Models, $rootScope) {
  $scope.user = new Models.User();
  $scope.submit = function () {
    $scope.formSubmitted = true;
    if ($scope.loginForm.$valid) {
      $http.post('/api/login', $scope.user)
        .then(function (response) {
          console.log('SUCCESS', response);
          localStorage.accessToken = response.data.token;

          $http.get('/api/current-user').success(function (user) {
            localStorage.user = JSON.stringify(user);
            $rootScope.user = user;
            $rootScope.studentView = !user.isTeacher;
            $state.go('dashboard');
          });
        }, function (error) {
          console.log(error);
          $scope.invalidLogin = true;
        });
    }

  };

});