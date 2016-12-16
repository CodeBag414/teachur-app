angular.module('teachur').controller('SearchController', function ($scope, $stateParams, $http, $state, $rootScope) {
  if ($stateParams.searchText) {
    var searchText = $stateParams.searchText;
    $rootScope.$emit('setSearchText', { searchText: searchText });
    $http.post('/api/search', {searchText: searchText}).success(function (response) {
      $state.go('search', {searchResults: response, searchText: undefined}, {reload: true});
    });
  }

  $scope.searchResults = $stateParams.searchResults;
});