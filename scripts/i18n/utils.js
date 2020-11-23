// object holding all locale setups
const _locales = {};

// emulate $provide.value()
const mockProvide = {
   value (key, val) {
      mockProvide[key] = val;
   },
};

// export the current ngLocale setup
export function extractNgLocale () {
   const currentModule = angular.module('ngLocale');
   const configFunction = currentModule._configBlocks[0][2][0][1];

   configFunction(mockProvide);
   _locales[mockProvide.$locale.id] = {
      name: currentModule.name,
      requires: currentModule.requires,
      configFunction: configFunction,
      $locale: mockProvide.$locale,
   };
}

// actually set the locale
import moment from 'moment';
import angular from 'angular';
export function setLocale (id) {
   angular.module(_locales[id].name, _locales[id].requires, _locales[id].configFunction);
   moment.locale(id);
}
