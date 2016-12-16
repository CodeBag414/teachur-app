angular.module('teachur')
.directive('keywords', ['$http', function ($http) {
  return {
    restrict: 'AEC',
    scope: {
      keywords: '=',
      editMode: '='
    },
    templateUrl: window.baseUrl + '/views/directives/keywords.html',
    replace: true,
    link: function($scope, $element, attr, ctrl) {
      $scope.searchKeywords = function (query) {
        return $http.get('/api/keywords/search?searchText=' + query).success(function(data) {
          return data;
        });
      };
    }
  };
}]);