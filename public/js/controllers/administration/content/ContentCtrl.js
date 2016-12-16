angular.module('teachur').controller('ContentController', function ($scope, $http, $state, Models, $uibModal, pagination, $location, $filter, $rootScope, $q) {

  var modelMap = {
    objective: {
      model: Models.Objective,
      editState: 'objectives.edit',
      showState: 'objectives.view'
    },
    lesson: {
      model: Models.Lesson,
      editState: 'lessons.edit',
      showState: 'lessons.view'
    },
    course: {
      model: Models.Course,
      editState: 'courses.edit',
      showState: 'courses.view'
    },
    degree: {
      model: Models.Degree,
      editState: 'degrees.edit',
      showState: 'degrees.view'
    }
  };

  $scope.searchTexts = {
    degree: '',
    course: '',
    lesson: '',
    objective: ''
  };

  var statusMap = {
    'saved': {
      published: false,
      private: false
    },
    'published': {
      published: true,
      private: false
    },
    'publishedPrivate': {
      published: true,
      private: true
    }
  }

  $scope.filteredData = [];
  $scope.totalCount = 0;
  $scope.itemName = $rootScope.organization ? 'course' : 'degree';
  $scope.active = $rootScope.organization ? 1 : 0;
  $scope.row = '';

  $scope.dataLoading = true;

  $scope.searchPage = 1;

  $scope.query = $location.search();

  var fetchData = function (q) {
    var query = _.clone(q);

    $scope.dataLoading = true;

    return pagination.paginate(query, modelMap[$scope.itemName].model)
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

  $scope.search = function (itemName) {
    $scope.itemName = itemName || $scope.itemName;
    $scope.loadedAll = false;
    refreshQuery();
    $scope.filteredData = [];
    fetchData($scope.query);
  };

  refreshQuery();

  function refreshQuery() {
    $scope.query.searchText = $scope.searchTexts[$scope.itemName] !== '' ? $scope.searchTexts[$scope.itemName] : null;
    $scope.query.page = $scope.searchPage = 1;
    $scope.query.admin = 'true';
    $scope.query = pagination.generateQuery($scope.query);
    fetchStatisticsData();
  }

  function initialQueryCheck() {
    if ($scope.query.searchText) {
      $scope.searchTexts[$scope.itemName] = $scope.query.searchText;
    } else {
      $scope.query.searchText = $scope.searchTexts[$scope.itemName];
    }
  }

  $scope.pageChange = function () {
    $scope.searchPage++;
    var query = $scope.query;
    query.page = $scope.searchPage;
    fetchData(query);
  };

  $scope.show = function(id) {
    $state.go(modelMap[$scope.itemName].showState, {id: id});
  };

  $scope.edit = function(id) {
    $state.go(modelMap[$scope.itemName].editState, {id: id});
  };

  $scope.delete = function (item) {
    sweetAlert({
      title: "Are you sure?",
      text: "Your will not be able to recover this item!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Delete",
      closeOnConfirm: true
    }, function (isConfirm) {
      if (isConfirm) {
        var url = '/api/' + $scope.itemName + 's/' + item._id;
        return $http.delete(url)
        .then(function() {
          $scope.filteredData.splice($scope.filteredData.indexOf(item), 1);
        });
      }
    });
  };

  function fetchStatisticsData() {
    return modelMap[$scope.itemName]
    .model
    .getStatistics(function(data) {
      $scope.statistics = data;
    });
  };

  $scope.order = function (rowName) {
    $scope.row = rowName;
    $scope.query.order = rowName;
    $scope.query.page = $scope.searchPage = 1;
    $scope.search();
  };

  $scope.updateItemStatus = function (item, status) {

    var updateItem = statusMap[status];
    updateItem._id = item._id;
    updateItem.name = item.name;

    modelMap[$scope.itemName].model.save(updateItem).$promise.then(function(data) {
      sweetAlert({
        title: "Item status saved",
        type: "success",
        showCancelButton: false,
        closeOnConfirm: true
      });
    });
  };

  $scope.getItemStatus = function (item) {
    if (item.published && item.private) {
      return 'publishedPrivate';
    } else if (item.published && !item.private) {
      return 'published';
    }

    return 'saved';
  };

  $('#content').scroll(function() {
    if($('#content').scrollTop() + $('#content').height() >= $('.page').height() && !$scope.dataLoading && !$scope.loadedAll) {
      console.log('blabla');
      $scope.pageChange();
    }
  });

  $scope.openCopyContentModal = function () {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.cancel = function () {
          $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
          $uibModalInstance.close($scope.course);
        };

        $scope.searchMainContent = function (searchTerm) {
          return $q(function(resolve, reject) {
              $http.get('/api/organizations/main-content?search=' + searchTerm)
              .success(function(res) {
                  return resolve(res);
              }).error(function(err) {
                  return reject(err);
              });
          });
        };
      },
      templateUrl: window.baseUrl + '/views/administration/content/copyContentModal.html'
    });

    modalInstance.result.then(function (course) {
      $http.post('/api/organizations/copy-content', course).success(function(data) {
        $scope.search('course');
        $scope.active = 1;
      });
    });
  };

});
