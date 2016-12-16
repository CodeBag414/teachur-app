angular.module('teachur')
  .service('Models', ['$resource', function ($resource) {
    this.User = $resource('/api/users/:id', {id: '@_id'}, {
      query: {method: 'GET'},
      search: {method: 'GET', url: '/api/users'},
      save: {method: 'PUT'},
      create: {method: 'POST'},
      delete: {method: 'DELETE'},
      addToMyModules: {method: 'POST', url: '/api/current-user/add-to-my-modules'},
      getCurrentUser: {method: 'GET', url: '/api/current-user'},
      getObjectives: {method: 'GET', url: '/api/users/:id/objectives', isArray: true},
      getLessons: {method: 'GET', url: '/api/users/:id/lessons', isArray: true},
      getCourses: {method: 'GET', url: '/api/users/:id/courses', isArray: true},
      getDegrees: {method: 'GET', url: '/api/users/:id/degrees', isArray: true},
      getFavorites: {method: 'GET', url: '/api/users/:id/favorited/:modelName', isArray: true}
    });

    this.Objective = $resource('/api/objectives/:id', {id: '@_id'}, {
      query: {method: 'GET'},
      save: {method: 'PUT'},
      create: {method: 'POST'},
      delete: {method: 'DELETE'},
      queryByAuthor: {method: 'GET', url: '/api/objective/author', isArray: true},
      getCurrentUse: {method: 'GET', url: '/api/objectives/:id/current-use'},
      search: {method: 'GET', url: '/api/objectives/search', isArray: false},
      getStatistics: {method: 'GET', url: '/api/objective/statistics', isArray: false}
    });

    this.Lesson = $resource('/api/lessons/:id', {id: '@_id'}, {
      query: {method: 'GET'},
      save: {method: 'PUT'},
      create: {method: 'POST'},
      delete: {method: 'DELETE'},
      queryByAuthor: {method: 'GET', url: '/api/lesson/author', isArray: true},
      getCurrentUse: {method: 'GET', url: '/api/lessons/:id/current-use'},
      search: {method: 'GET', url: '/api/lessons/search', isArray: false},
      getStatistics: {method: 'GET', url: '/api/lesson/statistics', isArray: false}
    });

    this.Course = $resource('/api/courses/:id', {id: '@_id'}, {
      query: {method: 'GET'},
      save: {method: 'PUT'},
      create: {method: 'POST'},
      delete: {method: 'DELETE'},
      queryByAuthor: {method: 'GET', url: '/api/course/author', isArray: true},
      getCurrentUse: {method: 'GET', url: '/api/courses/:id/current-use'},
      search: {method: 'GET', url: '/api/courses/search', isArray: false},
      getStatistics: {method: 'GET', url: '/api/course/statistics', isArray: false}
    });

    this.Degree = $resource('/api/degrees/:id', {id: '@_id'}, {
      query: {method: 'GET', isArray: false},
      save: {method: 'PUT'},
      create: {method: 'POST'},
      delete: {method: 'DELETE'},
      queryByAuthor: {method: 'GET', url: '/api/degree/author', isArray: true},
      getCurrentUse: {method: 'GET', url: '/api/degrees/:id/current-use'},
      search: {method: 'GET', url: '/api/degrees/search', isArray: false},
      getStatistics: {method: 'GET', url: '/api/degree/statistics', isArray: false}
    });

    this.WannabeUser = $resource('/api/waiting-list/:id', {id: '@_id'}, {
      query: {method: 'GET', isArray: true},
      grantAccess: {method: 'PUT', url: '/api/waiting-list/:id/grant-access'},
      addEmail: {method: 'POST', url: '/api/waiting-list/add-email'}
    });

    this.Discussion = $resource('/api/discussions/:id', {id: '@_id'}, {
      query: {method: 'GET', isArray: true},
      create: {method: 'POST'},
      update: {method: 'PUT'},
      delete: {method: 'DELETE'},
      queryFor: {method: 'GET', url: '/api/discussions/:model/:id', isArray: true}
    });
    this.Reply = $resource('/api/reply/:discussion_id', {discussion_id: '@discussion_id'}, {
      create: {method: 'POST'},
      delete: {method: 'DELETE',url: '/api/reply/:id'},
      update: {method: 'PUT'},
      queryReplies: {method: 'GET', url: '/api/discussions/:id/replies', isArray: true}

    });

  }]);
