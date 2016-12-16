angular.module('teachur').directive('addMedia', ['$uibModal', '$rootScope', 'AssessmentService', 'FilesService', function($uibModal, $rootScope, AssessmentService, FilesService) {
    return {
        restrict: 'AEC',
        scope: {
            file: '=',
            editMode: '=',
            files: '=',
            index: '=',
            smallBtn: '=',
            item: '=',
            viewMode: '=',
            itemName: '@',
            isProject: '='
        },
        templateUrl: window.baseUrl + '/views/directives/addMedia.html',
        replace: false,
        link: function($scope, $element, attr, ctrl){
            debugger;
            $scope.open = function(){
                var modalInstance = $uibModal.open({
                    templateUrl: window.baseUrl + "/views/modals/addMediaModal.html",
                    controller: "AddMediaModalController",
                    resolve: {
                        editMode: function() {
                            return $scope.editMode;
                        },
                        file: function() {
                            return $scope.file;
                        },
                        isProject: function() {
                            return $scope.isProject;
                        }
                    }
                });

                modalInstance.result.then(function (newFile) {
                    if (!newFile) {
                        return false;
                    }

                    if (!$scope.editMode) {
                        $scope.files.push(newFile);
                    } else {
                        $scope.files[$scope.index] = newFile
                    }

                    if ($scope.viewMode) {
                        if ($scope.itemName) {
                            return FilesService.uploadObjectiveFiles($scope.item).then(function(response) {
                                if (newFile.external) {
                                    return $scope.item.$save();
                                }

                                return $scope.item.$get();
                            });
                        }
                    }

                    return true;
                }, function () {
                    console.log('modal dismissed')
                });
            }
        }
    };
}])
.controller('AddMediaModalController', function($scope, $uibModalInstance, $timeout, file, editMode, isProject) {
    $scope.file = file || {};
    $scope.editMode = editMode ? editMode : false;
    $scope.isProject = isProject;

    $scope.save = function() {
        $uibModalInstance.close($scope.file);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss(false);
    }

    $scope.addUrl = function (index, url) {
      var fileId = $scope.file ? $scope.file._id : false;
      $scope.file = { url: false };
      $timeout(function() {
        if (fileId) {
          return $scope.file = { _id: fileId, url: url, external: true };
        }

        return $scope.file = { url: url, external: true };
      });
    };

    $scope.addNewFile  = function(index, file) {
        var fileId = $scope.file ? $scope.file._id : false;
        $scope.file = { url: false };
        
        if (fileId) {
            file._id = fileId;
        }

        $timeout(function() {
            file.newFile = true;
            $scope.file = file;
        });
    };
});