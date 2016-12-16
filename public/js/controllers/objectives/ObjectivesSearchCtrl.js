angular.module('teachur').controller('ObjectivesSearchController', function ($scope, $http, $state, Models, $uibModal, pagination, $location) {

  $scope.searchText = '';
  $scope.filteredData = [];
  $scope.totalCount = 0;

  $scope.dataLoading = true;

  $scope.searchPage = 1;

  $scope.query = $location.search();

  var fetchData = function (q) {
    var query = _.clone(q);

    $scope.dataLoading = true;

    return pagination.paginate(query, Models.Objective)
      .then(function (results) {
        $scope.dataLoading = false;
        $scope.filteredData = _.concat($scope.filteredData, results.items);
        $scope.totalCount = results.count;
        if (results.count < $scope.searchPage * 10) {
          $scope.loadedAll = true;
        }
      });
  };

  initialQueryCheck();

  $scope.search = function () {
    refreshQuery();
    $scope.filteredData = [];
    fetchData($scope.query);
  };

  refreshQuery();

  function refreshQuery() {
    $scope.query.searchText = $scope.searchText !== '' ? $scope.searchText : null;
    $scope.query.page = $scope.searchPage = 1;
    $scope.query = pagination.generateQuery($scope.query);
  }

  function initialQueryCheck() {
    if ($scope.query.searchText) {
      $scope.searchText = $scope.query.searchText;
    } else {
      $scope.query.searchText = $scope.searchText;
    }
  }

  $scope.pageChange = function (page) {
    $scope.searchPage++;

    var query = $scope.query;
    query.page = $scope.searchPage;

    return fetchData(query);
  };

  $('#content').scroll(function() {
    if($('#content').scrollTop() + $('#content').height() >= $('.page').height() && !$scope.dataLoading && !$scope.loadedAll) {
      $scope.pageChange();
    }
  });

  fetchData($scope.query);
});
