angular.module('teachur').controller('CoursesCreateController', ['$scope', '$http', '$state', 'Models', '$uibModal', '$rootScope', 'Upload', 'ProjectService', function ($scope, $http, $state, Models, $uibModal, $rootScope, Upload, ProjectService) {

  $scope.course = new Models.Course();
  $scope.course.recommendedMedia = [];
  $scope.course.relatedCourses = [];
  $scope.course.prerequisites = [];
  $scope.course.components = [];
  $scope.course.suggestedTexts = [];
  $scope.course.keywords = [];
  $scope.course.private = false;
  $scope.course.goals = [];

  $scope.newGoalName = '';

  ProjectService.reset();

  $scope.onDropCompletePrerequisites = function (prerequisiteCourse, event) {
    $scope.course.prerequisites.push(prerequisiteCourse);
  };

  $scope.onDropCompleteRelated = function (relatedCourse, event) {
    $scope.course.relatedCourses.push(relatedCourse);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.course.components.push(componentObjective);
  };

  $scope.createCourse = function () {
    ProjectService.saveAll().then(function(projects) {
      $scope.course.projects = projects;
      $scope.course.$create(function (response) {
        $scope.uploadImage(response._id);
      });
    });
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.course.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.course = data;
  });

  $scope.checkIfEnterAndAddGoal = function (event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      event.preventDefault();
      $scope.course.goals.push($scope.newGoalName);
      $scope.newGoalName = '';
    }
  };

  $scope.removeGoal = function (goal) {
    _.pull($scope.course.goals, goal);
  };

  $scope.saveAndCreateNew = function (routeName) {
    var modalInstance = $uibModal.open({
      controller: function ($scope, $uibModalInstance, Models) {
        $scope.name = 'lesson';
        $scope.createdObject = new Models[routeName]();

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        $scope.create = function () {
          $scope.createdObject.$create(function (response) {
            $uibModalInstance.close(response);
          });
        };
      },
      templateUrl: window.baseUrl + '/views/modals/fastCreateModal.html'
    });

    modalInstance.result.then(function (newObj) {
      $scope.course.components.push(newObj);
    });
  };

  $scope.publish = function () {
    $scope.course.published = true;
    $scope.createCourse();
  };

  $scope.uploadImage = function (courseId) {
    if ($scope.file) {
      Upload.upload({
        url: '/api/uploads/course/' + courseId,
        data: {file: $scope.file}
      }).success(function (data, status, headers, config) {
        $state.go('courses.view', {id: courseId});
      })
    } else {
      $state.go('courses.view', {id: courseId});
    }
  };

}]);

angular.module('teachur').controller('CoursesEditController', function ($scope, $http, $state, Models, $uibModal, course, $rootScope, Upload, ProjectService) {
  $scope.course = course;

  $scope.newGoalName = '';

  ProjectService.set($scope.course.projects);

  $scope.onDropCompletePrerequisites = function (prerequisiteCourse, event) {
    $scope.course.prerequisites.push(prerequisiteCourse);
  };

  $scope.onDropCompleteRelated = function (relatedCourse, event) {
    $scope.course.relatedCourses.push(relatedCourse);
  };

  $scope.onDropCompleteComponents = function (componentObjective, event) {
    $scope.course.components.push(componentObjective);
  };

  $scope.createCourse = function () {
    ProjectService.saveAll().then(function(projects) {
      $scope.course.projects = projects;
      $scope.course.$save(function (response) {
        $scope.uploadImage(response._id);
      });
    });
  };

  $scope.checkIfEnterAndAddGoal = function (event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      event.preventDefault();
      $scope.course.goals.push($scope.newGoalName);
      $scope.newGoalName = '';
    }
  };

  $scope.removeGoal = function (goal) {
    _.pull($scope.course.goals, goal);
  };

  $rootScope.$on('useItem', function (e, data) {
    $scope.course.components.push(data);
  });

  $rootScope.$on('copyItem', function (e, data) {
    $scope.course = data;
    $scope.course._id = course._id;
  });

  $scope.openCropPopup = function (imgSrc) {
    var modalInstance = $uibModal.open({
      controller: 'CropModalController',
      templateUrl: window.baseUrl + '/views/modals/cropImageModal.html',
      resolve: {
        imgSrc: function () {
          return imgSrc;
        },
        cropAreaType: function () {
          return 'rectangle';
        }
      }
    });

    modalInstance.result.then(function (file) {
      $scope.file = file;
      $scope.uploadImage($scope.course._id, false);
    });
  };


  $scope.saveAndCreateNew = function (routeName) {
    $scope.course.$save(function () {
      var modalInstance = $uibModal.open({
        controller: function ($scope, $uibModalInstance, Models) {
          $scope.name = 'lesson';
          $scope.createdObject = new Models[routeName]();

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.create = function () {
            $scope.createdObject.$create(function (response) {
              $uibModalInstance.close(response);
            });
          };
        },
        templateUrl: window.baseUrl + '/views/modals/fastCreateModal.html'
      });

      modalInstance.result.then(function (newObj) {
        $scope.course.components.push(newObj);
      });
    });
  };

  $scope.publish = function () {
    $scope.course.published = true;
    $scope.createCourse();
  };

  $scope.uploadImage = function (courseId, isCropped) {
    if ($scope.file) {
      Upload.upload({
        url: isCropped ? '/api/uploads/course/' + courseId + '/crop' : '/api/uploads/course/' + courseId,
        data: {file: $scope.file}
      }).success(function (data, status, headers, config) {
        console.log('imageUploaded', data);
        $state.go('courses.view', {id: courseId});
      })
    } else {
      console.log('imageNotUploaded');
      $state.go('courses.view', {id: courseId});
    }

  };

});