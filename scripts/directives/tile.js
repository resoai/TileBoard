/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'AE',
      replace: false,
      scope: true,
      templateUrl: 'tile.html',
   };
}
