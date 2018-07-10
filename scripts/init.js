var App = angular.module('App', ['pr.longpress']);

App.config(function($sceProvider) {
   $sceProvider.enabled(false);
});


if(!window.CONFIG) {
   alert('Your config is incorrect. Please make sure "config.js" is valid javascript');
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
