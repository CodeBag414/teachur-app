angular.module('teachur').controller('UsersIndexController', function ($scope, $filter, SweetAlert, $http, pagination, $location, Models, $uibModal, CurrentUser) {

  $scope.toggleAdmin = function (u) {
    user = new Models.User(u);
    user.admin = !user.admin;
    user.$save(function (res) {
      console.log('admin rights added');
      $scope.search();
    });
  };

  $scope.searchText = '';
  $scope.filteredData = [];
  $scope.totalCount = 0;
  $scope.searchType = 'username';
  $scope.searchPage = 1;
  $scope.row = '';
  $scope.query = $location.search();
  $scope.query.limit = 20;
  $scope.usersTeacherStudent = {};

  $scope.order = function (rowName) {
    $scope.row = rowName;
    $scope.query.order = rowName;
    $scope.search();
  };

  $scope.search = function () {
    refreshQuery();
    $scope.filteredData = [];
    fetchData($scope.query);
  };

  refreshQuery();
  fetchData($scope.query);

  function refreshQuery() {
    $scope.query.searchText = $scope.searchText !== '' ? $scope.searchText : null;
    
    if ($scope.query.searchText) {
      $scope.query.searchField = $scope.searchType;
    }

    $scope.query.page = $scope.searchPage = 1;
    $scope.query = pagination.generateQuery($scope.query);
  }

  function fetchData(q) {
    var query = _.clone(q);

    $scope.dataLoading = true;

    return pagination.paginate(query, Models.User)
      .then(function (results) {
        $scope.dataLoading = false;
        $scope.filteredData = _.concat($scope.filteredData, results.items);
        $scope.totalCount = results.count;

        populateTeacherStudentRole()

        if (results.count < $scope.searchPage * 20) {
          $scope.loadedAll = true;
        }

      });
  };

  function populateTeacherStudentRole() {
    _.forEach($scope.filteredData, function(user) {
      $scope.usersTeacherStudent[user._id] = user.isTeacher ? 'teacher' : 'student';
    });
  }

  $scope.changeUserRole = function(u, value) {
    user = new Models.User(u);
    user.isTeacher = value === 'teacher';
    user.isStudent = value === 'teacher' || value === 'student';
    user.$save(function (res) {
      console.log('admin rights added');
      $scope.search();
    });
  };

  $scope.delete = function (user) {
    sweetAlert({
      title: "Are you sure?",
      text: "Your will not be able to recover this user!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Delete",
      closeOnConfirm: true
    }, function (isConfirm) {
      if (isConfirm) {
        $http.delete('/api/users/' + user._id).then(function() {
          $scope.filteredData.splice($scope.filteredData.indexOf(user), 1);
        });
      }
    });
  };

  $scope.pageChange = function (page) {
    $scope.searchPage++;
    var query = $scope.query;
    query.page = $scope.searchPage;
    fetchData(query);
  };

  $http.get('/api/users/statistics').success(function(data) {
    $scope.statistics = data;
  });

  $('#content').scroll(function() {
    if($('#content').scrollTop() + $('#content').height() >= $('.page').height() && !$scope.dataLoading && !$scope.loadedAll) {
      $scope.pageChange();
    }
  });

  $scope.openManageMandatoryCoursesPopup = function (userId) {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models, $q, $http) {

        Models.User.get({id: userId}).$promise.then(function(res) {
          $scope.user = res;
          $scope.mandatoryCourses = $scope.user.mandatoryCourses;
        });

        $scope.search = function (searchTerm) {
          return $q(function(resolve, reject) {
              $http.get('/api/courses/search?searchByTitle=1&page=1&limit=10&searchText=' + searchTerm)
              .success(function(res) {
                  return resolve(res.items);
              }).error(function(err) {
                  return reject(err);
              });
          });
        };

        $scope.selectCourse = function (course) {
          $scope.newCourse = undefined;
          $scope.mandatoryCourses.push(course);
          $scope.mandatoryCourses = _.uniqBy($scope.mandatoryCourses, '_id');
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
          return $http.post('/api/users/' + $scope.user._id + '/manage-mandatory-courses', { mandatoryCourses: $scope.mandatoryCourses })
          .success(function(res) {
            $uibModalInstance.close();
          }).error(function(err) {
            $scope.error = err;
          });
        };
      },
      templateUrl: window.baseUrl + '/views/users/manageMandatoryCoursesModal.html'
    });

    modalInstance.result.then(function (mandatoryCourses) {
    });
  };

});
