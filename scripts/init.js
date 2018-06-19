if(!window.CONFIG) {
   alert('Your config is incorrect. Please make sure "config.js" is valid javascript');
}

var api = new Api(CONFIG.wsUrl, CONFIG.password);

var App = angular.module('App', ['pr.longpress']);

App.config(function($sceProvider) {
   $sceProvider.enabled(false);
});