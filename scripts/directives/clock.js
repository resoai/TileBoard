/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 * @param {angular.IFilterService} $filter
 */
export default function ($filter) {
   return {
      restrict: 'E',
      template: `
         <div class="clock--h"></div
         ><div class="clock--colon">:</div
         ><div class="clock--m"></div
         ><div class="clock--postfix"></div>
      `,
      link ($scope, $el, attrs) {
         const hourEl = $el[0].querySelector('.clock--h');
         const minuteEl = $el[0].querySelector('.clock--m');
         const postfixEl = $el[0].querySelector('.clock--postfix');

         const updateTime = function () {
            const localeTime = $filter('date')(Date.now(), 'shortTime');
            const [hour, remainder] = localeTime.split(':');
            const [minute, postfix] = remainder.split(' ');

            hourEl.textContent = hour;
            minuteEl.textContent = minute;
            postfixEl.textContent = postfix || '';
         };

         updateTime();

         const interval = setInterval(updateTime, 1000);

         $scope.$on('$destroy', function () {
            clearInterval(interval);
         });
      },
   };
}
