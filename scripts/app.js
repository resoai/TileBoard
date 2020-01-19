var CLASS_BIG = "-big-entity";
var CLASS_SMALL = "-small-entity";
var CLASS_MICRO = "-micro-entity";

var GOOGLE_MAP = "google";
var YANDEX_MAP = "yandex";
var MAPBOX_MAP = "mapbox";

var TRANSITIONS = {
   ANIMATED: 'animated',
   ANIMATED_GPU: 'animated_gpu',
   SIMPLE: 'simple' // fastest
};

var ITEM_TRANSPARENT = "transparent";

var CUSTOM_THEMES = {
   TRANSPARENT: "transparent",
   MATERIAL: "material",
   WIN95: "win95",
   WINPHONE: "winphone",
   MOBILE: "mobile",
   COMPACT: "compact",
   HOMEKIT: "homekit",
   FRESH_AIR: "fresh-air",
   WHITE_PAPER: "white-paper",
};

var PASSWORD_TYPES = {};

var TYPES = {
   DEVICE_TRACKER: 'device_tracker',
   SCRIPT: 'script',
   AUTOMATION: 'automation',
   SENSOR: 'sensor',
   SENSOR_ICON: 'sensor_icon',
   SWITCH: 'switch',
   LOCK: 'lock',
   COVER: 'cover',
   COVER_TOGGLE: 'cover_toggle',
   FAN: 'fan',
   INPUT_BOOLEAN: 'input_boolean',
   LIGHT: 'light',
   TEXT_LIST: 'text_list',
   INPUT_NUMBER: 'input_number',
   INPUT_SELECT: 'input_select',
   INPUT_DATETIME: 'input_datetime',
   CAMERA: 'camera',
   CAMERA_THUMBNAIL: 'camera_thumbnail',
   CAMERA_STREAM: 'camera_stream',
   SCENE: 'scene',
   SLIDER: 'slider',
   IFRAME: 'iframe',
   DOOR_ENTRY: 'door_entry',
   WEATHER: 'weather',
   CLIMATE: 'climate',
   MEDIA_PLAYER: 'media_player',
   CUSTOM: 'custom',
   ALARM: 'alarm',
   WEATHER_LIST: 'weather_list',
   VACUUM: 'vacuum',
   POPUP_IFRAME: 'popup_iframe',
   DIMMER_SWITCH: 'dimmer_switch',
   GAUGE: 'gauge',
   IMAGE: 'image',    
};

var HEADER_ITEMS = {
   TIME: 'time',
   DATE: 'date',
   DATETIME: 'datetime',
   WEATHER: 'weather',
   CUSTOM_HTML: 'custom_html'
};

var SCREENSAVER_ITEMS = HEADER_ITEMS;

var FEATURES = {
   LIGHT: {
      BRIGHTNESS: 1
   },
   MEDIA_PLAYER: {
      PAUSE: 1,
      SEEK: 2,
      VOLUME_SET: 4,
      VOLUME_STEP: 1024,
      VOLUME_MUTE: 8,
      PREVIOUS_TRACK: 16,
      NEXT_TRACK: 32,
      YOUTUBE: 64,
      TURN_ON: 128,
      TURN_OFF: 256,
      STOP: 4096
   },
   VACUUM: {
      TURN_ON: 1,
      TURN_OFF: 2,
      PAUSE: 4,
      STOP: 8,
      RETURN_HOME: 16,
      FAN_SPEED: 32,
      BATTERY: 64,
      STATUS: 128,
      SEND_COMMAND: 256,
      LOCATE: 512,
      CLEAN_SPOT: 1024,
      MAP: 2048,
      STATE: 4096,
      START: 8192
   }
};

var MENU_POSITIONS = {
   LEFT: 'left',
   BOTTOM: 'bottom'
};

var GROUP_ALIGNS = {
   VERTICALLY: 'vertically',
   HORIZONTALLY: 'horizontally'
};

var NOTIES_POSITIONS = {
   LEFT: 'left',
   RIGHT: 'right'
};

var ENTITY_SIZES = {
   SMALL: 'small',
   NORMAL: 'normal',
   BIG: 'big'
};

var TOKEN_CACHE_KEY = "_tkn1";

var DEFAULT_HEADER = {
   styles: {
      padding: '30px 130px 0',
      fontSize: '28px'
   },
   left: [
      {
         type: HEADER_ITEMS.DATETIME,
         dateFormat: 'EEEE, LLLL dd', //https://docs.angularjs.org/api/ng/filter/date
         styles: {
            margin: '0'
         }
      }
   ],
   right: [
      {
         type: HEADER_ITEMS.CUSTOM_HTML,
         html: 'Welcome to the <b>TileBoard</b>',
         styles: {
            margin: '40px 0 0'
         }
      },
      /*{
         type: HEADER_ITEMS.WEATHER,
         styles: {
            margin: '0 0 0'
         },
         icon: '&sensor.dark_sky_icon.state',
         icons: {
            'clear-day': 'clear',
            'clear-night': 'nt-clear',
            'cloudy': 'cloudy',
            'rain': 'rain',
            'sleet': 'sleet',
            'snow': 'snow',
            'wind': 'hazy',
            'fog': 'fog',
            'partly-cloudy-day': 'partlycloudy',
            'partly-cloudy-night': 'nt-partlycloudy'
         },
         fields: {
            summary: '&sensor.dark_sky_summary.state',
            temperature: '&sensor.dark_sky_temperature.state',
            temperatureUnit: '&sensor.dark_sky_temperature.attributes.unit_of_measurement',
         }
      }*/
   ]
};

window.onerror = function (error, file, line, char) {
   var text = [
      error,
      'File: ' + file,
      'Line: ' + line + ':' + char
   ].join("<br>");

   Noty.addObject({
      type: Noty.ERROR,
      title: "JS error",
      message: text,
      lifetime: 12,
      id: error
   });
};


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

function playSound(sound) {
   var audio = new Audio(sound);
   audio.loop = false;
   audio.play();
}

function timeAgo (time) {
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
      [2903040000, 'years', 29030400]
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

   while (format = timeFormats[i++]) {
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

function toAbsoluteServerURL(path) {
   var startsWithProtocol = path.indexOf('http') === 0;
   var url = startsWithProtocol ? path : CONFIG.serverUrl + '/'+ path;
   // Replace extra forward slashes but not in protocol.
   return url.replace(/([^:])\/+/g, '$1/');
}
