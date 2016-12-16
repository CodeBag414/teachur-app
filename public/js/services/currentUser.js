angular.module('teachur')
.factory('CurrentUser', CurrentUser);

function CurrentUser($http, $q, $rootScope) {

  this.toggleComplete = function (itemId) {
    var _this = this;

    return $q(function(resolve, reject) {
      return $http.post('/api/current-user/toggle-complete/' + itemId)
      .success(function(res) {
        return _this.get().then(resolve);
      }).error(function(err) {
        return reject(err);
      });

    });
  };

  this.toggleEnroll = function(itemName, itemId) {
    var _this = this;

    if (_this.isEnrolled(itemName, itemId)) {
      return _this.dropOut(itemName, itemId);
    } else {
      return _this.enroll(itemName, itemId);
    }
  };

  this.enroll = function (itemName, itemId) {
    var _this = this;

    return $q(function(resolve, reject) {
      return $http.post('/api/current-user/enroll/' + itemName + '/' + itemId)
      .success(function(res) {
        return _this.get().then(resolve);
      }).error(function(err) {
        return reject(err);
      });

    });
  };

  this.dropOut = function (itemName, itemId) {
    var _this = this;

    return $q(function(resolve, reject) {
      return $http.post('/api/current-user/drop-out/' + itemName + '/' + itemId)
      .success(function(res) {
        return _this.get().then(resolve);
      }).error(function(err) {
        return reject(err);
      });

    });
  };

  this.get = function() {

    return $q(function(resolve, reject) {
      return $http.get('/api/current-user')
      .success(function(user) {
        localStorage.user = JSON.stringify(user);
        $rootScope.user = user;
        return resolve(user);
      }).error(function(err) {
        return reject(err);
      });

    });
    
  };

  this.isEnrolled = function(itemName, itemId) {
    if (!$rootScope.user) return false;
    var items = itemName === 'degree' ? $rootScope.user.enrolledDegrees : $rootScope.user.enrolledCourses;
    return _.findIndex(items, { _id: itemId }) !== -1;
  };

  this.isCompleted = function(itemId) {
    if (!$rootScope.user) return false;
    return _.findIndex($rootScope.user.completedObjectives, { _id: itemId }) !== -1;
  };

  this.isTested = function(itemId) {
    if (!$rootScope.user) return false;
    return _.indexOf($rootScope.user.testedObjectives, itemId) !== -1;
  };

  this.isMandatoryCourse = function(itemId) {
    if (!$rootScope.user) return false;
    return _.findIndex($rootScope.user.mandatoryCourses, { _id: itemId }) !== -1;
  };

  this.getCompletionStatus = function(itemId) {
    if (!$rootScope.user) return false;
    return $rootScope.user.completionStatuses[itemId];
  };

  this.calculateLessonCompletion = function(lesson, course) {
    if (this.isEnrolled('course', course._id)) {
      var completedObjectivesForLesson = _.intersectionBy(lesson.components, $rootScope.user.completedObjectives, '_id');
      var status = completedObjectivesForLesson.length / lesson.components.length;
      return _.round(status * 100, 0);
    }
  };

  return this;
}