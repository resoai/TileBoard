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

   /*Noty.addObject({
      type: Noty.ERROR,
      title: 'CONFIG is missing',
      message: error
   })*/
}


var Api = (function () {
   var apiPassword;

   if(!CONFIG.passwordType || CONFIG.passwordType === PASSWORD_TYPES.MANUAL) {
      apiPassword = CONFIG.password;
   }
   else if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT) {
      apiPassword = passwordPrompt(false);
   }
   else if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT_AND_SAVE) {
      apiPassword = passwordPrompt(true);
   }

   var Api = new HApi(CONFIG.wsUrl, apiPassword);

   if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT_AND_SAVE) {
      Api.onReady(function () {
         savePassword(apiPassword);
      });
   }

   return Api;
}());
