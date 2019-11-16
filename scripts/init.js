if(!window.CONFIG) {
   var error = 'Please make sure you have "config.js" file and it\'s a valid javascript!\n' +
      'If you running TileBoard for the first time, please rename "config.example.js" to "config.js"';

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

   ChartJsProvider.setOptions('line', {
      maintainAspectRatio: false, // to fit popup automatically
      scales: {
         xAxes: [{
            type: 'time',
            time: {
               displayFormats: {
                  hour: window.CONFIG.timeFormat === 24 ? 'H:mm' : 'h:mmA',
               },
            },
         }],
      },
      elements: { 
         point: { 
            radius: 0, // to remove points
         },
         line: {
            borderWidth: 1,
            stepped: true
         }
      },
      legend: {
         display: true
      },
      tooltips: {
         mode: 'index',
         intersect: false
      }
   });

});
