import angular from 'angular';

export const App = angular.module('App', ['hmTouchEvents', 'colorpicker', 'angularjs-gauge', 'angularMoment', 'chart.js', 'tmh.dynamicLocale'])
   .config(function (tmhDynamicLocaleProvider) {
      let locale = 'en';
      if (window.CONFIG && window.CONFIG.locale !== null && window.CONFIG.locale !== undefined) {
         locale = window.CONFIG.locale.toLowerCase();
      }

      // check if available language else default to english
      const locales = ['it', 'fr', 'es', 'de', 'pt', 'pl', 'nl', 'ru'];
      if (locales.includes(locale)) {
         tmhDynamicLocaleProvider.localeLocationPattern('/sources/angular-locale_{{locale}}.js').defaultLocale(locale);
      }
   });

