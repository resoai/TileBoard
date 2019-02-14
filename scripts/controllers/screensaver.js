App.controller('Screensaver', ['$scope', ScreensaverController]);

function ScreensaverController ($scope) {
   if(!window.CONFIG) return;

   var $window = angular.element(window);
   var lastActivity = Date.now();
   var conf = CONFIG.screensaver || null;

   if(!conf || !conf.timeout) return;

   var activeSlide = 0;
   var slidesTimeout = conf.slidesTimeout || 1;

   $scope.now = new Date();
   $scope.isShown = false;
   $scope.conf = conf;
   $scope.slides = conf.slides;

   $scope.getSlideClasses = function (index, slide) {
      if(!slide._classes) {
         slide._classes = [];
      }

      var wasActive = activeSlide === index + 1
         || ($scope.slides.length === index + 1 && !activeSlide);

      slide._classes.length = 0;

      if(activeSlide === index) {
         slide._classes.push('-active');
      }

      if(wasActive) {
         slide._classes.push('-prev');
      }

      return slide._classes;
   };

   function setState (state) {
      $scope.isShown = state;

      if(window.setScreensaverShown) {
         setScreensaverShown(state);
      }

      if(!$scope.$$phase) $scope.$digest();
   }

   $scope.hideScreensaver = function () {
      setState(false);
   };

   $scope.getSlideStyle = function (slide) {
      if(!slide._styles) {
         slide._styles = {
            backgroundImage: 'url(' + slide.bg + ')'
         };

         if(slide.styles) {
            slide._styles = mergeObjects(slide._styles, slide.styles)
         }
      }

      return slide._styles;
   };

   setInterval(function () {
      var inactivity = Date.now() - lastActivity;

      var newState = conf.timeout < inactivity / 1000;

      if(newState !== $scope.isShown) {
         setState(newState);
      }
   }, 1000);

   setInterval(function () {
      activeSlide += 1;

      if(activeSlide >= $scope.slides.length) {
         activeSlide = 0;
      }

      if($scope.isShown) {
         $scope.now = new Date();

         if(!$scope.$$phase) $scope.$digest();
      }
   }, slidesTimeout * 1000);

   window.showScreensaver = function () {
      setTimeout(function () {
         lastActivity = 0;
         setState(true);
      }, 100);
   };

   window.hideScreensaver = function () {
      setTimeout(function () {
         lastActivity = Date.now();
         setState(false);
      }, 100);
   };

   $window.bind('click keypress touchstart focus', function () {
      lastActivity = Date.now();
   });
}