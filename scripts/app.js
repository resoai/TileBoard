import angular from 'angular';
import 'hammerjs';
import 'angular-hammer';
import 'angular-chart.js';
import 'angularjs-gauge';
import 'angular-moment';
import './vendors/color-picker';

export const App = angular.module('App', ['hmTouchEvents', 'colorpicker', 'angularjs-gauge', 'angularMoment', 'chart.js']);
