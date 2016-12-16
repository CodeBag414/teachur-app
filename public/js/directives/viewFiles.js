angular.module('teachur')
.directive('viewFiles', ['$rootScope', 'AssessmentService', '$sce', 'ngAudio', 'FilesService', 'ProjectService', function ($rootScope, AssessmentService, $sce, ngAudio, FilesService, ProjectService) {
  return {
    restrict: 'AEC',
    scope: {
      files: '=',
      editMode: '=',
      viewMode: '=',
      item: '=',
      addMode: '=',
      isProject: '='
    },
    templateUrl: window.baseUrl + '/views/directives/viewFiles/viewFiles.html',
    replace: true,
    link: function($scope, $element, attr, ctrl) {

      $scope.videoSources = {};
      $scope.audioSources = {};

      generateSources();

      $scope.$watch('files', function(oldVal, newVal) {
        if (oldVal !== newVal) {
          generateSources();
        }
      });

      $scope.theme = 'libs/videogular-themes-default/videogular.css';

      $scope.isVideo = function (file) {
        return FilesService.isVideo(file.name || file.url);
      };

      $scope.isAudio = function (file) {
        return FilesService.isAudio(file.name || file.url);
      };

      $scope.round = function (time) {
        return _.round(time, 0);
      };

      $scope.sec2str = function (t){
        var h = ('0'+Math.floor(t/3600) % 24).slice(-2);
        var m = ('0'+Math.floor(t/60)%60).slice(-2);
        var s = ('0' + t % 60).slice(-2);

        return m+':'+s;
      };

      $scope.removeFile = function (index) {
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
            $scope.files.splice(index, 1);
            $scope.$apply();
            if ($scope.viewMode) {
              if ($scope.isProject) {
                return ProjectService.saveAll();
              };

              if ($scope.item) {
                return $scope.item.$save();
              }

              return AssessmentService.saveAll();
            }
          }
        });
      };

      function generateSources() {
        _.forEach($scope.files, function (file, i) {
          if (FilesService.isVideo(file.name || file.url)) {
            $scope.videoSources[i] = [{ src: $sce.trustAsResourceUrl(file.url), type: 'video/' + FilesService.getExtension(file.name) }];
          };

          if (FilesService.isAudio(file.name || file.url)) {
            $scope.audioSources[i] = ngAudio.load(file.url);
          };
        });
      };
    }
  };
}]);