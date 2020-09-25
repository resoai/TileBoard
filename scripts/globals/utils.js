import angular from 'angular';

export const mergeObjects = function (a, b) {
   return angular.merge(a, b);
};

export const leadZero = function (num) {
   if(num >= 0 && num < 10) {
      return '0' + num;
   }

   return num;
};

export const numberFilter = function (precision) {
   return function (value) {
      var num = parseFloat(value);

      return num && !isNaN(num) ? num.toFixed(precision) : value;
   };
};

export const switchPercents = function (field, max, round) {
   round = round || false;
   max = max || 100;

   return function (item, entity) {
      var value = field in entity.attributes ? entity.attributes[field] : null;

      value = parseFloat(value);

      if(isNaN(value)) {
         value = entity.state;

         if(item.states && value in item.states) {
            return item.states[value];
         }

         return value;
      }

      value = Math.round((value / max * 100));

      if(round) value = Math.round(value / 10) * 10;

      return value + '%';
   };
};

export const playSound = function(sound) {
   var audio = new Audio(sound);
   audio.loop = false;
   audio.play();
};

export const timeAgo = function (time) {
   time = +new Date(time);

   var timeFormats = [
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

   var seconds = (+new Date() - time) / 1000,
      token = 'ago',
      listChoice = 1;


   if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      listChoice = 2;
   }

   if (seconds >= 0 && seconds < 5) {
      return 'just now';
   }

   var i = 0, format;

   while ((format = timeFormats[i++])) {
      if (seconds < format[0]) {
         if (typeof format[2] === 'string') {
            return format[listChoice];
         }
         else {
            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
         }
      }
   }

   return time;
};

export const debounce = function(func, wait, immediate) {
   var timeout;
   return function() {
      var context = this, args = arguments;
      var later = function() {
         timeout = null;
         if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
   };
};

export const toAbsoluteServerURL = function(path) {
   var startsWithProtocol = path.indexOf('http') === 0;
   var url = startsWithProtocol ? path : window.CONFIG.serverUrl + '/' + path;
   // Replace extra forward slashes but not in protocol.
   return url.replace(/([^:])\/+/g, '$1/');
};
