import * as Constants from './globals/constants';
import * as Utils from './globals/utils';
import Noty from './models/noty';

// Expose all constants and utils on window as those can be used by config.
for (const key in Constants) {
   if (Object.prototype.hasOwnProperty.call(Constants, key)) {
      window[key] = Constants[key];
   }
}

for (const key in Utils) {
   if (Object.prototype.hasOwnProperty.call(Utils, key)) {
      window[key] = Utils[key];
   }
}

// @ts-ignore
window.Noty = Noty;

// Set up global error handler.
window.onerror = function (error, file, line, char) {
   const text = [
      error,
      'File: ' + file,
      'Line: ' + line + ':' + char,
   ].join('<br>');

   Noty.addObject({
      type: Noty.ERROR,
      title: 'JS error',
      message: text,
      lifetime: 12,
      id: error,
   });
};
