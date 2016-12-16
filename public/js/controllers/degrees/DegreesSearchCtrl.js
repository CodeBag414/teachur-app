angular.module('teachur').controller('DegreesSearchController', function ($scope, $http, $state, Models, $uibModal, pagination, $location) {
  $scope.searchText = '';
  $scope.filteredData = [];
  $scope.totalCount = 0;

  $scope.searchByTitle = 1;

  $scope.dataLoading = true;

  $scope.searchPage = 1;

  $scope.query = $location.search();

  var fetchData = function (q) {
    var query = _.clone(q);

    $scope.dataLoading = true;

    return pagination.paginate(query, Models.Degree)
      .then(function (results) {
        $scope.dataLoading = false;
        $scope.filteredData = _.concat($scope.filteredData, results.items);
        $scope.totalCount = results.count;
        if (results.count < $scope.searchPage * 9) {
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

  $scope.$watch('searchByTitle', function () {
    refreshQuery();
    fetchData($scope.query);
  });

  function refreshQuery() {
    $scope.query.searchText = $scope.searchText !== '' ? $scope.searchText : null;
    $scope.query.page = $scope.searchPage = 1;
    $scope.query.searchByTitle = $scope.searchByTitle.toString();
    $scope.query.populate = 1;
    $scope.query.limit = 9;
    $scope.query = pagination.generateQuery($scope.query);
    $scope.filteredData = [];
  }

  function initialQueryCheck() {
    if ($scope.query.searchText) {
      $scope.searchText = $scope.query.searchText;
    } else {
      $scope.query.searchText = $scope.searchText;
    }
    if ($scope.query.searchByTitle) {
      $scope.searchByTitle = $scope.query.searchByTitle;
    } else {
      $scope.query.searchByTitle = $scope.searchByTitle;
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

});
