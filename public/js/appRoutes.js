angular.module('teachur').config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/degrees/search");

  // Now set up the states
  $stateProvider
    .state('dashboard', {
      url: "/dashboard?token",
      controller: "HomeController",
      data: {
        requireLogin: true
      },
      resolve: {
        objectives: function (Models) {
          return Models.Objective.queryByAuthor().$promise;
        },
        lessons: function (Models) {
          return Models.Lesson.queryByAuthor().$promise;
        },
        courses: function (Models) {
          return Models.Course.queryByAuthor().$promise;
        },
        degrees: function (Models) {
          return Models.Degree.queryByAuthor().$promise;
        }
      },
      ncyBreadcrumb: {
        label: 'Dashboard'
      },
      views: {
        "": {
          templateUrl: window.baseUrl + "/views/home/home.html",
          controller: "HomeController"
        }
      }
    })
    .state('howItWorks', {
      url: "/howItWorks",
      templateUrl: window.baseUrl + "/views/howItWorks/howItWorks.html",
      controller: "HowItWorksController",
      data: {
        requireLogin: true
      },
      views: {
        "": {
          templateUrl: window.baseUrl + "/views/home/howItWorks.html",
          controller: "HowItWorksController"
        }
      }
    })
    .state('seed-data', {
      url: "/seed-data",
      templateUrl: window.baseUrl + "/views/authentication/seed-data.html",
      controller: "SeedDataController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Seed-data'
      }
    })

    .state('login', {
      url: "/login",
      templateUrl: window.baseUrl + "/views/authentication/login.html",
      controller: "LoginController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Login'
      }
    })

    .state('signup', {
      url: "/signup/:signupToken",
      templateUrl: window.baseUrl + "/views/authentication/signup.html",
      controller: "SignupController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Sign up'
      }
    })

    .state('forgotPassword', {
      url: "/forgotPassword",
      templateUrl: window.baseUrl + "/views/authentication/forgotPassword.html",
      controller: "ForgotPasswordController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Forgot password'
      }
    })

    .state('resetPassword', {
      url: "/resetPassword/:resetPasswordToken",
      templateUrl: window.baseUrl + "/views/authentication/resetPassword.html",
      controller: "ResetPasswordController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Reset password'
      }
    })

    .state('confirmEmail', {
      url: '/confirmEmail/:confirmationToken',
      templateUrl: window.baseUrl + "/views/authentication/confirmEmail.html",
      controller: "ConfirmEmailController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Confirm email'
      }
    })

    .state('currentUserProfile', {
      url: '/currentUserProfile',
      templateUrl: window.baseUrl + "/views/users/editProfile.html",
      controller: "UsersController",
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Profile'
      },
      views: {
        "": {
          templateUrl: window.baseUrl + "/views/users/editProfile.html",
          controller: "UsersController"
        },
        "breadcrumbs@dashboard": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      }
    })

    .state('waitingListSignup', {
      url: '/waitingListSignup',
      templateUrl: window.baseUrl + "/views/authentication/waitingListSignup.html",
      controller: "WaitingListSignupController",
      data: {
        requireLogin: false
      }
    })

    .state('invite', {
      url: '/invite',
      templateUrl: window.baseUrl + "/views/users/inviteUsers.html",
      controller: "UserInviteController",
      data: {
        requireLogin: true
      }
    })

    .state('payments', {
      url: "/payments",
      abstract: true,
      template: '<div ui-view="view"></div>',
      ncyBreadcrumb: {
        label: 'Payments'
      }
    })

    .state('payments.upgradeAccount', {
      url: '/upgradeAccount',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/payments/upgradeAccount.html",
          controller: "PaymentsController"
        }
      },
      data: {
        requireLogin: true
      },
      ncyBreadcrumb: {
        label: 'Upgrade'
      }
    })

    .state('userProfile', {
      url: '/user/:id',
      templateUrl: window.baseUrl + "/views/users/profile.html",
      controller: "UserProfileController",
      resolve: {
        user: function (Models, $stateParams) {
          return Models.User.get($stateParams).$promise;
        },
        objectives: function (Models, $stateParams) {
          return Models.User.getObjectives($stateParams).$promise;
        },
        lessons: function (Models, $stateParams) {
          return Models.User.getLessons($stateParams).$promise;
        },
        courses: function (Models, $stateParams) {
          return Models.User.getCourses($stateParams).$promise;
        },
        degrees: function (Models, $stateParams) {
          return Models.User.getDegrees($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Profile'
      }
    })

    .state('search', {
      url: '/search?searchText',
      templateUrl: window.baseUrl + "/views/search/results.html",
      controller: "SearchController",
      params: {
        searchResults: null
      },
      data: {
        requireLogin: false
      },
      ncyBreadcrumb: {
        label: 'Global search'
      }
    })

    .state('objectives', {
      url: "/objectives",
      abstract: true,
      template: '<div ui-view="view"></div>',
      ncyBreadcrumb: {
        label: 'Objectives'
      }
    })
    .state('objectives.index', {
      url: "/index",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/objectives/index.html",
          controller: "ObjectivesIndexController"
        },
        "breadcrumbs@objectives.index": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        objectives: function (Models) {
          return Models.Objective.queryByAuthor().$promise;
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        skip: true
      }
    })
    .state('objectives.search', {
      url: "/search",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/objectives/search.html",
          controller: "ObjectivesSearchController"
        },
        "breadcrumbs@objectives.search": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Search'
      }
    })
    .state('objectives.create', {
      url: "/create",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/objectives/create.html",
          controller: "ObjectivesCreateController"
        },
        "breadcrumbs@objectives.create": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        relatedObjectives: function (Models) {
          return Models.Objective.query().$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Create'
      }
    })

    .state('objectives.edit', {
      url: "/:id/edit",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/objectives/create.html",
          controller: "ObjectivesEditController"
        },
        "breadcrumbs@objectives.edit": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        objective: function (Models, $stateParams) {
          return Models.Objective.get($stateParams).$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{objective.name}} / Edit'
      }
    })

    .state('objectives.view', {
      url: "/:id",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/objectives/view.html",
          controller: "ObjectivesViewController"
        },
        "breadcrumbs@objectives.view": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        objective: function (Models, $stateParams) {
          return Models.Objective.get($stateParams).$promise;
        },
        currentUse: function (Models, $stateParams) {
          return Models.Objective.getCurrentUse($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{objective.name}}',
        parent: function ($scope) {
          //console.log('CHAIN LENGTH: ', $scope.breadcrumbsObject.chainLength, 'OBJECTIVES ELEMENT INDEX: ', $scope.breadcrumbsObject.getChainIndex('objectives'));
          return  $scope.breadcrumbsObject.startState === 'lessons.view' || $scope.breadcrumbsObject.startState === 'courses.view' || $scope.breadcrumbsObject.startState === 'degrees.view' ? 'lessons.view' : 'objectives.index';
        }
      }
    })

    .state('lessons', {
      url: "/lessons",
      abstract: true,
      template: '<div ui-view="view"></div>',
      ncyBreadcrumb: {
        label: 'Lessons'
      }
    })
    .state('lessons.index', {
      url: "/index",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/lessons/index.html",
          controller: "LessonsIndexController"
        },
        "breadcrumbs@lessons.index": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        lessons: function (Models) {
          return Models.Lesson.queryByAuthor().$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        skip: true
      }
    })
    .state('lessons.search', {
      url: "/search",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/lessons/search.html",
          controller: "LessonsSearchController"
        },
        "breadcrumbs@lessons.search": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Search'
      }
    })
    .state('lessons.create', {
      url: "/create",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/lessons/create.html",
          controller: "LessonsCreateController"
        },
        "breadcrumbs@lessons.create": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Create'
      }
    })

    .state('lessons.edit', {
      url: "/:id/edit",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/lessons/create.html",
          controller: "LessonsEditController"
        },
        "breadcrumbs@lessons.edit": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        lesson: function (Models, $stateParams) {
          return Models.Lesson.get($stateParams).$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{lesson.name}} / Edit'
      }
    })

    .state('lessons.view', {
      url: "/:id",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/lessons/view.html",
          controller: "LessonsViewController"
        },
        "breadcrumbs@lessons.view": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        lesson: function (Models, $stateParams) {
          return Models.Lesson.get($stateParams).$promise;
        },
        currentUse: function (Models, $stateParams) {
          return Models.Lesson.getCurrentUse($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{lesson.name}}',
        parent: function ($scope) {
          //console.log('CHAIN LENGTH: ', $scope.breadcrumbsObject.chainLength, 'LESSONS ELEMENT INDEX: ', $scope.breadcrumbsObject.getChainIndex('lessons'));
          return $scope.breadcrumbsObject.startState === 'courses.view' || $scope.breadcrumbsObject.startState === 'degrees.view' ? 'courses.view' : 'lessons.index';
        }
      }
    })

    /* COURSES ROUTES */

    .state('courses', {
      url: "/courses",
      abstract: true,
      template: '<div ui-view="view"></div>',
      ncyBreadcrumb: {
        label: 'Courses'
      }
    })
    .state('courses.index', {
      url: "/index",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/courses/index.html",
          controller: "CoursesIndexController"
        },
        "breadcrumbs@courses.index": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        courses: function (Models) {
          return Models.Course.queryByAuthor().$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        skip: true
      }
    })
    .state('courses.search', {
      url: "/search",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/courses/search.html",
          controller: "CoursesSearchController"
        },
        "breadcrumbs@courses.search": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Search'
      }
    })
    .state('courses.create', {
      url: "/create",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/courses/create.html",
          controller: "CoursesCreateController"
        },
        "breadcrumbs@courses.create": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Create'
      }
    })

    .state('courses.edit', {
      url: "/:id/edit",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/courses/create.html",
          controller: "CoursesEditController"
        },
        "breadcrumbs@courses.edit": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        course: function (Models, $stateParams) {
          return Models.Course.get($stateParams).$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{course.name}} / Edit'
      }
    })

    .state('courses.view', {
      url: "/:id",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/courses/view.html",
          controller: "CoursesViewController"
        },
        "breadcrumbs@courses.view": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        course: function (Models, $stateParams) {
          return Models.Course.get($stateParams).$promise;
        },
        currentUse: function (Models, $stateParams) {
          return Models.Course.getCurrentUse($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{course.name}}',
        parent: function ($scope, $rootScope) {
          return $scope.breadcrumbsObject.startState === 'degrees.view' ? 'degrees.view' : 'courses.index';
        }
      }
    })

    /* DEGREES ROUTES */

    .state('degrees', {
      url: "/degrees",
      abstract: true,
      template: '<div ui-view="view"></div>',
      ncyBreadcrumb: {
        label: 'Degrees'
      }
    })
    .state('degrees.index', {
      url: "/index",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/degrees/index.html",
          controller: "DegreesIndexController"
        },
        "breadcrumbs@degrees.index": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        degrees: function (Models) {
          return Models.Degree.queryByAuthor().$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        skip: true
      }
    })
    .state('degrees.search', {
      url: "/search",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/degrees/search.html",
          controller: "DegreesSearchController"
        },
        "breadcrumbs@degrees.search": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Search'
      }
    })
    .state('degrees.create', {
      url: "/create",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/degrees/create.html",
          controller: "DegreesCreateController"
        },
        "breadcrumbs@degrees.create": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: 'Create'
      }
    })

    .state('degrees.edit', {
      url: "/:id/edit",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/degrees/create.html",
          controller: "DegreesEditController"
        },
        "breadcrumbs@degrees.edit": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        degree: function (Models, $stateParams) {
          return Models.Degree.get($stateParams).$promise;
        }
      },
      data: {
        requireLogin: true,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{degree.name}} / Edit'
      }
    })

    .state('degrees.view', {
      url: "/:id",
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/degrees/view.html",
          controller: "DegreesViewController"
        },
        "breadcrumbs@degrees.view": {
          templateUrl: window.baseUrl + "/views/breadcrumbs.html"
        }
      },
      resolve: {
        degree: function (Models, $stateParams) {
          return Models.Degree.get($stateParams).$promise;
        },
        currentUse: function (Models, $stateParams) {
          return Models.Degree.getCurrentUse($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false,
        showRightSidebar: true
      },
      ncyBreadcrumb: {
        label: '{{degree.name}}'
      }
    })

    .state('administration', {
      url: "/administration",
      abstract: true,
      template: '<div ui-view="view"></div>'
    })

    .state('administration.users', {
      url: '/users',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/users/index.html",
          controller: "UsersIndexController"
        }
      },
      resolve: {
        users: function (Models) {
          return Models.User.query().$promise;
        }
      },
      data: {
        requireLogin: true
      }
    })

    .state('administration.editUser', {
      url: '/user/:id',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/users/editProfile.html",
          controller: "UsersEditController"
        }
      },
      resolve: {
        user: function (Models, $stateParams) {
          return Models.User.get($stateParams).$promise;
        }
      },
      data: {
        requireLogin: false
      }
    })

    .state('administration.waitingList', {
      url: '/waitingList',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/waitingList/index.html",
          controller: "WaitingListIndexController"
        }
      },
      resolve: {
        users: function (Models) {
          return Models.WannabeUser.query().$promise;
        }
      },
      data: {
        requireLogin: true
      }
    })

    .state('administration.content', {
      url: '/content',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/administration/content/index.html",
          controller: "ContentController"
        }
      },
      data: {
        requireLogin: true
      }
    })

    .state('administration.settings', {
      url: '/settings',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/administration/settings/emailSettings.html",
          controller: "EmailSettingsController"
        }
      },
      data: {
        requireLogin: true
      }
    })

    .state('administration.organizations', {
      url: '/organizations',
      views: {
        view: {
          templateUrl: window.baseUrl + "/views/administration/organizations/organizations.html",
          controller: "OrganizationsController"
        }
      },
      data: {
        requireLogin: true
      }
    })
}]);