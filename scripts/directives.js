App.directive('tile', function () {
   return {
      restrict: 'AE',
      replace: false,
      scope: '=',
      templateUrl: 'tile.html',
      link: function ($scope, $el, attrs) {
      }
   }
});

App.directive('camera', function () {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed'
      },
      link: function ($scope, $el, attrs) {
         var $i = 0;
         var photoUrl = null;
         var refresh = $scope.item.refresh || false;
         var current = null;
         var prev = null;

         if(typeof refresh === "function") refresh = refresh();

         var appendImage = function (url) {
            var el = document.createElement('div');

            if(url) el.style.backgroundImage = 'url("' + toAbsoluteServerURL(url) + '")';

            el.style.backgroundSize = $scope.item.bgSize || 'cover';

            $el[0].appendChild(el);

            if(prev) $el[0].removeChild(prev);

            setTimeout(function () {
               el.style.opacity = 1;
            }, 100);

            prev = current;
            current = el;
         };

         var getPhotoUrl = function () {
            if($scope.item.filter) {
               return $scope.item.filter($scope.item, $scope.entity)
            }

            if($scope.entity && $scope.entity.attributes.entity_picture) {
               return $scope.entity.attributes.entity_picture;
            }

            return null;
         };

         var reloadImage = function () {
            if(!photoUrl) return;

            if($i > 1 && $scope.freezed) return;

            var url = photoUrl;

            url += (url.indexOf('?') === -1 ? '?' : '&') + ('_i=' + $i++);

            appendImage(url)
         };

         var setPhoto = function (url) {
            photoUrl = url;

            if(!photoUrl) return;

            reloadImage();
         };

         var updatePhoto = function () {
            var newUrl = getPhotoUrl();

            if(photoUrl !== newUrl) setPhoto(newUrl);
         };

         $scope.$watch('item', updatePhoto);
         $scope.$watch('entity', updatePhoto);

         if(refresh) {
            var interval = setInterval(reloadImage, refresh);

            $scope.$on('$destroy', function() {
               clearInterval(interval);
            });
         }
      }
   }
});

App.directive('cameraThumbnail', ['Api', function (Api) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed'
      },
      link: function ($scope, $el, attrs) {
         var refresh = 'refresh' in $scope.item ? $scope.item.refresh : 2000;

         if(typeof refresh === "function") refresh = refresh();

         var throttle = refresh ? refresh * 0.9 : 100;
         var lastUpdate = 0;
         var current = null;
         var prev = null;

         var appendImage = function (url) {
            var el = document.createElement('div');

            if(url) el.style.backgroundImage = 'url(' + url + ')';
            el.style.backgroundSize = $scope.item.bgSize || 'cover';

            $el[0].appendChild(el);

            if(prev) $el[0].removeChild(prev);

            setTimeout(function () {
               el.style.opacity = 1;
            }, 100);

            prev = current;
            current = el;
         };

         var reloadImage = function () {
            if(Date.now() - lastUpdate < throttle) return;

            if(lastUpdate && $scope.freezed) return;

            lastUpdate = Date.now();

            if($scope.entity.state === "off") return;

            Api.send({
                  type: "camera_thumbnail",
                  entity_id: $scope.entity.entity_id
               },
               function (res) {
                  if(!res.result) return;

                  var url = 'data:'+res.result.content_type+';base64,' + res.result.content;

                  appendImage(url);
            });
         };

         $scope.$watch('item', reloadImage);
         $scope.$watch('entity', reloadImage);

         if(refresh) {
            var interval = setInterval(reloadImage, refresh);

            $scope.$on('$destroy', function() {
               clearInterval(interval);
            });
         }
      }
   }
}]);

App.directive('cameraStream', ['Api', function (Api) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         item: '=item',
         entity: '=entity',
         freezed: '=freezed'
      },
      link: function ($scope, $el, attrs) {
         var current = null;

         var appendVideo = function (url) {
            var el = document.createElement('video');
            el.style.objectFit = $scope.item.objFit || 'fill';
            el.style.width = '100%';
            el.style.height = '100%';
            el.muted = 'muted';

            var len = (typeof $scope.item.bufferLength !== "undefined") ? $scope.item.bufferLength : 5;

            var config = {
               maxBufferLength: len,
               maxMaxBufferLength: len
            };

            var hls = new Hls(config);
            hls.loadSource(url);
            hls.attachMedia(el);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
               el.play();
            });
            
            if(current) $el[0].removeChild(current);
            $el[0].appendChild(el);

            current = el;
         };

         var requestStream = function () {
            if($scope.entity.state === "off") return;

            Api.send({
                  type: "camera/stream",
                  entity_id: $scope.entity.entity_id
               },
               function (res) {
                  if(!res.result) return;
                  appendVideo(toAbsoluteServerURL(res.result.url));
               });
         };
         
         $scope.$watch('entity', requestStream);
      }
   }
}]);

App.directive('clock', ['$interval', function ($interval) {
   return {
      restrict: 'AE',
      replace: true,
      link: function ($scope, $el, attrs) {
         var $m = document.createElement('div');
         var $h = document.createElement('div');
         var $colon = document.createElement('div');
         var $postfix = document.createElement('div');

         $m.classList.add('clock--m');
         $h.classList.add('clock--h');

         $postfix.classList.add('clock--postfix');

         $colon.classList.add('clock--colon');
         $colon.textContent = ":";

         var updateTime = function () {
            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var postfix = '';

            if(CONFIG.timeFormat === 12) {
               postfix = h >= 12 ? 'PM' : 'AM';

               h = h % 12 || 12;
            }
            else {
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

         var interval = setInterval(updateTime, 1000);

         $scope.$on('$destroy', function() {
            clearInterval(interval);
         });
      }
   }
}]);


App.directive('iframeTile', ['$interval', function ($interval) {
   return {
      restrict: 'A',
      replace: false,
      scope: {
         item: '=iframeTile',
      },
      link: function ($scope, $el, attrs) {
         var iframe = $el[0];

         var updateIframe = function () {
            iframe.src = iframe.src;
         };

         if($scope.item.refresh) {
            var time = $scope.item.refresh;

            if(typeof time === "function") time = time();

            time = Math.max(1000, time);

            var interval = setInterval(updateIframe, time);

            $scope.$on('$destroy', function() {
               clearInterval(interval);
            });
         }

      }
   }
}]);



App.directive('headerItem', ['$interval', function ($interval) {
   return {
      restrict: 'AE',
      replace: false,
      scope: '=',
      templateUrl: 'header-items.html',
      link: function ($scope, $el, attrs) {

      }
   }
}]);


App.directive('date', ['$interval', function ($interval) {
   return {
      restrict: 'AE',
      replace: true,
      scope: {
         format: '='
      },
      template: '<div class="date" ng-bind="date|date:format"></div>',
      link: function ($scope, $el, attrs) {
         $scope.format = $scope.format || 'EEEE, LLLL dd';

         $scope.date = new Date();

         $interval(function () {
            $scope.date = new Date();
         }, 60 * 1000);
      }
   }
}]);


App.directive('onScroll', [function () {
   return {
      restrict: 'A',
      scope: {
         onScrollModel: '=',
      },
      link: function ($scope, $el, attrs) {
         var lastScrolledHorizontally = false;
         var lastScrolledVertically = false;

         var determineScroll = function () {
            var scrolledHorizontally = $el[0].scrollLeft !== 0;
            var scrolledVertically = $el[0].scrollTop !== 0;

            if(lastScrolledVertically !== scrolledVertically ||
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
            if(determineScroll()) {
               $scope.$apply();
            }
         });
      },
   }
}]);

