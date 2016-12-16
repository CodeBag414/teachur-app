angular.module('teachur')
.config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', 'taSelection', function(taRegisterTool, taOptions, taSelection) {
    taRegisterTool('Math', {
        buttontext: 'Math',
        action: function(deffered, restoreSelection) {
          var txt= window.getSelection();
          var sel = angular.element(taSelection.getSelectionElement());

          if(sel[0].tagName === 'KATEX'){
            sel.replaceWith(sel.html());
          }
          else{
            this.$editor().wrapSelection('insertHTML', '<katex>'+txt+'</katex>',true);
          }

          restoreSelection();
        },
        activeState: function(elem) {
          if (elem && elem[0].tagName === 'KATEX') {
            return true;
          }
        }
    });

    taOptions.toolbar[0].push('Math');
    return taOptions;
  }]);

});