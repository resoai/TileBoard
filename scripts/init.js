var App = angular.module('App', ['hmTouchEvents', 'colorpicker', 'angularjs-gauge']);

App.config(function($sceProvider, $locationProvider, ApiProvider) {
   $sceProvider.enabled(false);

   $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
   });

   ApiProvider.setInitOptions({
      wsUrl: CONFIG.wsUrl,
      authToken: CONFIG.authToken,
   });
});

if(!window.CONFIG) {
   var error = 'Please make sure you have "config.js" file and it\'s a valid javascript!\n' +
      'If you running TileBoard for the first time, please rename "config.example.js" to "config.js"';

   alert(error);
}
