'use strict';

var angularReveal = angular.module('angularReveal', []);
angularReveal.directive('liveExample', function ($compile, $timeout) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'liveExample.html',
      transclude: true,
      compile: function (tElem, tAttr, transclude) {
        return function postLink(scope, elem) {
          scope.snippets = [];
          var codeMirror, playground;

          transclude(scope, function (clone) {
            $(clone).filter('script[data-title]').each(function(){
              scope.snippets.push({
                title: $(this).attr('data-title'),
                code: stripPrefix(this.textContent)
              });
            });
            scope.snippet = scope.snippets[0].code;

            function stripPrefix(code) {
              var codeLinePrefixLength = code.split('\n')[1].match(/^\s+/)[0].length;
              code = $.map(code.split('\n'), function (line) {
                return line.slice(codeLinePrefixLength);
              }).join('\n').replace(/^\s*\n|\n\s*$/g, '').replace(/code>/g, 'script>');
              return code;
            }
          });

          scope.loadSnippet = function(code) {
            codeMirror.setValue(code);
            $timeout(function () { codeMirror.refresh(); });
          };

          playground = elem.find('.playground');
          codeMirror = CodeMirror.fromTextArea(elem.find('textarea')[0], {
            theme: 'eclipse',
            mode: 'htmlmixed',
            tabSize: 2,
            lineNumbers: true,
            autoFocus: false
          });

          $(window).on('hashchange', function () {
            var currentSlide = Reveal.getCurrentSlide();
            if ($('.CodeMirror', currentSlide)[0] == codeMirror.getWrapperElement()){
              $timeout(function () {scope.loadSnippet(scope.snippet);}, 200);
            }
          });
          //Reveal.addEventListener( 'slidechanged', function( event ) {
            //if ($('.CodeMirror', event.currentSlide)[0] == codeMirror.getWrapperElement()){
              //$timeout(function () {scope.loadSnippet(scope.snippet);}, 200);
            //}
          //});

          scope.loadSnippet(scope.snippet);

          scope.run = function () {
            var newPlayground = $('<div class="playground"><'+'/div>').html(codeMirror.getValue());
            newPlayground.insertAfter(playground);
            playground.remove();
            playground = newPlayground;
            angular.module('demo', []);
            angular.bootstrap(playground, ['demo']);
          };
        };
      }
    };
  });
