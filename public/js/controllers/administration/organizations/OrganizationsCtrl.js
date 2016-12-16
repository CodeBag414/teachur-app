angular.module('teachur').controller('OrganizationsController', function ($scope, $http, $uibModal) {
  
  function loadOrganizations() {
    $http.get('/api/organizations').success(function(data) {
      return $scope.organizations = data;
    });
  }

  $scope.openAddOrganizationModal = function () {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.userEmail = '';
        $scope.cancel = function () {
          $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
          $uibModalInstance.close($scope.organization);
        };
      },
      templateUrl: window.baseUrl + '/views/administration/organizations/addOrganizationModal.html'
    });

    modalInstance.result.then(function (organization) {
      $http.post('/api/organizations', organization).success(function(data) {
        loadOrganizations();
      });
    });
  };

  $scope.save = function() {
    var promises = [];

    $scope.settings.forEach(function(setting) {
      promises.push($http.put('/api/settings/' + setting._id, setting));
      return $q.all(promises);
    });
  };

  loadOrganizations();

});
