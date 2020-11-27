/**
 * @ngInject
 *
 * Custom directive to fix angularjs bug with dynamic max values being overriden to 100.
 * https://github.com/angular/angular.js/issues/6726
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'A',
      require: 'ngModel',
      link (scope, elem, attr) {
         elem.attr('min', attr.ngMin);
      },
   };
}
