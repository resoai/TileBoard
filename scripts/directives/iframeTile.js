/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function ($interval) {
   return {
      restrict: 'A',
      replace: false,
      scope: {
         item: '=iframeTile',
      },
      link: function ($scope, $el, attrs) {
         const iframe = $el[0];

         const updateIframe = function () {
            // eslint-disable-next-line no-self-assign
            iframe.src = iframe.src;
         };

         if ($scope.item.refresh) {
            let time = $scope.item.refresh;

            if (typeof time === 'function') {
               time = time();
            }

            time = Math.max(1000, time);

            const interval = setInterval(updateIframe, time);

            $scope.$on('$destroy', function () {
               clearInterval(interval);
            });
         }
      },
   };
}
