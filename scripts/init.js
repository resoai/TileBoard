var api = new Api(CONFIG.wsUrl, CONFIG.password);

var App = angular.module('App', ['pr.longpress']);

App.config(function($sceProvider) {
   $sceProvider.enabled(false);
});

if(!CONFIG.debug) window.oncontextmenu = function(event) {
   event.preventDefault();
   event.stopPropagation();
   return false;
};