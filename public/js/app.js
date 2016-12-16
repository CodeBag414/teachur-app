angular.module('teachur', ['ui.bootstrap', 'ui.router', 'ngResource', 'oitozero.ngSweetAlert', 'angular-jwt', 'ngDraggable', 'angular-embed', 'ngFileUpload', 'ngAnimate', 'ui.sortable', 'angular-loading-bar', 'Pagination', 'Breadcrumb', 'angularPayments', 'ncy-angular-breadcrumb', 'ngStorage', 'ngImgCrop',
    'ngMessages', 'teachur.i18n', 'ngTagsInput', 'angulartics', 'angulartics.google.analytics', 'ngSanitize', 'textAngular', 'katex', 'com.2fdevs.videogular', 'com.2fdevs.videogular.plugins.controls', 'ngAudio'])
  .config(function Config($httpProvider, jwtInterceptorProvider, embedlyServiceProvider, $breadcrumbProvider) {
    // Please note we're annotating the function so that the $injector works when the file is minified
    jwtInterceptorProvider.tokenGetter = function () {
      return localStorage.getItem('accessToken');
    };

    embedlyServiceProvider.setKey('a49200781e12407d87df4bcf3a593fe8');

    $httpProvider.interceptors.push('jwtInterceptor');

    $breadcrumbProvider.setOptions({
      includeAbstract: true,
      template: '<ol class="breadcrumb-alt"><li ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="!!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel|limitTo:20}}</a><a ng-switch-when="true" href="{{step.ncyBreadcrumbLink}}/index">{{step.ncyBreadcrumbLabel}}</a></li></ol>'
    });
  })

  .factory('organizationInjector', [function() {  
    var organizationInjector = {
      request: function(config) {
        config.headers['organization'] = window.organization || 'main';
        return config;
      }
    };
    return organizationInjector;
  }])

  .config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('organizationInjector');
  }])

  .service('authInterceptor', function($q, $injector) {
    var service = this;

    service.responseError = function(response) {
      if (response.status == 401){
        localStorage.clear();
        var modalInstance = $injector.get('$uibModal').open({
            templateUrl: window.baseUrl + "/views/modals/guestModal.html",
            controller: function($scope, $uibModalInstance) {
              $scope.dismiss = function() {
                $uibModalInstance.dismiss(false);
              }
            }
        });
      }
      return $q.reject(response);
    };
  })

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }])

  .run(function ($rootScope, $state, $http, Models, $localStorage, breadcrumb, $window, Interests, CurrentUser, $uibModal) {
    $rootScope.baseUrl = window.baseUrl;
    $rootScope.organization = window.organization !== '' ? window.organization : false;

    $rootScope.currentUser = CurrentUser;

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      if (toParams.token) {
        localStorage["accessToken"] = toParams.token;
        event.preventDefault();
        $http.get('/api/current-user').success(function (user) {
          localStorage.user = JSON.stringify(user);
          $rootScope.user = user;
          $state.go('dashboard');
        });
      }

      var requireLogin = toState.data.requireLogin;
      if (requireLogin && (!localStorage.accessToken || localStorage.accessToken === "undefined")) {
        event.preventDefault();
        if (toState.name !== 'login') {
          var modalInstance = $uibModal.open({
              templateUrl: window.baseUrl + "/views/modals/guestModal.html",
              controller: function($scope, $uibModalInstance) {
                $scope.dismiss = function() {
                  $uibModalInstance.dismiss(false);
                }
              }
          });
        }
      }

      if (localStorage.accessToken && localStorage.accessToken !== "undefined" && toState.name === 'login') {
        event.preventDefault();
        $http.get('/api/current-user').success(function (user) {
          localStorage.user = JSON.stringify(user);
          $rootScope.user = user;
          $state.go('dashboard');
        })
        .error(function() {
          localStorage.clear();
          $state.go('login');
        });
      }

    });

    $rootScope.breadcrumbsObject = breadcrumb;

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

      renderMathInElement(document.body);

      $rootScope.breadcrumbsObject.stateChains.forEach(function (chainArray) {
        if ($rootScope.breadcrumbsObject.chainLength === 0) {
          $rootScope.breadcrumbsObject.startState = fromState.name;
        }

        if ($rootScope.breadcrumbsObject.checkStateToExistById(toParams.id)) {
          var index = _.findIndex($rootScope.breadcrumbsObject.breadcrumbStates, {id: toParams.id});

          if (index !== -1) {
            $rootScope.breadcrumbsObject.breadcrumbStates.splice(index + 1, $rootScope.breadcrumbsObject.breadcrumbStates.length - (index + 1));
          }
        }

        if (fromState.name === chainArray[0].stateName && toState.name === chainArray[1].stateName) {
          if (chainArray[2].direction === 'down') {
            var stateToRefresh = chainArray[0];

            if ($rootScope.breadcrumbsObject.chainLength === 0) {
              if ($rootScope.breadcrumbsObject.directionalChain.indexOf(fromState.name) !== -1) {
                $rootScope.breadcrumbsObject.chainLength++;
              }
            } else {
              $rootScope.breadcrumbsObject.chainLength++;
            }

            Models[stateToRefresh.modelName].get(fromParams).$promise.then(function (response) {

              if (!$rootScope.breadcrumbsObject.checkStateToExistById(fromParams.id)) {
                $rootScope.breadcrumbsObject.breadcrumbStates.push({
                  state: fromState,
                  dataObject: response,
                  type: stateToRefresh.type,
                  id: fromParams.id,
                  model: stateToRefresh.modelName
                });
              }
              $rootScope.breadcrumbsObject.refreshBreadcrumbs();
            });
          }
          if (chainArray[2].direction === 'up') {
            var indexInChain = $rootScope.breadcrumbsObject.findInDirectionalChainIndex(chainArray[1].stateName);

            $rootScope.breadcrumbsObject.chainLength--;

            $rootScope.breadcrumbsObject.directionalChain.forEach(function (element, index) {
              if (index < indexInChain) {
                var breadcrumb = $rootScope.breadcrumbsObject.getBreadcrumbByName(element);
                if (breadcrumb) {
                  Models[breadcrumb.model].get({id: breadcrumb.id}).$promise.then(function () {
                    $rootScope.breadcrumbsObject.refreshBreadcrumbs();
                  });
                }
              }
            });
          }
        }
      });

    });

    var request = new XMLHttpRequest();
    request.open('GET', '/api/current-user', false);
    request.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
    request.setRequestHeader('organization', window.organization);
    request.send(null);

    if (request.status === 200) {
      var user = JSON.parse(request.responseText);

      localStorage.user = JSON.stringify(user);
      $rootScope.studentView = !user.isTeacher;
      $rootScope.user = user;
    } else {
       localStorage.clear();
       $state.go('degrees.search');
    }

    $rootScope.canUserEdit = function (item) {
      return $rootScope.user && ((item.author && item.author._id === $rootScope.user._id) || $rootScope.user.admin);
    };

    $rootScope.isAdmin = function () {
      return $rootScope.user && $rootScope.user.admin;
    };

    $rootScope.isGuest = function () {
      return !$rootScope.user;
    };

    $rootScope.enroll = function (itemName, itemId) {
      return CurrentUser.enroll(itemName, itemId);
    };

  })
  
  .directive('collapseNav', [
    function () {
      return {
        restrict: 'A',
        link: function (scope, ele, attrs) {
          var $a, $aRest, $lists, $listsRest, app;
          $lists = ele.find('ul').parent('li');
          $lists.append('<i class="fa fa-caret-right icon-has-ul"></i>');
          $a = $lists.children('a');
          $listsRest = ele.children('li').not($lists);
          $aRest = $listsRest.children('a');
          app = $('#teachur');
          $a.on('click', function (event) {
            var $parent, $this;
            if (app.hasClass('nav-min')) {
              return false;
            }
            $this = $(this);
            $parent = $this.parent('li');
            $lists.not($parent).removeClass('open').find('ul').slideUp();
            $parent.toggleClass('open').find('ul').slideToggle();
            return event.preventDefault();
          });
          $aRest.on('click', function (event) {
            return $lists.removeClass('open').find('ul').slideUp();
          });
          return scope.$on('minNav:enabled', function (event) {
            return $lists.removeClass('open').find('ul').slideUp();
          });
        }
      };
    }
  ]).directive('highlightActive', [
  function () {
    return {
      restrict: "A",
      controller: [
        '$scope', '$element', '$attrs', '$location', function ($scope, $element, $attrs, $location) {
          var highlightActive, links, path;
          links = $element.find('a');
          path = function () {
            return $location.path();
          };
          highlightActive = function (links, path) {
            path = '#' + path;
            return angular.forEach(links, function (link) {
              var $li, $link, href;
              $link = angular.element(link);
              $li = $link.parent('li');
              href = $link.attr('href');
              if ($li.hasClass('active')) {
                $li.removeClass('active');
              }
              if (path.indexOf(href) === 0) {
                return $li.addClass('active');
              }
            });
          };
          highlightActive(links, $location.path());
          return $scope.$watch(path, function (newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            return highlightActive(links, $location.path());
          });
        }
      ]
    };
  }
]).directive('toggleOffCanvas', [
  function () {
    return {
      restrict: 'A',
      link: function (scope, ele, attrs) {
        return ele.on('click', function () {
          return $('#teachur').toggleClass('on-canvas');
        });
      }
    };
  }
]).directive('slimScroll', [
  function () {
    return {
      restrict: 'A',
      link: function (scope, ele, attrs) {
        return ele.slimScroll({
          height: '100%'
        });
      }
    };
  }
]).directive('goBack', [
  function () {
    return {
      restrict: "A",
      controller: [
        '$scope', '$element', '$window', function ($scope, $element, $window) {
          return $element.on('click', function () {
            return $window.history.back();
          });
        }
      ]
    };
  }
]);
