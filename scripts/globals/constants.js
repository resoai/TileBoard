import { timeAgo } from './utils';

export const CLASS_BIG = '-big-entity';
export const CLASS_SMALL = '-small-entity';
export const CLASS_MICRO = '-micro-entity';

export const GOOGLE_MAP = 'google';
export const YANDEX_MAP = 'yandex';
export const MAPBOX_MAP = 'mapbox';

export const TRANSITIONS = {
   ANIMATED: 'animated',
   ANIMATED_GPU: 'animated_gpu',
   SIMPLE: 'simple', // fastest
};

export const ITEM_TRANSPARENT = 'transparent';

export const CUSTOM_THEMES = {
   TRANSPARENT: 'transparent',
   MATERIAL: 'material',
   WIN95: 'win95',
   WINPHONE: 'winphone',
   MOBILE: 'mobile',
   COMPACT: 'compact',
   HOMEKIT: 'homekit',
   FRESH_AIR: 'fresh-air',
   WHITE_PAPER: 'white-paper',
};

export const TYPES = {
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
   HISTORY: 'history',
};

export const HEADER_ITEMS = {
   TIME: 'time',
   DATE: 'date',
   DATETIME: 'datetime',
   WEATHER: 'weather',
   CUSTOM_HTML: 'custom_html',
};

export const SCREENSAVER_ITEMS = HEADER_ITEMS;

export const FEATURES = {
   LIGHT: {
      BRIGHTNESS: 1,
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
      STOP: 4096,
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
      START: 8192,
   },
};

export const MENU_POSITIONS = {
   LEFT: 'left',
   BOTTOM: 'bottom',
};

export const GROUP_ALIGNS = {
   VERTICALLY: 'vertically',
   HORIZONTALLY: 'horizontally',
};

export const NOTIES_POSITIONS = {
   LEFT: 'left',
   RIGHT: 'right',
};

export const ENTITY_SIZES = {
   SMALL: 'small',
   NORMAL: 'normal',
   BIG: 'big',
};

export const TOKEN_CACHE_KEY = '_tkn1';

export const DEFAULT_HEADER = {
   styles: {
      padding: '30px 130px 0',
      fontSize: '28px',
   },
   left: [
      {
         type: HEADER_ITEMS.DATETIME,
         dateFormat: 'EEEE, LLLL dd', // https://docs.angularjs.org/api/ng/filter/date
         styles: {
            margin: '0',
         },
      },
   ],
   right: [
      {
         type: HEADER_ITEMS.CUSTOM_HTML,
         html: 'Welcome to the <b>TileBoard</b>',
         styles: {
            margin: '40px 0 0',
         },
      },
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
   ],
};

export const MINIMAL_CHART_OPTIONS = {
   layout: {
      padding: {
         left: 0,
      },
   },
   elements: { line: {
      fill: false,
      borderWidth: 3,
      stepped: false,
      cubicInterpolationMode: 'monotone',
   } },
   legend: { display: false },
   scales: {
      xAxes: [{
         display: false,
      }],
      yAxes: [{
         display: true,
         ticks: {
            mirror: true,
            callback: function(value, index, values) {
               if (index === values.length - 1 || index === 0) {
                  return value;
               }
               return null;
            },
         },
      }],
   },
   tooltips: {
      callbacks: {
         title: function(tooltipItem, data) {
            return timeAgo(tooltipItem[0].label);
         },
         label: function(tooltipItem, data) {
            return tooltipItem.value;
         },
      },
   },
};
