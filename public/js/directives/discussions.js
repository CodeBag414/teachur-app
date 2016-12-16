(function() {
    angular.module('teachur').directive('discussion', ['Models', '$rootScope',function(Models,$rootScope) {
        return {
            restrict: 'AEC',
            scope: {
                object: '=',
                remove:'&onRemove',
                position:'@'
            },
            templateUrl: window.baseUrl + '/views/directives/discussion/discussion.html',

            controller: function($scope) {
                $scope.showAlert = false;
                $scope.editMode = false;
                $scope.curr_user = $rootScope.user;
                $scope.discussion = new Models.Discussion($scope.object)
                $scope.text = $scope.discussion.title
                $scope.title = $scope.discussion.discussionBody

                $scope.deleteDiscussion = function() {

                  $scope.discussion.$delete(function (response) {
                     $scope.remove({position:$scope.position})
                  });
                 };
                $scope.showCancelAlert = function() {
                   $scope.discussion["showAlert"]  = !$scope.discussion["showAlert"];
                };
                $scope.isOwn = function() {
                   return $scope.curr_user._id === $scope.discussion.author._id || $rootScope.isAdmin()
                };
                $scope.toggleEditMode= function(){
                  $scope.editMode = !$scope.editMode
                }
                $scope.cancel = function(){
                  $scope.text = $scope.discussion.title
                  $scope.title = $scope.discussion.discussionBody
                  $scope.toggleEditMode()
                }
                $scope.update = function(){
                  $scope.discussion.title = $scope.title
                  $scope.discussion.discussionBody = $scope.text
                  $scope.discussion.$update(function(response){
                    $scope.toggleEditMode()
                    console.log(response);
                  })
                }

            }

        };
    }]).directive('discussionsPanel', ['Models', '$rootScope',function(Models,$rootScope) {
        return {
            restrict: 'AEC',
            scope: {
                modelid: '@',
                model: '@',
                modelName: '@'
            },
            templateUrl: window.baseUrl + '/views/directives/discussion/discussionsPanel.html',
            link: function(scope, element, attributes) {
                attributes.$observe('modelid', function(value) {
                    if (value) {
                        scope.modelid = value;
                        scope.model = attributes["model"];

                    }
                });

            },
            controller: function($scope) {
                var classMap = {
                  'objective': 'panel-primary',
                  'lesson': 'panel-lesson',
                  'course': 'panel-course',
                  'degree': 'panel-degree'
                };

                $scope.getPanelClass = function() {
                  return classMap[$scope.modelName];
                };

                $scope.curr_user = $rootScope.user;
                $scope.formActive = false;
                $scope.discussion = new Models.Discussion();
                $scope.discussion.model = $scope.model
                $scope.discussion.model_id = $scope.modelid

                Models.Discussion.queryFor({
                    id: $scope.modelid,model: $scope.model
                }).$promise.then(function(res) {
                     delete res._id;
                    $scope.discussions = res;
                });
                $scope.createDiscussion = function() {
                    $scope.discussion.$create(function(response) {
                        $scope.discussion = new Models.Discussion();
                        $scope.discussion.model = $scope.model
                        $scope.discussion.model_id = $scope.modelid
                        $scope.discussions.push(response)
                        $scope.toggleForm()

                    });


                };
                $scope.toggleForm = function() {
                  $scope.formActive = !$scope.formActive
                };
                $scope.isFormActive = function() {
                    return $scope.formActive;
                };
                $scope.removeDiscussion = function(position) {

                  $scope.discussions.splice(position, 1);

                };

            }

        };
    }]).filter('userImage', function() {

        return function(user){
          var img = window.baseUrl + "/images/default-avatar.png";

          if (user.facebookImage && !user.image)
              img = user.facebookImage
          if (user.twitterImage && !user.image)
              img = user.twitterImage
          if (user.image && !user.croppedImage)
              img = user.image.url
          if (user.croppedImage && user.croppedImage.url)
              img = user.croppedImage.url;


          return img;
        };
    });


})()
