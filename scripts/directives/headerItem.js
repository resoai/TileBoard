import template from './headerItem.html';

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
      template,
      link: function ($scope, $el, attrs) {},
   };
}
