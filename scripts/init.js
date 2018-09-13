var App = angular.module('App', ['pr.longpress']);

App.config(function($sceProvider) {
   $sceProvider.enabled(false);
});

App.config(function($locationProvider) {
   $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
   });
});


if(!window.CONFIG) {
   var error = 'Please make sure you have "config.js" file and it\'s a valid javascript!\n' +
      'If you running TileBoard for the first time, please rename "config.example.js" to "config.js"';

   alert(error);
}

var Api = new HApi(CONFIG.wsUrl);

getAccessToken(function (token) {
   if(token) {
      Api.init(token.access_token);
   }
   else {
      Noty.addObject({
         type: Noty.ERROR,
         title: 'ACCESS TOKEN',
         message: 'Error while receiving access token'
      });
   }
});

