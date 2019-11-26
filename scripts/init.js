if(!window.CONFIG) {
   var error = 'Please make sure that you have "config.js" file and it is a valid javascript!\n' +
      'If you are running TileBoard for the first time, please rename "config.example.js" to "config.js"';

   alert(error);
}

var App = angular.module('App', ['hmTouchEvents', 'colorpicker', 'angularjs-gauge', 'chart.js']);

App.config(function($sceProvider, $locationProvider, ApiProvider, ChartJsProvider) {
   $sceProvider.enabled(false);

   $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
   });

   ApiProvider.setInitOptions({
      wsUrl: CONFIG.wsUrl,
      authToken: CONFIG.authToken,
   });

   var clock24 = window.CONFIG.timeFormat === 24;

   ChartJsProvider.setOptions('line', {
      maintainAspectRatio: false, // to fit popup automatically
      layout: {
         padding: {
            bottom: 10,
            left: 10,
            right: 10
         }
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
                  second: clock24 ? 'H:mm:ss' : 'h:mm:ss a'
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
            hitRadius: 5
         },
         line: {
            borderWidth: 1,
            stepped: true
         }
      },
      legend: {
         align: 'start',
         display: true
      },
      tooltips: {
         intersect: false
      },
      hover: {
        intersect: false
      },
   });

   // Workaround to add padding around legend.
   Chart.Legend.prototype.afterFit = function() { this.height += 20; };
});
