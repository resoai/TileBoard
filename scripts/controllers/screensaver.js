import angular from 'angular';
import { App } from '../app';
import { mergeObjects } from '../globals/utils';

App.controller('Screensaver', function ($scope) {
   if (!window.CONFIG) {
      return;
   }

   const $window = angular.element(window);
   let lastActivity = Date.now();
   const conf = window.CONFIG.screensaver || null;

   if (!conf || !conf.timeout) {
      return;
   }

   let activeSlide = 0;
   const slidesTimeout = conf.slidesTimeout || 1;

   $scope.now = new Date();
   $scope.isShown = false;
   $scope.conf = conf;
   $scope.slides = conf.slides;

   $scope.getSlideClasses = function (index, slide) {
      if (!slide._classes) {
         slide._classes = [];
      }

      const wasActive = activeSlide === index + 1
         || ($scope.slides.length === index + 1 && !activeSlide);

      slide._classes.length = 0;

      if (activeSlide === index) {
         slide._classes.push('-active');
      }

      if (wasActive) {
         slide._classes.push('-prev');
      }

      return slide._classes;
   };

   function setState (state) {
      $scope.isShown = state;

      // @ts-ignore
      if (window.setScreensaverShown) {
         // @ts-ignore
         window.setScreensaverShown(state);
      }

      if (!$scope.$$phase) {
         $scope.$digest();
      }
   }

   $scope.hideScreensaver = function () {
      setState(false);
   };

   $scope.getSlideStyle = function (slide) {
      if (!slide._styles) {
         slide._styles = {
            backgroundImage: 'url(' + slide.bg + ')',
         };

         if (slide.styles) {
            slide._styles = mergeObjects(slide._styles, slide.styles);
         }
      }

      return slide._styles;
   };

   setInterval(function () {
      const inactivity = Date.now() - lastActivity;

      const newState = conf.timeout < inactivity / 1000;

      if (newState !== $scope.isShown && !$scope.activeCamera) {
         setState(newState);
      }
   }, 1000);

   setInterval(function () {
      activeSlide += 1;

      if (activeSlide >= $scope.slides.length) {
         activeSlide = 0;
      }

      if ($scope.isShown) {
         $scope.now = new Date();

         if (!$scope.$$phase) {
            $scope.$digest();
         }
      }
   }, slidesTimeout * 1000);

   // @ts-ignore
   window.showScreensaver = function () {
      setTimeout(function () {
         lastActivity = 0;
         setState(true);
      }, 100);
   };

   // @ts-ignore
   window.hideScreensaver = function () {
      setTimeout(function () {
         lastActivity = Date.now();
         setState(false);
      }, 100);
   };

   $window.bind('click keypress touchstart focus', function () {
      lastActivity = Date.now();
   });
});
