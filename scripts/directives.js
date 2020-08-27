import Hls from 'hls.js';
import { App } from './app';
import { leadZero, toAbsoluteServerURL, PreventGhostClick } from './globals/utils';

App.directive('tile', function () {
   return {
      restrict: 'AE',
      replace: false,
      scope: true,
      templateUrl: 'tile.html',
      link: function ($scope, $el, attrs) {
      },
   };
});

App.directive('camera', function () {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed',
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

            if ($i > 1 && $scope.freezed) {
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
});

App.directive('cameraThumbnail', function (Api) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed',
      },
      link: function ($scope, $el, attrs) {
         let refresh = 'refresh' in $scope.item ? $scope.item.refresh : 2000;

         if (typeof refresh === 'function') {
            refresh = refresh();
         }

         const throttle = refresh ? refresh * 0.9 : 100;
         let lastUpdate = 0;
         let current = null;
         let prev = null;

         const appendImage = function (url) {
            const el = document.createElement('div');

            if (url) {
               el.style.backgroundImage = 'url(' + url + ')';
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

         const reloadImage = function () {
            if (Date.now() - lastUpdate < throttle) {
               return;
            }

            if (lastUpdate && $scope.freezed) {
               return;
            }

            lastUpdate = Date.now();

            if ($scope.entity.state === 'off') {
               return;
            }

            Api.send({
               type: 'camera_thumbnail',
               entity_id: $scope.entity.entity_id,
            },
            function (res) {
               if (!res.result) {
                  return;
               }

               const url = 'data:' + res.result.content_type + ';base64,' + res.result.content;

               appendImage(url);
            });
         };

         $scope.$watchGroup([
            'item',
            'entity',
         ], reloadImage);

         if (refresh) {
            const interval = setInterval(reloadImage, refresh);

            $scope.$on('$destroy', function () {
               clearInterval(interval);
            });
         }
      },
   };
});

App.directive('cameraStream', function (Api) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed',
      },
      link: function ($scope, $el, attrs) {
         let current = null;
         let hls = null;

         const appendVideo = function (url) {
            const el = document.createElement('video');
            el.style.objectFit = $scope.item.objFit || 'fill';
            el.style.width = '100%';
            el.style.height = '100%';
            el.muted = 'muted';

            const len = $scope.item.bufferLength || 5;

            const config = {
               maxBufferLength: len,
               maxMaxBufferLength: len,
            };

            if (hls) {
               hls.destroy();
            }
            hls = new Hls(config);
            hls.loadSource(url);
            hls.attachMedia(el);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
               el.play();
            });

            if (current) {
               $el[0].removeChild(current);
            }
            $el[0].appendChild(el);

            current = el;
         };

         const requestStream = function () {
            if ($scope.entity.state === 'off') {
               return;
            }

            Api.send({
               type: 'camera/stream',
               entity_id: $scope.entity.entity_id,
            },
            function (res) {
               if (!res.result) {
                  return;
               }
               appendVideo(toAbsoluteServerURL(res.result.url));
            });
         };

         $scope.$watch('entity', requestStream);

         $scope.$on('$destroy', function () {
            if (hls) {
               hls.destroy();
            }
         });
      },
   };
});

App.directive('clock', function ($interval) {
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
});


App.directive('iframeTile', function ($interval) {
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
});


App.directive('headerItem', function () {
   return {
      restrict: 'AE',
      replace: false,
      scope: '=',
      templateUrl: 'header-items.html',
      link: function ($scope, $el, attrs) {},
   };
});


App.directive('date', function ($interval) {
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
});


App.directive('onScroll', function () {
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
               $scope.onScrollModel.scrolledHorizontally =
                  lastScrolledHorizontally = scrolledHorizontally;
               $scope.onScrollModel.scrolledVertically =
                  lastScrolledVertically = scrolledVertically;

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
});

// Custom directives to fix angularjs bug with dynamic max values being overriden to 100.
// https://github.com/angular/angular.js/issues/6726
App.directive('ngMin', function () {
   return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr) {
         elem.attr('min', attr.ngMin);
      },
   };
});
App.directive('ngMax', function () {
   return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr) {
         elem.attr('max', attr.ngMax);
      },
   };
});

// Custom directive to prevent ghost clicks
App.directive('preventGhostClick', function () {
   return {
      restrict: 'A',
      link: function (scope, elem, attr) {
         PreventGhostClick(elem);
      },
   };
});
