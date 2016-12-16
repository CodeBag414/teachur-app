angular.module('teachur').controller('UsersController', ['$scope', 'Upload', '$http', '$rootScope', '$uibModal', '$translate', 'Interests', function ($scope, Upload, $http, $rootScope, $uibModal, $translate, Interests) {

    $scope.user = JSON.parse(localStorage.user);

    if (_.isEmpty($scope.user.degrees)) {
      $scope.user.degrees.push({});
    }

    $scope.isHasImage = function () {
      return !!$scope.user.image || !!$scope.user.twitterImage || !!$scope.user.facebookImage || $scope.user.googleImage;
    };

    $scope.fileChange = function(file) {
      $scope.file = file;
    };

    $scope.openCropPopup = function () {
      var modalInstance = $uibModal.open({
        controller: 'CropModalController',
        templateUrl: window.baseUrl + '/views/modals/cropImageModal.html',
        resolve: {
          imgSrc: function () {
            return null;
          },
          cropAreaType: function () {
            return 'circle';
          }
        }
      });

      modalInstance.result.then(function (file) {
        $scope.upload(file, true);
      });
    };


    $scope.submit = function () {
      $scope.upload($scope.file);
    };

    // upload on file select or drop
    $scope.upload = function (file, isCropped) {
      console.log(file);
      var uploadUrl = isCropped ? '/api/uploads/crop' : '/api/uploads/image';
      Upload.upload({
        url: uploadUrl,
        data: {file: file}
      }).success(function (data, status, headers, config) {
        console.log('uploaded:', data);
        if (isCropped) {
          $scope.user.croppedImage = data;
          $rootScope.user.croppedImage = data;
        } else {
          $scope.user.image = data;
          $rootScope.user.image = data;
        }
        localStorage.user = JSON.stringify($scope.user);
      })
    };

    $scope.saveUser = function () {
      $http.put('/api/current-user', $scope.user).success(function (user) {
        $scope.user = user;
        $rootScope.user = user;
        localStorage.user = JSON.stringify($scope.user);
      })
    };

    $translate(Interests).then(function (translations) {
      $scope.interests = _.values(translations);
    });

  }])
  .controller('CropModalController', function ($scope, $uibModalInstance, imgSrc, cropAreaType) {

    $scope.user = JSON.parse(localStorage.user);
    $scope.cropCoordinates = {};
    $scope.cropBlob = '';

    $scope.cropAreaType = cropAreaType ? cropAreaType : 'circle';

    $scope.image = $scope.user.image
      ? $scope.user.image
      : $scope.user.twitterImage ? $scope.user.twitterImage
      : $scope.user.facebookImage ? $scope.user.facebookImage
      : $scope.user.googleImage;

    if (imgSrc) {
      $scope.image = imgSrc;
    }

    $scope.croppedImage = '';

    $scope.refreshData = function (value) {
      $scope.cropBlob = value;
    };

    $scope.submit = function (value) {
      var file = new File([value], 'testImage.png');
      $uibModalInstance.close(file);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });