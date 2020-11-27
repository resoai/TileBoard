import { toAbsoluteServerURL } from '../globals/utils';

/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         frozen: '=frozen',
      },
      link: function ($scope, $el, attrs) {
         let $i = 0;
         let imageUrl = null;
         let refresh = $scope.item.refresh || false;
         let current = null;
         let prev = null;

         if (typeof refresh === 'function') {
            refresh = refresh();
         }

         const appendImage = function (url) {
            const el = document.createElement('div');

            if (url) {
               el.style.backgroundImage = 'url("' + toAbsoluteServerURL(url) + '")';
            }

            el.style.backgroundSize = $scope.item.bgSize || 'cover';

            $el[0].appendChild(el);

            if (prev) {
               $el[0].removeChild(prev);
            }

            setTimeout(function () {
               el.style.opacity = 1;
            }, 100);

            prev = current;
            current = el;
         };

         const getImageUrl = function () {
            if ($scope.item.filter) {
               return $scope.item.filter($scope.item, $scope.entity);
            }

            if ($scope.entity && $scope.entity.attributes.entity_picture) {
               return $scope.entity.attributes.entity_picture;
            }

            return null;
         };

         const reloadImage = function () {
            if (!imageUrl) {
               return;
            }

            if ($i > 1 && $scope.frozen) {
               return;
            }

            let url = imageUrl;

            url += (url.indexOf('?') === -1 ? '?' : '&') + ('_i=' + $i++);

            appendImage(url);
         };

         const setImage = function (url) {
            imageUrl = url;

            if (!imageUrl) {
               return;
            }

            reloadImage();
         };

         const updateImage = function () {
            const newUrl = getImageUrl();

            if (imageUrl !== newUrl) {
               setImage(newUrl);
            }
         };
         $scope.$watchGroup([
            'item',
            'entity',
            'entity.attributes.entity_picture',
         ], updateImage);

         if (refresh) {
            const interval = setInterval(reloadImage, refresh);

            $scope.$on('$destroy', function () {
               clearInterval(interval);
            });
         }
      },
   };
}
