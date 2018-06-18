
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

         m.classList.add('clock--m');
         h.classList.add('clock--h');
         colon.classList.add('clock--colon');
         colon.textContent = ":";

         var updateTime = function () {
            var d = new Date();
            m.textContent = leadZero(d.getMinutes());
            h.textContent = leadZero(d.getHours());
         };

         $el[0].appendChild(h);
         $el[0].appendChild(colon);
         $el[0].appendChild(m);

         updateTime();

         var interval = setInterval(updateTime, 1000);

         $scope.$on('$destroy', function() {
            clearInterval(interval);
         });
      }
   }
}]);
