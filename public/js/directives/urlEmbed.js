angular.module('teachur').directive('urlEmbed', ['embedService', function (embedService) {
  return {
    restrict: 'AEC',
    scope: {
      url: '='
    },
    link: function ($scope, $element, attr, ctrl) {
      
      $element.html("<div class=\"spinner\"></div>");
      embedService.get($scope.url).then(function (data) {

        console.log(data);
        var embedBox = "<div class=\"thumbnail\">";
        if (!data.html) {
          
          if (data.url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
            embedBox = embedBox + "<img src='" + data.url + "' class='img-responsive img-embed'>";
          } else {
            embedBox += "<img alt='" + data.title + "' src='" + data.thumbnail_url + "' height='" + data.thumbnail_height + "' width='" + data.thumbnail_width + "'/>";
            embedBox += "<div class=\"caption\">";
            embedBox += "<h3>"+data.title+"</h3>";
            if (typeof data.description === 'string' || myVar instanceof String) {
                embedBox += "<p>" + data.description+ "</p>";
            }
            embedBox += "<p><a href='" + data.url + "' class='text-success' target='_blank'>" + data.url + "</a></p>";
          }
          
          
        } else {
            if (data.provider_name == "Vimeo") {
                embedBox += "<div class=\"richWrapper\">";
            }
            
            embedBox += "<div class=\"caption\">";
            embedBox += "<h3>"+data.title+"</h3>";
            embedBox += "<p>" + data.html+ "</p>";
            if (data.provider_name != "YouTube") {
              embedBox += "<p><a href='" + data.url + "' class='text-success' target='_blank'>" + data.url + "</a></p>";
            }
            
            if (data.provider_name == "Vimeo") {
                embedBox += "<div class=\"richWrapper\">";
            }
        }
        embedBox += '</div>'
        $element.html(embedBox);
      });
    }
  };
}]);