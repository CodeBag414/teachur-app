angular.module('teachur').controller('AppController', function ($scope, $state, $http, $rootScope) {

  $scope.brand = 'images/logo.png';
  $scope.searchGlobalText = '';


  $scope.isSpecificPage = function () {
    if ($state.is('login') || $state.is('signup') || $state.is('confirmEmail') || $state.is('forgotPassword') || $state.is('resetPassword') || $state.is('waitingListSignup')) {
      return true;
    }
  };

  $scope.showRightSidebar = function () {
    return $state.data.showRightSidebar;
  };

  $scope.logout = function () {
    localStorage["accessToken"] = undefined;
    localStorage["user"] = undefined;
    $rootScope.user = undefined;
    $state.go('login');
  };

  $scope.searchGlobal = function (event, searchGlobalText) {
    event.preventDefault();
    $http.post('/api/search', {searchText: searchGlobalText}).success(function (response) {
      $state.go('search', {searchResults: response}, {reload: true});
    });
  };

  $rootScope.$on('setSearchText', function(e, data) {
    $scope.searchGlobalText = data.searchText;
  });


  // $scope.startTour = function () {
    
  //   console.log($rootScope.tour);


  //   //if (typeof $rootScope.tour !== 'undefined') {
  //   //  tour.restart();
  //   //} else {
  //    var tour = new Tour({
  //     storage: localStorage,
  //     debug: false,
  //     autoscroll: true
  //     });

  //   tour.addSteps([
  //     {
  //       element: ".callout-1",
  //       title: "Complete your profile",
  //       content: "Get more followers, friends, and recognition by completing your profile. Start to build your profile by entering your name and email. If you would like to add a picture, interests, or other elements to your profile now, you can, or you can do this later."
  //     },
  //     {
  //       element: "#menu-item-dashboard",
  //       title: "The Dashboard",
  //       content: "With Teachur, you can build objectives, lessons, courses, and degrees in minutes. You’ll start from this view, which is the Dashboard view. From here, you can select what type of learning module you’d like to build: Objectives, Lessons, Courses, or Degrees. "
  //     },
  //     {
  //       element: "#menu-item-objectives",
  //       title: "Objectives",
  //       content: "We’ll start with Objectives. When you click on Objectives, you’ll see 3 menu items",
  //       onShow: function (tour) {
  //          $('#menu-item-objectives').click();
  //       }
  //     },
  //     {
  //       element: ".menu-item-objectives-my",
  //       title: "Objectives",
  //       content: "My objectives will display the objectives you have created.",
  //     },
  //     {
  //       element: ".menu-item-objectives-create",
  //       title: "Objectives",
  //       content: "Create Objective will open up a template to create a new objective.",
  //     },
  //     { element: ".menu-item-objectives-search",
  //       title: "Objectives",
  //       content: "and Find objective will let you search for objectives."
  //     },
  //     { element: "#menu-item-objectives",
  //       title: "Objectives",
  //       content: "Let’s go into each of these.",
  //       onNext: function(tour) {
  //         $('.menu-item-objectives-my a').click();
  //       }
  //     },
  //     { element: ".menu-item-objectives-my",
  //       title: "Objectives",
  //       content: "Selecting My Objectives, displays all the Objectives you have created.",
  //       onNext: function(tour) {
  //         $('.menu-item-objectives-create a').click();
  //       }
  //     },
  //     { element: ".menu-item-objectives-create",
  //       title: "Objectives",
  //       content: "Selecting Create Objective, opens an empty Objective template. Here is where you build the objective. In the top field write your Objective. Objectives should be one sentence. As you see fit, include links to videos, websites, book pages, etc. to help learners on their way to mastery.",
  //       path: "/app#/objectives/create",
  //     },
  //     { element: ".title-objective",
  //       title: "Objectives",
  //       content: "In the assessment field provide one or more sample questions or tasks that would assess a student’s mastery of the objective.",
  //       path: "/app#/objectives/create",
  //     },
  //     { element: ".title-objective",
  //       title: "Objectives",
  //       content: "You can add prerequisite",
  //       path: "/app#/objectives/create",
  //     },
  //     { element: ".title-objective",
  //       title: "Objectives",
  //       content: "or related objectives and tag the objective with Keywords.",
  //       path: "/app#/objectives/create",
  //     },
  //     { element: ".menu-item-objectives-search",
  //       title: "Objectives",
  //       content: "When you select Find objective, you can search for objectives by typing part of an objective name or keyword in the search field",
  //       onShow: function(tour) {
  //          $('#menu-item-objectives').click();
  //       },
  //       onnext: function(tour) {
  //         $('#menu-item-dashboard').click();
  //       }
  //     },
  //     { element: "#menu-item-objectives",
  //       title: "Objectives",
  //       content: "You can build a lesson from one or more Objective, courses from one or more lesson, and degrees, from one or more courses.",
  //       onshow: function(tour) {
  //         $('.menu-item-objectives-search a').click();
  //       }
  //     },
  //     { element: "#menu-item-objectives",
  //       title: "Objectives",
  //       content: "OK, It’s that easy. If you can build an Objective, you’ll have no problem building Lessons, Courses, or Degrees. And you can watch this Tutorial at any time from this link. You can also watch Tutorials specific to each of the menu items as well",
  //     },
  //   ]);
  //         // Initialize the tour
  //   tour.init();
  //   // Start the tour
  //   tour.start(true);
  //   //}
  // }

});