(function () {
  angular.module('teachur').directive('replies', ['Models', '$rootScope', function (Models, $rootScope) {
    return {
      restrict: 'AEC',
      scope: {
        discussionid: '@',
        discussionreplies: '='
      },
      templateUrl: window.baseUrl + '/views/directives/discussion/replies.html',
      controller: function ($scope) {
        $scope.reply = new Models.Reply();
        $scope.reply.discussion_id = $scope.discussionid;
        $scope.user = $rootScope.user;
        $scope.reply.discussionReplyBody = "";


        $scope.createReply = function () {

          $scope.reply.$create(function (response) {
            response.author = $scope.user
            $scope.discussionreplies.push(response);
            $scope.reply = new Models.Reply();
            $scope.reply.discussion_id = $scope.discussionid;
            $scope.reply.discussionReplyBody = "";


          });

        };
        $scope.removeReply = function (position) {

          console.log(position);
          $scope.discussionreplies.splice(position, 1);


        };

      }
    };
  }]).directive('reply', ['Models', '$rootScope', function (Models, $rootScope) {
    return {
      restrict: 'AEC',
      scope: {
        item: '=',
        delete: '&onRemove',
        position: '@'
      },
      templateUrl: window.baseUrl + '/views/directives/discussion/reply.html',
      controller: function ($scope) {

        $scope.reply = new Models.Reply($scope.item);
        $scope.user = $rootScope.user;
        $scope.editMode = false;
        $scope.deleteReply = function () {


          $scope.reply.$delete({id:$scope.reply._id}).then(function (response) {

            $scope.delete({position:$scope.position})
          });
        }
        $scope.toggleEditMode = function(){
          $scope.editMode = !$scope.editMode
        }
        $scope.cancel = function(){
          $scope.reply.discussionReplyBody = $scope.item.discussionReplyBody
          $scope.toggleEditMode()
        }
        $scope.isOwn = function() {
           return $scope.user._id === $scope.reply.author._id || $rootScope.isAdmin()
        };
        $scope.update = function() {
           console.log("update");
           $scope.reply.$update(function(response){
             $scope.toggleEditMode()
           });
        };
      }
    };
  }]);


}());
