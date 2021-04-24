import angular from 'angular';
import moment from 'moment';

export { moment };

export const mergeObjects = angular.merge;

export const leadZero = function (num) {
   if (num >= 0 && num < 10) {
      return '0' + num;
   }

   return num;
};

export const numberFilter = function (precision) {
   return function (value) {
      const num = parseFloat(value);

      return num && !isNaN(num) ? num.toFixed(precision) : value;
   };
};

export const switchPercents = function (field, max, round) {
   round = round || false;
   max = max || 100;

   return function (item, entity) {
      let value = field in entity.attributes ? entity.attributes[field] : null;

      value = parseFloat(value);

      if (isNaN(value)) {
         value = entity.state;

         if (item.states && value in item.states) {
            return item.states[value];
         }

         return value;
      }

      value = Math.round((value / max * 100));

      if (round) {
         value = Math.round(value / 10) * 10;
      }

      return value + '%';
   };
};

export const playSound = function (sound) {
   const audio = new Audio(sound);
   audio.loop = false;
   audio.play();
};

export const timeAgo = function (time, withoutSuffix = false) {
   const momentInTime = moment(new Date(time));
   return momentInTime.fromNow(withoutSuffix);
};

export const debounce = function (func, wait, immediate) {
   let timeout;
   return function () {
      const context = this;
      const args = arguments;
      const later = function () {
         timeout = null;
         if (!immediate) {
            func.apply(context, args);
         }
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
         func.apply(context, args);
      }
   };
};

export const toAbsoluteServerURL = function (path, serverUrlOverride = false) {
   const startsWithProtocol = path.indexOf('http') === 0;
   const url = startsWithProtocol ? path : (serverUrlOverride || window.SERVER_URL_OVERRIDE || window.CONFIG.serverUrl) + '/' + path;
   // Replace extra forward slashes but not in protocol.
   return url.replace(/([^:])\/+/g, '$1/');
};

export function supportsFeature (feature, entity) {
   return 'supported_features' in entity.attributes
      && (entity.attributes.supported_features & feature) !== 0;
}
