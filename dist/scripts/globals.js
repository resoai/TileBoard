(function () {
   'use strict';

   const mergeObjects = function (a, b) {
     return window.angular.merge(a, b);
   };
   const leadZero = function (num) {
     if (num >= 0 && num < 10) {
       return '0' + num;
     }

     return num;
   };
   const numberFilter = function (precision) {
     return function (value) {
       var num = parseFloat(value);
       return num && !isNaN(num) ? num.toFixed(precision) : value;
     };
   };
   const switchPercents = function (field, max, round) {
     round = round || false;
     max = max || 100;
     return function (item, entity) {
       var value = field in entity.attributes ? entity.attributes[field] : null;
       value = parseFloat(value);

       if (isNaN(value)) {
         value = entity.state;

         if (item.states && value in item.states) {
           return item.states[value];
         }

         return value;
       }

       value = Math.round(value / max * 100);
       if (round) value = Math.round(value / 10) * 10;
       return value + '%';
     };
   };
   const playSound = function (sound) {
     var audio = new Audio(sound);
     audio.loop = false;
     audio.play();
   };
   const timeAgo = function (time) {
     time = +new Date(time);
     var timeFormats = [[60, 'seconds', 1], [120, '1 minute ago', '1 minute from now'], [3600, 'minutes', 60], [7200, '1 hour ago', '1 hour from now'], [86400, 'hours', 3600], [172800, 'a day ago', 'Tomorrow'], [604800, 'days', 86400], [1209600, 'Last week', 'Next week'], [2419200, 'weeks', 604800], [4838400, 'a month ago', 'Next month'], [29030400, 'months', 2419200], [58060800, 'a year ago', 'Next year'], [2903040000, 'years', 29030400]];
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

     var i = 0,
         format;

     while (format = timeFormats[i++]) {
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
   const debounce = function (func, wait, immediate) {
     var timeout;
     return function () {
       var context = this,
           args = arguments;

       var later = function () {
         timeout = null;
         if (!immediate) func.apply(context, args);
       };

       var callNow = immediate && !timeout;
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
       if (callNow) func.apply(context, args);
     };
   };
   const toAbsoluteServerURL = function (path) {
     var startsWithProtocol = path.indexOf('http') === 0;
     var url = startsWithProtocol ? path : window.CONFIG.serverUrl + '/' + path; // Replace extra forward slashes but not in protocol.

     return url.replace(/([^:])\/+/g, '$1/');
   };

   var Utils = /*#__PURE__*/Object.freeze({
      __proto__: null,
      mergeObjects: mergeObjects,
      leadZero: leadZero,
      numberFilter: numberFilter,
      switchPercents: switchPercents,
      playSound: playSound,
      timeAgo: timeAgo,
      debounce: debounce,
      toAbsoluteServerURL: toAbsoluteServerURL
   });

   const CLASS_BIG = '-big-entity';
   const CLASS_SMALL = '-small-entity';
   const CLASS_MICRO = '-micro-entity';
   const GOOGLE_MAP = 'google';
   const YANDEX_MAP = 'yandex';
   const MAPBOX_MAP = 'mapbox';
   const TRANSITIONS = {
     ANIMATED: 'animated',
     ANIMATED_GPU: 'animated_gpu',
     SIMPLE: 'simple' // fastest

   };
   const ITEM_TRANSPARENT = 'transparent';
   const CUSTOM_THEMES = {
     TRANSPARENT: 'transparent',
     MATERIAL: 'material',
     WIN95: 'win95',
     WINPHONE: 'winphone',
     MOBILE: 'mobile',
     COMPACT: 'compact',
     HOMEKIT: 'homekit',
     FRESH_AIR: 'fresh-air',
     WHITE_PAPER: 'white-paper'
   };
   const TYPES = {
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
     POPUP: 'popup',
     DIMMER_SWITCH: 'dimmer_switch',
     GAUGE: 'gauge',
     IMAGE: 'image',
     HISTORY: 'history'
   };
   const HEADER_ITEMS = {
     TIME: 'time',
     DATE: 'date',
     DATETIME: 'datetime',
     WEATHER: 'weather',
     CUSTOM_HTML: 'custom_html'
   };
   const SCREENSAVER_ITEMS = HEADER_ITEMS;
   const FEATURES = {
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
   const MENU_POSITIONS = {
     LEFT: 'left',
     BOTTOM: 'bottom'
   };
   const GROUP_ALIGNS = {
     VERTICALLY: 'vertically',
     HORIZONTALLY: 'horizontally'
   };
   const NOTIES_POSITIONS = {
     LEFT: 'left',
     RIGHT: 'right'
   };
   const ENTITY_SIZES = {
     SMALL: 'small',
     NORMAL: 'normal',
     BIG: 'big'
   };
   const TOKEN_CACHE_KEY = '_tkn1';
   const DEFAULT_HEADER = {
     styles: {
       padding: '30px 130px 0',
       fontSize: '28px'
     },
     left: [{
       type: HEADER_ITEMS.DATETIME,
       dateFormat: 'EEEE, LLLL dd',
       // https://docs.angularjs.org/api/ng/filter/date
       styles: {
         margin: '0'
       }
     }],
     right: [{
       type: HEADER_ITEMS.CUSTOM_HTML,
       html: 'Welcome to the <b>TileBoard</b>',
       styles: {
         margin: '40px 0 0'
       }
     }
     /* {
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
   const MINIMAL_CHART_OPTIONS = {
     layout: {
       padding: {
         left: 0
       }
     },
     elements: {
       line: {
         fill: false,
         borderWidth: 3,
         stepped: false,
         cubicInterpolationMode: 'monotone'
       }
     },
     legend: {
       display: false
     },
     scales: {
       xAxes: [{
         display: false
       }],
       yAxes: [{
         display: true,
         ticks: {
           mirror: true,
           callback: function (value, index, values) {
             if (index === values.length - 1 || index === 0) {
               return value;
             }

             return null;
           }
         }
       }]
     },
     tooltips: {
       callbacks: {
         title: function (tooltipItem, data) {
           return timeAgo(tooltipItem[0].label);
         },
         label: function (tooltipItem, data) {
           return tooltipItem.value;
         }
       }
     }
   };

   var Constants = /*#__PURE__*/Object.freeze({
      __proto__: null,
      CLASS_BIG: CLASS_BIG,
      CLASS_SMALL: CLASS_SMALL,
      CLASS_MICRO: CLASS_MICRO,
      GOOGLE_MAP: GOOGLE_MAP,
      YANDEX_MAP: YANDEX_MAP,
      MAPBOX_MAP: MAPBOX_MAP,
      TRANSITIONS: TRANSITIONS,
      ITEM_TRANSPARENT: ITEM_TRANSPARENT,
      CUSTOM_THEMES: CUSTOM_THEMES,
      TYPES: TYPES,
      HEADER_ITEMS: HEADER_ITEMS,
      SCREENSAVER_ITEMS: SCREENSAVER_ITEMS,
      FEATURES: FEATURES,
      MENU_POSITIONS: MENU_POSITIONS,
      GROUP_ALIGNS: GROUP_ALIGNS,
      NOTIES_POSITIONS: NOTIES_POSITIONS,
      ENTITY_SIZES: ENTITY_SIZES,
      TOKEN_CACHE_KEY: TOKEN_CACHE_KEY,
      DEFAULT_HEADER: DEFAULT_HEADER,
      MINIMAL_CHART_OPTIONS: MINIMAL_CHART_OPTIONS
   });

   var Noty = function () {
     var updatesListeners = [];
     var updatesFired = false;

     var Noty = function (data) {
       this.setData(data);
     };

     Noty.prototype.setData = function (data) {
       this.id = data.id || Math.random();
       this.title = data.title;
       this.message = data.message;
       this.icon = data.icon;
       this.lifetime = data.lifetime;
       this.type = data.type || Noty.INFO;
       this._timeout = null;
       this.resetTimeout();
       var self = this;
       setTimeout(function () {
         self.showed = true;
         Noty.fireUpdate();
       }, 100);
       Noty.fireUpdate();
     };

     Noty.prototype.resetTimeout = function () {
       var self = this;
       this.clearTimeout();

       if (this.lifetime) {
         this._timeout = setTimeout(function () {
           Noty.remove(self);
           Noty.fireUpdate();
         }, this.lifetime * 1000);
       }
     };

     Noty.prototype.getClasses = function () {
       if (!this._classes) {
         this._classes = [];
       }

       this._classes.length = 0;

       this._classes.push('-' + this.type);

       if (this.showed) this._classes.push('-showed');
       return this._classes;
     };

     Noty.prototype.getLifetimeStyles = function () {
       if (!this._lifetimeStyles) {
         this._lifetimeStyles = {};

         if (this.lifetime) {
           this._lifetimeStyles.animationDuration = this.lifetime + 's';
         }
       }

       return this._lifetimeStyles;
     };

     Noty.prototype.clearTimeout = function () {
       if (this._timeout) clearTimeout(this._timeout);
     };

     Noty.prototype.remove = function () {
       Noty.remove(this);
     };

     Noty.noties = [];
     Noty.notiesHistory = [];
     Noty.INFO = 'info';
     Noty.WARNING = 'warning';
     Noty.ERROR = 'error';
     Noty.SUCCESS = 'success';

     Noty.onUpdate = function (callback) {
       if (updatesListeners.indexOf(callback) !== -1) {
         return function () {};
       }

       updatesListeners.push(callback);
       return function () {
         updatesListeners = updatesListeners.filter(function (a) {
           return a !== callback;
         });
       };
     };

     Noty.fireUpdate = function () {
       if (updatesFired) return;
       updatesFired = true;
       updatesListeners.forEach(function (callback) {
         try {
           setTimeout(function () {
             updatesFired = false;
             callback();
           }, 0);
         } catch (e) {// ignore
         }
       });
       setTimeout(function () {
         updatesFired = false;
       }, 0);
     };

     Noty.add = function (type, title, message, icon, lifetime, id) {
       return Noty.addObject({
         type: type,
         title: title,
         message: message,
         icon: icon,
         lifetime: lifetime,
         id: id
       });
     };

     Noty.addObject = function (data) {
       if (data.id && Noty.getById(data.id)) {
         var oldNoty = Noty.getById(data.id);
         oldNoty.setData(data);
         return oldNoty;
       }

       var noty = new Noty(data);
       Noty.noties.push(noty);
       Noty.notiesHistory.push(noty);
       return noty;
     };

     Noty.getById = function (id) {
       for (var i = 0; i < Noty.noties.length; i++) {
         if (Noty.noties[i].id === id) {
           return Noty.noties[i];
         }
       }

       return null;
     };

     Noty.hasSeenNoteId = function (id) {
       for (var i = 0; i < Noty.notiesHistory.length; i++) {
         if (Noty.notiesHistory[i].id === id) {
           return true;
         }
       }

       return false;
     };

     Noty.remove = function (noty) {
       Noty.noties = Noty.noties.filter(function (n) {
         return n !== noty;
       });
     };

     Noty.removeAll = function () {
       Noty.noties = [];
     };

     return Noty;
   }();

   for (const key in Constants) {
     window[key] = Constants[key];
   }

   for (const key in Utils) {
     window[key] = Utils[key];
   } // @ts-ignore


   window.Noty = Noty; // Set up global error handler.

   window.onerror = function (error, file, line, char) {
     var text = [error, 'File: ' + file, 'Line: ' + line + ':' + char].join('<br>');
     Noty.addObject({
       type: Noty.ERROR,
       title: 'JS error',
       message: text,
       lifetime: 12,
       id: error
     });
   };

}());
