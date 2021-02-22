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
         <div class="clock--h">{{ hour }}</div
         ><div class="clock--colon">:</div
         ><div class="clock--m">{{ minute }}</div
         ><div class="clock--postfix">{{ postfix }}</div>
      `,
      link ($scope, $el, attrs) {
         const children = $el.children();
         const hourEl = children[0];
         const minuteEl = children[2];
         const postfixEl = children[3];

         const updateTime = function () {
            const localeTime = $filter('date')(Date.now(), 'shortTime');
            const [hour, remainder] = localeTime.split(':');
            const [minute, postfix] = remainder.split(' ');

            hourEl.textContent = hour;
            minuteEl.textContent = minute;
            postfixEl.textContent = postfix;
         };

         updateTime();

         const interval = setInterval(updateTime, 1000);

         $scope.$on('$destroy', function () {
            clearInterval(interval);
         });
      },
   };
}
