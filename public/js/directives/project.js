angular.module('teachur')
.directive('project', ['$translate', 'Upload', '$q', 'ProjectService', '$timeout', '$http', '$state', '$rootScope', function ($translate, Upload, $q, ProjectService, $timeout, $http, $state, $rootScope) {
  return {
    restrict: 'AEC',
    scope: {
      itemName: '@',
      item: '=',
      edit: '=editMode',
      viewMode: '='
    },
    templateUrl: window.baseUrl + '/views/directives/project/project.html',
    replace: true,
    link: function($scope, $element, attr, ctrl){
      $scope.user = $rootScope.user;
      $scope.editMode = [];
      $scope.item.projects = ProjectService.projects;
      $scope.userProjects = ProjectService.getUserProjects($scope.user);

      var updateIndex = 0;

      $scope.editMode = _.map(ProjectService.projects, function() {
        return $scope.edit;
      });

      var classMap = {
        'objective': 'panel-primary',
        'lesson': 'panel-lesson',
        'course': 'panel-course',
        'degree': 'panel-degree',
      };

      $scope.getPanelClass = function() {
        return classMap[$scope.itemName];
      };

      $scope.addProject = function() {
        $scope.editMode.push(true);

        return $scope.item.projects.push({
          files: [],
          new: true
        });
      };

      $scope.removeProject = function(index) {
        var project = $scope.item.projects[index];
        $scope.item.projects.splice(index, 1);
        ProjectService.delete(project)
        .then(function(a) {
          if ($scope.viewMode) {
            return $scope.item.$save();
          }
        });
      };

      $scope.saveProject = function(project, index) {
        ProjectService.saveOne(project, $scope.itemName, $scope.item)
        .then(function(a) {
          project = a;
          $scope.editMode = [];
          $scope.item.$get();
        });
      };

      $scope.uploadStudentProject = function(file, projectId) {
        return ProjectService.uploadStudentProject(file, projectId).then(function() {
          $http.get('/api/current-user').success(function (user) {
            localStorage.user = JSON.stringify(user);
            $rootScope.user = user;
            $scope.user = user;
            $scope.userProjects = ProjectService.getUserProjects($scope.user);
          });
        })
      };

      $scope.deleteStudentProject = function(userProjectId) {
        var projectIndex = _.findIndex($scope.user.projects, function(p) { return p._id === userProjectId });
        if (projectIndex !== -1) {
          $scope.user.projects.splice(projectIndex, 1);
          $http.put('/api/current-user', $scope.user).success(function (user) {
            $http.get('/api/current-user').success(function (user) {
              localStorage.user = JSON.stringify(user);
              $rootScope.user = user;
              $scope.user = user;
              $scope.userProjects = ProjectService.getUserProjects($scope.user);
            });
          })
        }
      };

    }
  };
}])

.directive('projectWidget', ['ProjectService', '$rootScope', '$http', function (ProjectService, $rootScope, $http) {
  return {
    restrict: 'AEC',
    scope: {
      itemName: '@',
      item: '='
    },
    templateUrl: window.baseUrl + '/views/directives/project/project-widget.html',
    replace: true,
    link: function($scope, $element, attr, ctrl){
      $scope.projects = ProjectService.projects;
      $scope.user = $rootScope.user;
      $scope.userProjects = {};

      $scope.userProjects = ProjectService.getUserProjects($scope.user);

      var classMap = {
        'objective': 'panel-primary',
        'lesson': 'panel-lesson',
        'course': 'panel-course',
        'degree': 'panel-degree'
      };

      $scope.getPanelClass = function() {
        return classMap[$scope.itemName];
      };

      $rootScope.$watch('user.projects', function(oldVal, newVal) {
        if (oldVal !== newVal) {
          $scope.userProjects = ProjectService.getUserProjects($rootScope.user);
        }
      })

    }
  }
}])

.factory('ProjectService', function($q, $http, FilesService) {
  this.projects = [];

  this.set = function(projects) {
    this.projects = projects;
  };

  this.reset = function() {
    this.projects = [];
  };

  this.saveAll = function() {
    var _this = this;
    var promises = [];
    var projects = [];

    _this.projects.forEach(function(project, i) {
      if (project._id) {
        return promises.push(_this.save(project));
      }

      return promises.push(_this.create(project));
    });

    return $q.all(promises)
    .then(function(a) {
      projects = a;
    })
    .then(function() {
      return FilesService.uploadProjectsFiles(_this.projects, projects);
    })
    .then(function() {
      return projects;
    });
  };

  this.saveOne = function(newProject, itemName, item) {
    var _this = this;
    var promise;
    var project;

    if (newProject._id) {
      promise = _this.save(newProject);
    } else {
      promise = _this.createAndUpdateParentItem(newProject, itemName, item);
    }

    return promise
    .then(function(a) {
      project = a;
      return FilesService.uploadProjectsFiles([newProject], [project]);
    })
    .then(function() {
      return project;
    });
  };

  this.save = function(project) {
    return $q(function(resolve, reject) {
        $http.put('/api/projects/' + project._id, project)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.create = function(project) {
    return $q(function(resolve, reject) {
        $http.post('/api/projects', project)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.delete = function(project) {
    return $q(function(resolve, reject) {

        if (!project._id) {
          return resolve(false);
        };

        $http.delete('/api/projects/' + project._id)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.createAndUpdateParentItem = function(project, itemName, item) {
    return $q(function(resolve, reject) {
        $http.post('/api/projects/' + itemName + '/' + item._id, project)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.uploadStudentProject = function(file, projectId) {
    return FilesService.uploadStudentProject(file, projectId);
  };

  this.getUserProjects = function getUserProjects(user) {
    var _this = this;
    var userProjects = {};
    _.each(user.projects, function(userProject) {
      _.each(_this.projects, function(p) {
        if (p._id === userProject.project._id) {
          userProjects[userProject.project._id] = userProjects[userProject.project._id] || [];
          userProjects[userProject.project._id].push(userProject);
        }
      });
    });

    return userProjects;
  };

  return this;

});