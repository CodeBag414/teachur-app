angular.module('teachur').directive('sidebar', ['Models', '$filter', '$http', function (Models, $filter, $http) {
  return {
    restrict: 'AEC',
    scope: {
      relatedModels: '=',
      currentModel: '='
    },
    templateUrl: window.baseUrl + '/views/directives/sidebar.html',
    replace: true,
    link: function ($scope, $element, attr, ctrl) {
      $scope.searchText = "";
      $scope.modelName = $scope.relatedModels[0];
      $scope.relatedModelsData = {};
      $scope.relatedModelsFilteredData = {};
      $scope.relatedModelsMap = {
        'objective': {
          model: Models.Objective,
          name: 'objective',
          pluralName: 'Objectives',
          panelClass: 'panel-primary'
        },
        'lesson': {
          model: Models.Lesson,
          name: 'lesson',
          pluralName: 'Lessons',
          panelClass: 'panel-lesson'
        },
        'course': {
          model: Models.Course,
          name: 'course',
          pluralName: 'Courses',
          panelClass: 'panel-course'
        },
        'degree': {
          model: Models.Degree,
          name: 'degree',
          pluralName: 'Degrees',
          panelClass: 'panel-degree'
        }
      };

      $scope.getPanelClass = function() {
        if ($scope.relatedModels.length === 1) {
          return 'panel-primary';
        }

        return $scope.relatedModelsMap[$scope.relatedModels[1]].panelClass;
      };

      $scope.setActiveModel = function (modelName) {
        $scope.modelName = modelName;
      };

      $scope.search = function () {
        var searchText = $scope.searchText.toLowerCase();
        $scope.relatedModelsMap[$scope.modelName].model.search({
          searchText: searchText,
          searchByTitle: 1
        }, function (response) {
          console.log(response);
          $scope.relatedModelsFilteredData[$scope.modelName] = response.items;
          $scope.relatedModelsData[$scope.modelName] = response.items;
        });
      };

      if ($scope.relatedModels.indexOf('objective') !== -1) {
        $scope.relatedModelsData['objective'] = {};
        $scope.relatedModelsFilteredData['objective'] = {};
        $scope.relatedModelsMap['objective'].model.search({
          searchText: $scope.searchText.toLowerCase(),
          searchByTitle: 1
        }, function (related) {
          $scope.relatedModelsData['objective'] = related.items;
          $scope.relatedModelsFilteredData['objective'] = related.items;
        });
      }

      if ($scope.relatedModels.indexOf('lesson') !== -1) {
        $scope.relatedModelsData['lesson'] = {};
        $scope.relatedModelsFilteredData['lesson'] = {};
        $scope.relatedModelsMap['lesson'].model.search({
          searchText: $scope.searchText.toLowerCase(),
          searchByTitle: 1
        }, function (related) {
          $scope.relatedModelsData['lesson'] = related.items;
          $scope.relatedModelsFilteredData['lesson'] = related.items;
        });
      }

      if ($scope.relatedModels.indexOf('course') !== -1) {
        $scope.relatedModelsData['course'] = {};
        $scope.relatedModelsFilteredData['course'] = {};
        $scope.relatedModelsMap['course'].model.search({
          searchText: $scope.searchText.toLowerCase(),
          searchByTitle: 1
        }, function (related) {
          $scope.relatedModelsData['course'] = related.items;
          $scope.relatedModelsFilteredData['course'] = related.items;
        });
      }

      if ($scope.relatedModels.indexOf('degree') !== -1) {
        $scope.relatedModelsData['degree'] = {};
        $scope.relatedModelsFilteredData['degree'] = {};
        $scope.relatedModelsMap['degree'].model.search({
          searchText: $scope.searchText.toLowerCase(),
          searchByTitle: 1
        }, function (related) {
          $scope.relatedModelsData['degree'] = related.items;
          $scope.relatedModelsFilteredData['degree'] = related.items;
        });
      }
    }
  };
}]);