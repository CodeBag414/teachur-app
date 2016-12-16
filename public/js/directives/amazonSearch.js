angular.module('teachur')
.directive('amazonSearch', function (AmazonService) {
  return {
    restrict: 'AEC',
    scope: {
      texts: '='
    },
    templateUrl: window.baseUrl + '/views/directives/amazonSearch/amazonSearch.html',
    replace: true,
    link: function($scope, $element, attr, ctrl){
      $scope.search = function(searchTerm) {
        return AmazonService
        .search(searchTerm)
        .then(function(books) {
          return books;
        });
      };

      $scope.addBook = function(book) {
        $scope.texts.push(book);
        $scope.book = undefined;
      };
    }
  };
})
.service('AmazonService', function($q, $http) {

  this.search = function(searchTerm) {
    return $q(function(resolve, reject) {
        $http.get('/api/amazon-search?search=' + searchTerm)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  return this;

});