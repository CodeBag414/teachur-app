angular.module('teachur').controller('UserProfileController', function($scope, user, objectives, lessons, courses, degrees) {
    $scope.user = user;
    $scope.objectives = objectives;
    $scope.lessons = lessons;
    $scope.courses = courses;
    $scope.degrees = degrees;
});
