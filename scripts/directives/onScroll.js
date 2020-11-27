/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'A',
      scope: {
         onScrollModel: '=',
      },
      link: function ($scope, $el, attrs) {
         let lastScrolledHorizontally = false;
         let lastScrolledVertically = false;

         const determineScroll = function () {
            const scrolledHorizontally = $el[0].scrollLeft !== 0;
            const scrolledVertically = $el[0].scrollTop !== 0;

            if (lastScrolledVertically !== scrolledVertically ||
               lastScrolledHorizontally !== scrolledHorizontally) {
               $scope.onScrollModel.scrolledHorizontally = lastScrolledHorizontally = scrolledHorizontally;
               $scope.onScrollModel.scrolledVertically = lastScrolledVertically = scrolledVertically;

               return true;
            }

            return false;
         };

         determineScroll();

         $el.on('scroll', function () {
            if (determineScroll()) {
               $scope.$apply();
            }
         });
      },
   };
}
