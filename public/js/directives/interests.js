angular.module('teachur')
.directive('interests', ['$http', 'Interests', function ($http, Interests) {
  return {
    restrict: 'AEC',
    scope: {
      currentUser: '=',
      type: '@'
    },
    templateUrl: window.baseUrl + '/views/directives/interests.html',
    replace: true,
    link: function($scope, $element, attr, ctrl) {
      var interestsArrayKey = $scope.type === 'academic' ? 'interests' : 'personalInterests';
      var chunkSize = $scope.chunkSize = $scope.type === 'academic' ? 27 : 30;
      var defaultInterests;
      $scope.newInterest = '';
      $scope.currentUser[interestsArrayKey] = $scope.currentUser[interestsArrayKey] || [];

      Interests
      .getAll($scope.type)
      .then(function(interests) {
        defaultInterests = _.filter(interests, function(o) { return !o.userCreated });
        $scope.userCreatedInterests = _.filter($scope.currentUser[interestsArrayKey], function(o) { return o.userCreated });
        $scope.checked = _.map(defaultInterests, function(o) { return !!_.find($scope.currentUser[interestsArrayKey], function(obj) { return obj._id === o._id }) })
        $scope.interestGroups = _.chunk(defaultInterests, chunkSize);
      });

      $scope.addUserInterest = function(newInterest) {
        Interests.create(newInterest, $scope.type).then(function(interest) {
          $scope.addInterest(true, interest);
        });
      };

      $scope.removeUserInterest = function(interest) {
        console.log(interest);
        var index = _.findIndex($scope.currentUser[interestsArrayKey], interest);
        $scope.addInterest(false, interest);
      };

      $scope.addInterest = function(isChecked, interest) {
        if (isChecked) {
          return $scope.currentUser[interestsArrayKey].push({ _id: interest._id });
        }

        var interestIndex = _.findIndex($scope.currentUser[interestsArrayKey], function(o) { return o._id == interest._id; });

        $scope.currentUser[interestsArrayKey].splice(interestIndex, 1);
      };

      $scope.searchInterests = function(query) {
        return Interests.search($scope.type, query);
      }
    }
  };
}]);