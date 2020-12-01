import { leadZero } from '../globals/utils';

/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function ($interval) {
   return {
      restrict: 'AE',
      replace: true,
      link: function ($scope, $el, attrs) {
         const $m = document.createElement('div');
         const $h = document.createElement('div');
         const $colon = document.createElement('div');
         const $postfix = document.createElement('div');

         $m.classList.add('clock--m');
         $h.classList.add('clock--h');

         $postfix.classList.add('clock--postfix');

         $colon.classList.add('clock--colon');
         $colon.textContent = ':';

         const updateTime = function () {
            const d = new Date();
            let h = d.getHours();
            const m = d.getMinutes();
            let postfix = '';

            if (window.CONFIG.timeFormat === 12) {
               postfix = h >= 12 ? 'PM' : 'AM';

               h = h % 12 || 12;
            } else {
               h = leadZero(h);
            }

            $h.textContent = h;
            $m.textContent = leadZero(m);
            $postfix.textContent = postfix;
         };

         $el[0].appendChild($h);
         $el[0].appendChild($colon);
         $el[0].appendChild($m);
         $el[0].appendChild($postfix);

         updateTime();

         const interval = setInterval(updateTime, 1000);

         $scope.$on('$destroy', function () {
            clearInterval(interval);
         });
      },
   };
}
