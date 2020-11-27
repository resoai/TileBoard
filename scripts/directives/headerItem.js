/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'AE',
      replace: false,
      scope: '=',
      templateUrl: 'header-items.html',
      link: function ($scope, $el, attrs) {},
   };
}
