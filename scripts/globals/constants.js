import { supportsFeature, timeAgo } from './utils';

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
   ALARM: {
      // https://github.com/home-assistant/core/blob/dev/homeassistant/components/alarm_control_panel/const.py
      ARM_HOME: 1,
      ARM_AWAY: 2,
      ARM_NIGHT: 4,
      TRIGGER: 8,
      ARM_CUSTOM_BYPASS: 16,
   },
   LIGHT: {
      // https://github.com/home-assistant/core/blob/dev/homeassistant/components/light/__init__.py
      BRIGHTNESS: 1,
      COLOR_TEMP: 2,
      EFFECT: 4,
      FLASH: 8,
      COLOR: 16,
      TRANSITION: 32,
      WHITE_VALUE: 128,
      COLOR_MODES_BRIGHTNESS: ['brightness', 'color_temp', 'hs', 'xy', 'rgb', 'rgbw', 'rgbww', 'white'],
      supportsBrightness (entity) {
         const { attributes } = entity;
         let { supported_color_modes: supportedColorModes } = attributes;
         const { supported_features: supportedFeatures } = attributes;

         if (supportedColorModes === undefined) {
            // Backwards compatibility for supported_color_modes added in 2021.4
            supportedColorModes = [];

            if (supportedFeatures & FEATURES.LIGHT.COLOR_TEMP) {
               supportedColorModes.push('color_temp');
            }
            if (supportedFeatures & FEATURES.LIGHT.COLOR) {
               supportedColorModes.push('hs');
            }
            if (supportedFeatures & FEATURES.LIGHT.WHITE_VALUE) {
               supportedColorModes.push('rgbw');
            }
            if (supportedFeatures & FEATURES.LIGHT.BRIGHTNESS && supportedColorModes.length === 0) {
               supportedColorModes = ['brightness'];
            }
         }

         return supportedColorModes.some(mode => FEATURES.LIGHT.COLOR_MODES_BRIGHTNESS.includes(mode));
      },
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
   GRID: 'grid',
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
         icon: '&weather.openweathermap.state',
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
            callback (value, index, values) {
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
         title (tooltipItem, data) {
            const { datasetIndex, index } = tooltipItem[0];
            return timeAgo(data.datasets[datasetIndex].data[index].x);
         },
         label (tooltipItem, data) {
            return tooltipItem.value;
         },
      },
   },
};

export const DEFAULT_SLIDER_OPTIONS = {
   max: 100,
   min: 0,
   step: 1,
   field: 'value',
   request: {
      domain: 'input_number',
      service: 'set_value',
      field: 'value',
   },
};

export const DEFAULT_LIGHT_SLIDER_OPTIONS = {
   max: 255,
   min: 0,
   step: 1,
   field: 'brightness',
   request: {
      domain: 'light',
      service: 'turn_on',
      field: 'brightness',
   },
};

export const DEFAULT_VOLUME_SLIDER_OPTIONS = {
   max: 1.0,
   min: 0.0,
   step: 0.02,
   field: 'volume_level',
   request: {
      domain: 'media_player',
      service: 'volume_set',
      field: 'volume_level',
   },
};

export const DEFAULT_POPUP_HISTORY = (item, entitiy) => ({
   classes: ['-popup-landscape'],
   styles: {},
   items: [{
      type: TYPES.HISTORY,
      id: item.id,
      title: false,
      position: [0, 0],
      action: false,
      secondaryAction: false,
      classes: ['-item-fullsize'],
      customStyles: {
         width: null,
         height: null,
         top: null,
         left: null,
      },
   }],
});

export const DEFAULT_POPUP_IFRAME = (item, entity) => ({
   classes: ['-popup-fullsize'],
   styles: {},
   items: [{
      type: TYPES.IFRAME,
      url: item.url,
      id: {},
      state: false,
      title: false,
      position: [0, 0],
      classes: ['-item-fullsize'],
      customStyles: {
         width: null,
         height: null,
         top: null,
         left: null,
      },
   }],
});

export const DEFAULT_POPUP_DOOR_ENTRY = (item, entity) => ({
   classes: ['-popup-fullsize'],
   styles: {},
   items: [{
      state: false,
      title: false,
      position: [0, 0],
      action: false,
      secondaryAction: false,
      classes: ['-item-fullsize', '-item-non-clickable', '-item-transparent'],
      customStyles: {
         width: null,
         height: null,
         top: null,
         left: null,
      },
   }],
});

export const TILE_DEFAULTS = {
   [TYPES.ALARM]: {
      action (item, entity) {
         return this.$scope.openAlarm(item, entity);
      },
   },
   [TYPES.AUTOMATION]: {
      action (item, entity) {
         return this.$scope.triggerAutomation(item, entity);
      },
   },
   [TYPES.CAMERA]: {
      action (item, entity) {
         return this.$scope.openCamera(item, entity);
      },
   },
   [TYPES.CAMERA_STREAM]: {
      action (item, entity) {
         return this.$scope.openCamera(item, entity);
      },
   },
   [TYPES.CLIMATE]: {
      subtitle (item, entity) {
         return item.useHvacMode ? entity.attributes.hvac_action : undefined;
      },
   },
   [TYPES.COVER_TOGGLE]: {
      action (item, entity) {
         return this.$scope.toggleCover(item, entity);
      },
   },
   [TYPES.DIMMER_SWITCH]: {
      action (item, entity) {
         return this.$scope.dimmerToggle(item, entity);
      },
   },
   [TYPES.DOOR_ENTRY]: {
      action (item, entity) {
         return this.$scope.openDoorEntry(item, entity);
      },
   },
   [TYPES.FAN]: {
      action (item, entity) {
         return this.$scope.toggleSwitch(item, entity);
      },
   },
   [TYPES.GAUGE]: {
      settings: {
         backgroundColor: 'rgba(0, 0, 0, 0.1)',
         foregroundColor: 'rgba(0, 150, 136, 1)',
         size (item) {
            return .8 * (window.CONFIG.tileSize * (item.height < item.width ? item.height : item.width));
         },
         duration: 1500,
         thick: 6,
         type: 'full',
         min: 0,
         max: 100,
         cap: 'butt',
         thresholds: {},
      },
   },
   [TYPES.INPUT_BOOLEAN]: {
      action (item, entity) {
         return this.$scope.toggleSwitch(item, entity);
      },
   },
   [TYPES.INPUT_DATETIME]: {
      action (item, entity) {
         return this.$scope.openDatetime(item, entity);
      },
   },
   [TYPES.INPUT_SELECT]: {
      action (item, entity) {
         return this.$scope.toggleSelect(item, entity);
      },
   },
   [TYPES.LIGHT]: {
      colorpicker: (item, entity) => supportsFeature(FEATURES.LIGHT.COLOR, entity),
      action (item, entity) {
         return this.$scope.toggleSwitch(item, entity);
      },
      secondaryAction (item, entity) {
         return this.$scope.openLightSliders(item, entity);
      },
   },
   [TYPES.LOCK]: {
      action (item, entity) {
         return this.$scope.toggleLock(item, entity);
      },
   },
   [TYPES.POPUP]: {
      action (item, entity) {
         return this.$scope.openPopup(item, entity, item.popup);
      },
   },
   [TYPES.POPUP_IFRAME]: {
      action (item, entity) {
         return this.$scope.openPopupIframe(item, entity);
      },
   },
   [TYPES.SCENE]: {
      action (item, entity) {
         return this.$scope.callScene(item, entity);
      },
   },
   [TYPES.SCRIPT]: {
      action (item, entity) {
         return this.$scope.callScript(item, entity);
      },
   },
   [TYPES.SENSOR]: {
      filter (value, item, entity) {
         if (entity?.attributes?.device_class === 'timestamp') {
            return timeAgo(value, false);
         }
         return value;
      },
   },
   [TYPES.SWITCH]: {
      action (item, entity) {
         return this.$scope.toggleSwitch(item, entity);
      },
   },
   [TYPES.VACUUM]: {
      action (item, entity) {
         return this.$scope.toggleVacuum(item, entity);
      },
   },
   [TYPES.WEATHER_LIST]: {
      dateFormat: 'MMM d',
   },
};
