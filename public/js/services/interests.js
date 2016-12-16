angular.module('teachur')
.service('Interests', Interests);

function Interests($http, $q) {
  this.urlMap = {
    'personal': '/api/personal-interests',
    'academic': '/api/interests',
  };

  this.interests = [];

  this.getAll = function(type) {
    var _this = this;
    
    return $q(function(resolve, reject) {
      return $http.get(_this.urlMap[type])
      .success(function(res) {
        _this.interests = res;
        return resolve(res);
      }).error(function(err) {
        return reject(err);
      });

    });

  };

  this.create = function(interest, type) {
    var _this = this;
    
    return $q(function(resolve, reject) {
      if (interest._id) {
        return resolve(interest);
      }

      return $http.post(_this.urlMap[type], interest)
      .success(function(res) {
        _this.interests = res;
        return resolve(res);
      }).error(function(err) {
        return reject(err);
      });

    });
  };

  this.search = function(type, query) {
    var _this = this;
    return $http.get(_this.urlMap[type] + '/search?searchText=' + query).success(function(data) {
      return data;
    });
  };

  return this;
};