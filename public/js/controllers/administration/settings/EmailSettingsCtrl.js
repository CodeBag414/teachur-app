angular.module('teachur').controller('EmailSettingsController', function ($scope, $http, $q) {
  
  $http.get('/api/settings').success(function(data) {
    if (_.isEmpty(data)) {
      return $scope.settings = [
        { key: 'welcomeTemplate', value: '' },
        { key: 'forgotPasswordTemplate', value: '' },
        { key: 'grantAccessTemplate', value: '' }
      ];
    };

    return $scope.settings = data;
  });

  $scope.save = function() {
    var promises = [];

    $scope.settings.forEach(function(setting) {
      promises.push($http.put('/api/settings/' + setting._id, setting));
      return $q.all(promises);
    });
  };

});
