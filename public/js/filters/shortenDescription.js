angular.module('teachur').filter("shortenDescription", [function() {
  return function(description){
    if (!description) {
        return null;
    }
    
    var mathIndex = description.indexOf('</katex>');
    if (mathIndex !== -1 && mathIndex < 300) {
        return description.substr(0, description.indexOf('</katex>') + 8);
    }

    return description.substr(0, 250);
  };
}]);