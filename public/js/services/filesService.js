angular.module('teachur')
.service('FilesService', FilesService);

function FilesService($http, $q) {
  var _this = this;
  this.promises = [];

  function isVideo(filename) {
    if (!filename) {
      return false;
    }
    var ext = _this.getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'm4v':
    case 'avi':
    case 'mpg':
    case 'mp4':
        // etc
        return true;
    }
    return false;
  }

  function isAudio(filename) {
    if (!filename) {
      return false;
    }
    var ext = _this.getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'mp3':
        // etc
        return true;
    }
    return false;
  }

  this.uploadAssessmentsFiles = function(assessments, newAssessments) {
    var _this = this;
    _this.promises = [];

    assessments.forEach(function(assessment, i) {
      if (!assessment._id) {
        assessment._id = newAssessments[i]._id;
      }
      
      _this.populatePromises(assessment.files, assessment, 'assessment');
    });

    return $q.all(_this.promises);
  };

  this.uploadProjectsFiles = function(projects, newProjects) {
    var _this = this;
    _this.promises = [];

    projects.forEach(function(project, i) {
      if (!project._id) {
        project._id = newProjects[i]._id;
      }
      
      _this.populatePromises(project.files, project, 'project');
    });

    return $q.all(_this.promises);
  };

  this.uploadObjectiveFiles = function(objective) {
    var _this = this;
    _this.promises = [];
    _this.populatePromises(objective.recommendedMedia, objective, 'objective');
    return $q.all(_this.promises);
  };

  this.uploadStudentProject = function(file, projectId) {
    var _this = this;
    var fd = new FormData();
    fd.append('file', file);
    _this.promises = [$http.post('/api/uploads/student-project/' + projectId, fd, {transformRequest: angular.identity, headers: {'Content-Type': undefined} })]
    return $q.all(_this.promises);
  };

  this.populatePromises = function(files, item, itemName) {
    var _this = this;
    files.forEach(function(file) {
      if (file && !file.external && file.newFile) {
        var fd = new FormData();
        fd.append('file', file);
        _this.promises.push($http.post('/api/uploads/' + itemName + '/' + item._id + '/file/' + file._id, fd, {transformRequest: angular.identity, headers: {'Content-Type': undefined} }));
      }
    });
  };

  this.isVideo = function(filename) {
    return isVideo(filename);
  };

  this.isAudio = function(filename) {
    return isAudio(filename);
  };

  this.getExtension = function(filename){
    var parts = filename.split('.');
    return parts[parts.length - 1];
  }

  return this;
};