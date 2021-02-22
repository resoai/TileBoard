/**
 * @ngInject
 *
 * @typedef {{
 *   format: string
 *   date: Date
 * }} Scope
 *
 * @type {angular.IDirectiveFactory<Scope & angular.IScope>}
 * @param {angular.IIntervalService} $interval
 * @param {angular.ILocaleService} $locale
 */
export default function ($interval, $locale) {
   return {
      restrict: 'E',
      replace: true,
      scope: {
         format: '<',
      },
      template: '<div class="date">{{ date | date:format}}</div>',
      link ($scope, $el, attrs) {
         $scope.format = $scope.format || $locale.DATETIME_FORMATS.longDate;
         $scope.date = new Date();

         $interval(function () {
            $scope.date = new Date();
         }, 60 * 1000);
      },
   };
}
