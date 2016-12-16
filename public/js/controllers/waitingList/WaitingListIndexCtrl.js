angular.module('teachur').controller('WaitingListIndexController', function ($scope, users, Models, $uibModal, $http) {
  $scope.users = users;

  $scope.grantAccess = function (user) {
    user.$grantAccess(function (res) {
      user.signupToken = res.signupToken;
    });
  };

  $scope.filteredData = users;
  $scope.searchText = '';

  $scope.search = function () {
    var searchText = $scope.searchText.toLowerCase();
    $scope.filteredData = [];
    angular.forEach($scope.users, function (item) {
      if (item.email.toLowerCase().indexOf(searchText) >= 0) {
        $scope.filteredData.push(item);
      }
    });
  };

  $scope.delete = function(user) {
    sweetAlert({
      title: "Are you sure?",
      text: "Your will not be able to recover this user!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Delete",
      closeOnConfirm: true
    }, function (isConfirm) {
      if (isConfirm) {
        $http.delete('/api/waiting-list/' + user._id).then(function() {
          $scope.filteredData.splice($scope.filteredData.indexOf(user), 1);
        });
      }
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
        Models.WannabeUser.query(function(res) {
          $scope.filteredData = res;
        });
      });
    });
  };

});
