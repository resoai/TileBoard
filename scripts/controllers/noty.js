import { App } from '../app';
import { NOTIES_POSITIONS } from '../globals/constants';
import Noty from '../models/noty';

App.controller('Noty', ['$scope', NotyController]);

function NotyController ($scope) {
   var notiesClasses = null;

   $scope.getNoties = function () {
      return Noty.noties;
   };

   $scope.clearAll = function () {
      Noty.removeAll();
   };

   $scope.getNotiesClasses = function () {
      if(!notiesClasses) {
         notiesClasses = [];

         var position = NOTIES_POSITIONS.RIGHT;

         if(window.CONFIG && window.CONFIG.notiesPosition) {
            position = window.CONFIG.notiesPosition;
         }

         notiesClasses.push('-' + position);
      }

      return notiesClasses;
   };

   Noty.onUpdate(function () {
      if(!$scope.$$phase) $scope.$digest();
   });
}
