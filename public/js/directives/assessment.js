angular.module('teachur')
.directive('assessment', ['$translate', 'Upload', '$q', 'AssessmentService', '$timeout', '$http', '$state', '$rootScope', function ($translate, Upload, $q, AssessmentService, $timeout, $http, $state, $rootScope) {
  return {
    restrict: 'AEC',
    scope: {
      itemName: '@',
      item: '=',
      edit: '=editMode',
      viewMode: '='
    },
    templateUrl: window.baseUrl + '/views/directives/assessment/assessment.html',
    replace: true,
    link: function($scope, $element, attr, ctrl){
      $scope.editMode = [];
      $scope.item.assessments = AssessmentService.assessments;
      var updateIndex = 0;

      $scope.editMode = _.map(AssessmentService.assessments, function() {
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

      $translate(['directives.assessment.longTextName', 'directives.assessment.shortTextName', 'directives.assessment.multipleChoiceName']).then(function (translations) {
        $scope.assessmentPartTypes = [
          {
            name: translations['directives.assessment.longTextName'],
            type: 'longText'
          },
          {
            name: translations['directives.assessment.shortTextName'],
            type: 'shortText'
          },
          {
            name: translations['directives.assessment.multipleChoiceName'],
            type: 'multipleChoice'
          }
        ]
      });

      $scope.addAssessmentPart = function() {
        if (!$scope.assessmentPartType) {
          return $scope.assessmentPartTypeRequiredError = true;
        }

        $scope.assessmentPartTypeRequiredError = false;
        $scope.editMode.push(true);

        if ($scope.assessmentPartType === 'multipleChoice') {
          return $scope.item.assessments.push({
            type: $scope.assessmentPartType,
            answers: [],
            files: [],
            new: true
          });
        }

        return $scope.item.assessments.push({
          type: $scope.assessmentPartType,
          files: [],
          new: true
        });
      };

      $scope.removeAssessment = function(index) {
        var assessment = $scope.item.assessments[index];
        $scope.item.assessments.splice(index, 1);
        AssessmentService.delete(assessment)
        .then(function(a) {
          if ($scope.viewMode) {
            return $scope.item.$save();
          }
        });
      };

      $scope.saveAssessment = function(assessment, index) {
        AssessmentService.saveOne(assessment, $scope.itemName, $scope.item)
        .then(function(a) {
          assessment = a;
          $scope.editMode = [];
          $scope.item.$get();
        });
      };

    }
  };
}])
.factory('AssessmentService', function($q, $http, FilesService) {
  this.assessments = [];

  this.set = function(assessments) {
    this.assessments = assessments;
  };

  this.reset = function() {
    this.assessments = [];
  };

  this.saveAll = function() {
    var _this = this;
    var promises = [];
    var assessments = [];

    _this.assessments.forEach(function(assessment, i) {
      if (assessment._id) {
        return promises.push(_this.save(assessment));
      }

      return promises.push(_this.create(assessment));
    });

    return $q.all(promises)
    .then(function(a) {
      assessments = a;
    })
    .then(function() {
      return FilesService.uploadAssessmentsFiles(_this.assessments, assessments);
    })
    .then(function() {
      return assessments;
    });
  };

  this.saveOne = function(newAssessment, itemName, item) {
    var _this = this;
    var promise;
    var assessment;

    if (newAssessment._id) {
      promise = _this.save(newAssessment);
    } else {
      promise = _this.createAndUpdateParentItem(newAssessment, itemName, item);
    }

    return promise
    .then(function(a) {
      assessment = a;
      return FilesService.uploadAssessmentsFiles([newAssessment], [assessment]);
    })
    .then(function() {
      return assessment;
    });
  };

  this.save = function(assessment) {
    return $q(function(resolve, reject) {
        $http.put('/api/assessments/' + assessment._id, assessment)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.create = function(assessment) {
    return $q(function(resolve, reject) {
        $http.post('/api/assessments', assessment)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.delete = function(assessment) {
    return $q(function(resolve, reject) {

        if (!assessment._id) {
          return resolve(false);
        };

        $http.delete('/api/assessments/' + assessment._id)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  this.createAndUpdateParentItem = function(assessment, itemName, item) {
    return $q(function(resolve, reject) {
        $http.post('/api/assessments/' + itemName + '/' + item._id, assessment)
        .success(function(res) {
            return resolve(res);
        }).error(function(err) {
            return reject(err);
        });
    });
  };

  return this;

});