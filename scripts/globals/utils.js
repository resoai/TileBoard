import angular from 'angular';

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

export const timeAgo = function (time) {
   time = +new Date(time);

   const timeFormats = [
      [60, 'seconds', 1],
      [120, '1 minute ago', '1 minute from now'],
      [3600, 'minutes', 60],
      [7200, '1 hour ago', '1 hour from now'],
      [86400, 'hours', 3600],
      [172800, 'a day ago', 'Tomorrow'],
      [604800, 'days', 86400],
      [1209600, 'Last week', 'Next week'],
      [2419200, 'weeks', 604800],
      [4838400, 'a month ago', 'Next month'],
      [29030400, 'months', 2419200],
      [58060800, 'a year ago', 'Next year'],
      [2903040000, 'years', 29030400],
   ];

   let seconds = (+new Date() - time) / 1000;
   let token = 'ago';
   let listChoice = 1;


   if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      listChoice = 2;
   }

   if (seconds >= 0 && seconds < 5) {
      return 'just now';
   }

   let i = 0;
   let format;

   while ((format = timeFormats[i++])) {
      if (seconds < format[0]) {
         if (typeof format[2] === 'string') {
            return format[listChoice];
         } else {
            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
         }
      }
   }

   return time;
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

export const toAbsoluteServerURL = function (path) {
   const startsWithProtocol = path.indexOf('http') === 0;
   const url = startsWithProtocol ? path : window.CONFIG.serverUrl + '/' + path;
   // Replace extra forward slashes but not in protocol.
   return url.replace(/([^:])\/+/g, '$1/');
};

export function supportsFeature (feature, entity) {
   if (!('supported_features' in entity.attributes)) {
      return false;
   }

   const features = entity.attributes.supported_features;

   return (features | feature) === features;
}
