angular.module('Breadcrumb', [])
  .service('breadcrumb', breadcrumb);

function breadcrumb($localStorage) {
  var self = this;

  self.breadcrumbStates = [];
  self.chainLength = 0;
  self.startState;

  self.clear = function () {
    console.warn('CLEARING BREADCRUMB DATA');
    self.breadcrumbStates = [];
    self.chainLength = 0;
    delete $localStorage.breadcrumbStates;
  };

  self.refreshBreadcrumbs = function () {
    self.breadcrumbStates.forEach(function (element) {
      element.state.ncyBreadcrumbLink = "#/" + element.type + "/" + element.dataObject._id;
      element.state.ncyBreadcrumbLabel = element.dataObject.name;
    });
  };

  self.getChainIndex = function (name) {
    var result = 0;
    self.viewsChain.forEach(function (view, index) {
      if (view === name) {
        result = index;
      }
    });
    return result;
  };

  self.findInDirectionalChainIndex = function (stateName) {
    var result = 0;
    self.directionalChain.forEach(function (state, index) {
      if (state === stateName) {
        result = index;
      }
    });
    return result;
  };

  self.getBreadcrumbByName = function (name) {
    var result = null;
    self.breadcrumbStates.forEach(function (element) {
      if (element.state.name === name) {
        result = element;
      }
    });
    return result;
  };

  self.checkStateToExistById = function (id) {
    var result = false,
      self = this;
    self.breadcrumbStates.forEach(function (element) {
      if (element.id === id) {
        result = true;
      }
    });
    return result;
  };

  self.stateChains = [
    [{stateName: 'degrees.view', modelName: 'Degree', type: 'degrees'}, {
      stateName: 'courses.view',
      modelName: 'Course',
      type: 'courses'
    }, {direction: 'down'}],
    [{stateName: 'courses.view', modelName: 'Course', type: 'courses'}, {
      stateName: 'lessons.view',
      modelName: 'Lesson',
      type: 'lessons'
    }, {direction: 'down'}],
    [{stateName: 'lessons.view', modelName: 'Lesson', type: 'lessons'}, {
      stateName: 'objectives.view',
      modelName: 'Objective',
      type: 'objectives'
    }, {direction: 'down'}],
    [{stateName: 'lessons.view', modelName: 'Lesson', type: 'lessons'}, {
      stateName: 'courses.view',
      modelName: 'Course',
      type: 'courses'
    }, {direction: 'up'}],
    [{stateName: 'objectives.view', modelName: 'Objective', type: 'objectives'}, {
      stateName: 'lessons.view',
      modelName: 'Lesson',
      type: 'lessons'
    }, {direction: 'up'}],
    [{stateName: 'objectives.view', modelName: 'Objective', type: 'objectives'}, {
      stateName: 'courses.view',
      modelName: 'Course',
      type: 'courses'
    }, {direction: 'up'}]
  ];

  self.directionalChain = ['degrees.view', 'courses.view', 'lessons.view', 'objectives.view'];

  self.viewsChain = ['courses', 'lessons', 'objectives'];

  return self;
}