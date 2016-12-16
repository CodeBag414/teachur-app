angular.module('teachur').directive('itemsList', ['$state', '$rootScope', 'Models', '$http', '$location', 'pagination', 'CurrentUser', function ($state, $rootScope, Models, $http, $location, pagination, CurrentUser) {
  return {
    restrict: 'AEC',
    scope: {
      items: '=',
      itemName: '=',
      isDraggable: '=',
      isSortable: '=',
      copyEnabled: '=',
      showCompletion: '=',
      currentUse: '=',
      parentItem: '=',
      user: '=',
      notOrder: '='
    },
    templateUrl: window.baseUrl + '/views/directives/itemsList.html',
    replace: true,
    link: function ($scope, $element, attr, ctrl) {
      $scope.isCollapsed = [];
      $scope.currentUser = CurrentUser;
      $scope.orderBy = $scope.notOrder ? '' : 'name';

      var itemsLength = $scope.items.length || 100;

      var itemNames = {
        objective: 'objectives',
        lesson: 'lessons',
        course: 'courses',
        degree: 'degrees'
      };

      var modelMap = {
        objective: Models.Objective,
        lesson: Models.Lesson,
        course: Models.Course,
        degree: Models.Degree,
      }

      $scope.noItemsMsg =  itemNames[$scope.itemName]  ;

      $scope.dropTarget = 'drop-' + $scope.itemName;

      var itemRoutes = {
        objective: 'objectives.view',
        lesson: 'lessons.view',
        course: 'courses.view',
        degree: 'degrees.view'
      };

      for (var i = 0; i < itemsLength; i++) {
        $scope.isCollapsed.push(true);
      }

      $scope.$watch('items', function (oldVal, newVal) {
        if (oldVal !== newVal) {
          $scope.isCollapsed.push(true);
        }
      });

      $scope.getPanelClass = function () {
        return 'panel-' + $scope.itemName;
      };

      $scope.goToItemView = function (item, event) {
        event.preventDefault();
        var itemRoute = itemRoutes[$scope.itemName];
        $state.go(itemRoute, {id: item._id});
      };

      $scope.use = function (useItem) {
        $rootScope.$broadcast("useItem", useItem);
      };

      $scope.copy = function (copyItem) {
        if ($scope.copyEnabled) {
          modelMap[$scope.itemName].get({id: copyItem._id}, function(data) {
            $rootScope.$broadcast("copyItem", _.omit(data, ['__v', '_id']));
          });
        }
      };

      $scope.hasImage = function(item) {
        return !!item.image;
      };

      $scope.addToMyModules = function (item) {
        Models.User.addToMyModules({module: item, moduleName: $scope.itemName}, function (response) {
          $http.get('/api/current-user').success(function (user) {
            localStorage.user = JSON.stringify(user);
            $rootScope.user = user;
          });
        });
      };

      $scope.isInMyModules = function (item) {
        var user = $rootScope.user;
        if (user) {
          if ($scope.itemName === 'objective') {
            return _.find(user.myObjectives, function (i) {
              //console.log(i._id === item._id);
              return i._id === item._id;
            });
          } else if ($scope.itemName === 'lesson') {
            return _.find(user.myLessons, function (i) {
              //console.log(i._id === item._id);
              return i._id === item._id;
            });
          } else if ($scope.itemName === 'course') {
            return _.find(user.myCourses, function (i) {
              //console.log(i._id === item._id);
              return i._id === item._id;
            });
          } else if ($scope.itemName === 'degree') {
            return _.find(user.myDegrees, function (i) {
              //console.log(i._id === item._id);
              return i._id === item._id;
            });
          }
        }
      };

      if ($scope.currentUse && !$scope.parentItem) {
        $scope.shouldShowComplete = !!_.find($scope.currentUse.courses, function(course) {
          return CurrentUser.isEnrolled('course', course._id);
        });
      }

      $scope.toggleComplete = function(itemId) {
        CurrentUser.toggleComplete(itemId);
      };
    }
  };
}]);
