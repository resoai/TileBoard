import angular from 'angular';
import 'hammerjs';
import 'angular-hammer';
import 'angular-chart.js';
import 'angularjs-gauge';
import 'angular-moment';
import 'angular-dynamic-locale';
import './vendors/color-picker';
import { App } from './app';

// Initializes angular app manually. This is triggered from the onload event of the config.js script.
// @ts-ignore
window.initApp = function () {
   angular.element(function () {
      angular.bootstrap(document, [App.name]);
   });

   App.config(function ($sceProvider, $locationProvider, ApiProvider, ChartJsProvider, tmhDynamicLocaleProvider) {
      $sceProvider.enabled(false);

      $locationProvider.html5Mode({
         enabled: true,
         requireBase: false,
      });

      if (!window.CONFIG) {
         return;
      }

      ApiProvider.setInitOptions({
         wsUrl: window.WS_URL_OVERRIDE || window.CONFIG.wsUrl,
         authToken: window.AUTH_TOKEN_OVERRIDE || window.CONFIG.authToken,
      });

      tmhDynamicLocaleProvider.localeLocationPattern('./locales/{{locale}}.js');

      const clock24 = window.CONFIG.timeFormat === 24;

      ChartJsProvider.setOptions('line', {
         maintainAspectRatio: false, // to fit popup automatically
         layout: {
            padding: {
               bottom: 10,
               left: 10,
               right: 10,
            },
         },
         scales: {
            xAxes: [{
               type: 'time',
               time: {
                  displayFormats: {
                     datetime: clock24 ? 'MMM D, YYYY, H:mm:ss' : 'MMM D, YYYY, h:mm:ss a',
                     hour: clock24 ? 'H:mm' : 'h:mm a',
                     millisecond: clock24 ? 'H:mm:ss.SSS' : 'h:mm:ss.SSS a',
                     minute: clock24 ? 'H:mm' : 'h:mm a',
                     second: clock24 ? 'H:mm:ss' : 'h:mm:ss a',
                  },
               },
            }],
            yAxes: [
               {
                  ticks: {
                     maxTicksLimit: 7,
                  },
               },
            ],
         },
         elements: {
            point: {
               radius: 0, // to remove points
               hitRadius: 5,
            },
            line: {
               borderWidth: 1,
               stepped: true,
            },
         },
         legend: {
            align: 'start',
            display: true,
         },
         tooltips: {
            intersect: false,
         },
         hover: {
            intersect: false,
         },
      });

      // Workaround to add padding around legend.
      window.Chart.Legend.prototype.afterFit = function () {
         this.height += 20;
      };
   });
};
