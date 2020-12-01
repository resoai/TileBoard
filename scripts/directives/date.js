/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function ($interval) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         format: '=',
      },
      template: '<div class="date" ng-bind="date|date:format"></div>',
      link: function ($scope, $el, attrs) {
         $scope.format = $scope.format || 'EEEE, LLLL dd';
         $scope.date = new Date();

         $interval(function () {
            $scope.date = new Date();
         }, 60 * 1000);
      },
   };
}
