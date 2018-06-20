
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

            el.style.backgroundImage = 'url(' + url + ')';
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

            var url = photoUrl + '&_i=' + $i++;

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

App.directive('cameraThumbnail', function () {
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

            el.style.backgroundImage = 'url(' + url + ')';
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

            // @TODO remove if
            if(!CONFIG.debug) {
               api.send({
                  type: "camera_thumbnail",
                  entity_id: $scope.entity.entity_id
               }, function (res) {
                  if(!res.result) return;

                  var url = 'data:'+res.result.content_type+';base64,' + res.result.content;

                  appendImage(url);
               });
            }
            else {
               var url = Math.random() > 0.5
                  ? 'images/camera.jpg' : 'images/camera2.jpg';

               appendImage(url);
            }
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
});


App.directive('clock', ['$interval', function ($interval) {
   return {
      restrict: 'AE',
      replace: true,
      link: function ($scope, $el, attrs) {
         var m = document.createElement('div');
         var h = document.createElement('div');
         var colon = document.createElement('colon');
         var ampm = document.createElement("div");

         m.classList.add('clock--m');
         h.classList.add('clock--h');
         colon.classList.add('clock--colon');
         colon.textContent = ":";
         ampm.classList.add('clock--timeFormat');

         var updateTime = function () {
            var d = new Date();
            if(CONFIG.timeFormat === 12){
                if(d.getHours() === 12){
                    h.textContent = d.getHours();
                    m.textContent = leadZero(d.getMinutes());
                    ampm.textContent = 'PM';
                } else if(d.getHours() > 11){
                    h.textContent = d.getHours() - 12;
                    m.textContent = leadZero(d.getMinutes());
                    ampm.textContent = 'PM';
                } else {
                    h.textContent = d.getHours();
                    m.textContent = leadZero(d.getMinutes());
                    ampm.textContent = 'AM';
                }
            } else {
                h.textContent = leadZero(d.getHours());
                m.textContent = leadZero(d.getMinutes());
                ampm.textContent = '';
            }
         };

         $el[0].appendChild(h);
         $el[0].appendChild(colon);
         $el[0].appendChild(m);
         $el[0].appendChild(ampm);

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
