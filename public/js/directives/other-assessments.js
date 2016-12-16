angular.module('teachur')
.directive('otherAssessments', ['$translate', function ($translate) {
  return {
    restrict: 'AEC',
    scope: {
      itemName: '@',
      assessments: '=',
    },
    templateUrl: window.baseUrl + '/views/directives/other-assessments.html',
    replace: true,
    link: function($scope, $element, attr, ctrl) {

      $translate('directives.other-assessments.' + $scope.itemName + 'Assessments').then(function (translation) {
        $scope.panelTitle = translation
      });

      var linkMap = {
        'objective': 'objectives.view',
        'lesson': 'lessons.view',
        'course': 'courses.view',
        'degree': 'degrees.view'
      };

      $scope.assessmentsEmpty = _.isEmpty(_.filter($scope.assessments, function(a) {
        return !_.isEmpty(a);
      }));

      $scope.getLink = function (id) {
        return linkMap[$scope.itemName] + '({id:"' + id + '"})';
      };

      var classMap = {
        'objective': 'panel-primary',
        'lesson': 'panel-lesson',
        'course': 'panel-course',
        'degree': 'panel-degree',
      };

      $scope.getPanelClass = function() {
        return classMap[$scope.itemName];
      };
    }
  };
}]);
