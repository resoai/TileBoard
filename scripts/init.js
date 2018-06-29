if(!window.CONFIG) {
   alert('Your config is incorrect. Please make sure "config.js" is valid javascript');
}

var apiPassword;

if(!CONFIG.passwordType || CONFIG.passwordType === PASSWORD_TYPES.MANUAL) {
   apiPassword = CONFIG.password;
}
else if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT) {
   apiPassword = askPassword(false);
}
else if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT_SAVING) {
   apiPassword = askPassword(true);
}

console.log('apiPassword', apiPassword);

var api = new Api(CONFIG.wsUrl, apiPassword);

var App = angular.module('App', ['pr.longpress']);

App.config(function($sceProvider) {
   $sceProvider.enabled(false);
});

if(CONFIG.passwordType === PASSWORD_TYPES.PROMPT_SAVING) {
   api.onReady(function () {
      savePassword(apiPassword);
   });
}