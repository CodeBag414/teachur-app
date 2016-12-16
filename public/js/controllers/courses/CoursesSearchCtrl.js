angular.module('teachur').controller('CoursesSearchController', function ($scope, $http, $state, Models, $uibModal, $location, pagination) {
  $scope.searchText = '';
  $scope.filteredData = [];
  $scope.totalCount = 0;

  $scope.searchByTitle = 1;

  $scope.dataLoading = true;
  $scope.loadedAll = false;

  $scope.searchPage = 1;

  $scope.query = $location.search();

  var fetchData = function (q) {
    var query = _.clone(q);
    console.log('fetchingData');

    $scope.dataLoading = true;

    return pagination.paginate(query, Models.Course)
      .then(function (results) {
        $scope.dataLoading = false;
        $scope.filteredData = _.concat($scope.filteredData, results.items);
        if (results.count < $scope.searchPage * 9) {
          $scope.loadedAll = true;
        }
        $scope.totalCount = results.count;
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
