import Hls from 'hls.js';
import { toAbsoluteServerURL } from '../globals/utils';

/**
 * @ngInject
 *
 * @type {angular.IDirectiveFactory}
 */
export default function (Api, $timeout) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         frozen: '=frozen',
      },
      link: function ($scope, $el, attrs) {
         // Time after which the stream will be stopped entirely (media element will be detached)
         // after the playback was paused due to frozen=true.
         const SUSPEND_TIMEOUT_MS = 5000;
         let suspendPromise = null;
         /** @type {HTMLMediaElement | null} */
         let current = null;
         /** @type {Hls | null} */
         let hls = null;

         $scope.$watch('frozen', frozen => {
            if (frozen) {
               onFreezed();
            } else {
               onUnfreezed();
            }
         });

         function onFreezed () {
            if (current && !current.paused) {
               current.pause();
               suspendPromise = $timeout(() => {
                  if (hls) {
                     hls.destroy();
                     hls = null;
                     current.remove();
                     current = null;
                  }
               }, SUSPEND_TIMEOUT_MS);
            }
         }

         function onUnfreezed () {
            $timeout.cancel(suspendPromise);
            if (hls) {
               Promise.resolve(current.play()).catch(() => {});
            } else {
               requestStream();
            }
         }

         const appendVideo = function (url) {
            const el = document.createElement('video');
            el.style.objectFit = $scope.item.objFit || 'fill';
            el.style.width = '100%';
            el.style.height = '100%';
            el.muted = true;

            if (Hls.isSupported()) {
               const len = $scope.item.bufferLength || 5;

               const config = {
                  maxBufferLength: len,
                  maxMaxBufferLength: len,
               };

               if (hls) {
                  hls.destroy();
               }
               hls = new Hls(config);
               hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                  hls.loadSource(url);
               });
               hls.on(Hls.Events.MANIFEST_PARSED, function () {
                  Promise.resolve(el.play()).catch(() => {});
               });
               hls.attachMedia(el);
            } else {
               el.src = url;
               el.setAttribute('playsinline', 'playsinline');
               el.addEventListener('loadedmetadata', function () {
                  Promise.resolve(el.play()).catch(() => {});
               });
            }

            if (current) {
               $el[0].removeChild(current);
            }
            $el[0].appendChild(el);

            current = el;
         };

         const requestStream = function () {
            if ($scope.entity.state === 'off' || $scope.frozen) {
               return;
            }

            Api.send(
               {
                  type: 'camera/stream',
                  entity_id: $scope.entity.entity_id,
               },
               function (res) {
                  if (!res.result) {
                     return;
                  }
                  appendVideo(toAbsoluteServerURL(res.result.url));
               },
            );
         };

         $scope.$watch('entity', requestStream);

         $scope.$on('$destroy', function () {
            $timeout.cancel(suspendPromise);
            if (hls) {
               hls.destroy();
            }
         });
      },
   };
}
