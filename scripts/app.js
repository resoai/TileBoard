var CLASS_BIG = "-big-entity";
var CLASS_SMALL = "-small-entity";

var GOOGLE_MAP = "google";
var YANDEX_MAP = "yandex";

var TRANSITIONS = {
   ANIMATED: 'animated',
   ANIMATED_GPU: 'animated_gpu',
   SIMPLE: 'simple' // fastest
};

var ITEM_TRANSPARENT = "transparent";

var CUSTOM_THEMES = {
   TRANSPARENT: "transparent",
   WIN95: "win95",
};

var PASSWORD_TYPES = {
   MANUAL: 'manual', // default
   PROMPT: 'prompt',
   PROMPT_SAVING: 'prompt_saving'
};

var TYPES = {
   DEVICE_TRACKER: 'device_tracker',
   SCRIPT: 'script',
   AUTOMATION: 'automation',
   SENSOR: 'sensor',
   SENSOR_ICON: 'sensor_icon',
   SWITCH: 'switch',
   LOCK: 'lock',
   COVER: 'cover',
   FAN: 'fan',
   GENERIC_ICON: 'generic_icon',
   INPUT_BOOLEAN: 'input_boolean',
   LIGHT: 'light',
   TEXT_LIST: 'text_list',
   INPUT_NUMBER: 'input_number',
   INPUT_SELECT: 'input_select',
   CAMERA: 'camera',
   CAMERA_THUMBNAIL: 'camera_thumbnail',
   SCENE: 'scene',
   SLIDER: 'slider',
   IFRAME: 'iframe',
   DOOR_ENTRY: 'door_entry',
   WEATHER: 'weather',
   CLIMATE: 'climate',
   MEDIA_PLAYER: 'media_player',
   CUSTOM: 'custom'
};

var FEATURES = {
   PAUSE: 1,
   SEEK: 2,
   VOLUME_SET: 4,
   VOLUME_MUTE: 8,
   PREVIOUS_TRACK: 16,
   NEXT_TRACK: 32,
   YOUTUBE: 64,
   TURN_ON: 128,
   TURN_OFF: 256,
   STOP: 4096
};

var PWD_CACHE_KEY = "_pwd1";


function mergeObjects (a, b) {
   return angular.merge(a, b);
}

function leadZero (num) {
   if(num >= 0 && num < 10) {
      return "0" + num;
   }

   return num;
}

function numberFilter (precision) {
   return function (value) {
      var num = parseFloat(value);

      return num && !isNaN(num) ? num.toFixed(precision) : value;
   }
}

function switchPercents (field, max, round) {
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
   }
}

function debounce(func, wait, immediate) {
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
}

function askPassword (fromCache) {
   fromCache = fromCache || false;

   var res = null;

   if(fromCache) res = localStorage.getItem(PWD_CACHE_KEY);

   if(!res) res = prompt("Enter your password");

   return res;
}

function savePassword (password) {
   localStorage.setItem(PWD_CACHE_KEY, password);
}