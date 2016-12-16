angular.module('teachur')
.factory('Intro', Intro)
.controller('IntroModalController', IntroModalController);

function Intro($http, $q, $rootScope, $uibModal, $timeout) {
  var _this = this;
  this.started = false;

  this.start = function() {
    if ($rootScope.user) {
      showIntro();
    } else {
      $timeout(showIntro, 2000);
    }
  };

  this.finish = function(user) {
    user.welcomed = true;
    $http.put('/api/current-user', user).success(function (user) {
      $rootScope.user = user;
      localStorage.user = JSON.stringify(user);
    });
  };

  function showIntro() {
    if (!$rootScope.user.welcomed && !_this.started) {
      _this.started = true;
      var modalInstance = $uibModal.open({
        templateUrl: window.baseUrl + '/views/modals/intro/introModal.html',
        controller: 'IntroModalController',
        size: 'lg'
      });

      modalInstance.result.then(function (user) {
        _this.started = false;
        if (user) {
          _this.finish(user);
        }
      }, function() {
        _this.started = false;
      });
    }
  }

  return this;
}

function IntroModalController($scope, $uibModalInstance, $rootScope, Interests, $translate, Upload) {
  $scope.step = 1;
  $scope.currentUser = $rootScope.user;

  $scope.nextStep = function() {
    if ($scope.step === 6) {
      $scope.finish();
    }

    $scope.step++;
  };

  $scope.finish = function() {
      $uibModalInstance.close($scope.currentUser);
  };

  $scope.cancel = function() {
      $uibModalInstance.close(false);
  };

  $scope.fileChange = function(file) {
    $scope.file = file;
  };

  $scope.submitImage = function () {
    $scope.upload($scope.file);
  };

  // upload on file select or drop
  $scope.upload = function (file, isCropped) {
    var uploadUrl = isCropped ? '/api/uploads/crop' : '/api/uploads/image';
    Upload.upload({
      url: uploadUrl,
      data: {file: file}
    }).success(function (data, status, headers, config) {
      if (isCropped) {
        $scope.currentUser.croppedImage = data;
        $rootScope.user.croppedImage = data;
      } else {
        $scope.currentUser.image = data;
        $rootScope.user.image = data;
      }
      localStorage.user = JSON.stringify($scope.currentUser);
    })
  };
};