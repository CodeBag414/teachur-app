angular.module('teachur')
.directive('bookPreview', function () {
  return {
    restrict: 'AEC',
    scope: {
      book: '=',
      deleteBook: '&',
      editMode: '='
    },
    templateUrl: window.baseUrl + '/views/directives/bookPreview.html',
    replace: true,
    link: function($scope, $element, attr, ctrl) {
    }
  };
});