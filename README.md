# TileBoard

This is a simple yet highly customizable dashboard for Home Assistant. The main goal of this project was to create simple dashboard with an easy way to edit and add functionality with minimum knowledge of javascript and html.
Should you have any ideas or questions please post them on home-assistant forum or create an issue on github.

## Links

* https://community.home-assistant.io/t/new-dashboard-for-ha/57173
* https://youtu.be/L8JwzWNAPr8
* https://t.me/joinchat/CFM1kQ1ZSNL0T9RB9VwK5w


## Screenshots

![screen](https://community-home-assistant-assets.s3-us-west-2.amazonaws.com/optimized/3X/b/b/bb15cc5c10e22940698bbb7058d6ed732bb0017a_1_690x388.png)
![screen2](https://community-home-assistant-assets.s3-us-west-2.amazonaws.com/optimized/3X/1/f/1f9a1d7962f0a1335a2d06f352cb329f9d9444a5_1_690x388.png)


## How to use
* Pull/download repository
* Change `config.js`
* Open index.html directly in a web browser or move all of the files into www directory in HA's config path. Please note that dashboard was designed for local installations and you should never store dashboard files in www directory of HA if you are exposing it to the outside world since this would reveal content of `config.js` along with the password. As an alternative please consider serving files via Nginx where BasicAuth can be implemented.

## Configure

`config.js` will initialize a global CONFIG object with following fields:

```js
var CONFIG = {
      /* customTheme: specify a custom theme for your dashboard
       * Valid options: null, 'transparent', 'win95', or a custom theme you have created
       * Default: null
       */
      customTheme: null,

      /* transition: The transition effect used between Pages
       * Valid options: 'animated', 'animated_gpu', 'simple'
       */
      transition: 'animated',

      /* tileSize: The default size (in pixels) of a tile */
      tileSize: Number,

      /* tileMargin: The default margin (in pixels) between tiles */
      tileMargin: Number,

      /* groupMarginCss: CSS margin statement to override the default margin for groups */
      groupMarginCss: '20px 40px',

      /* serverUrl: The URL to your HomeAssistant server */
      serverUrl: 'http://localhost:8123',

      /* wsUrl: The URL to your HomeAssistant Websocket connection.
       * If HomeAssistant is behind SSL, replace ws:// with wss://
       */
      wsUrl: 'ws://localhost:8123/api/websocket',

      /* passwordType:
       * MANUAL - allows you to put the password directly to the config file, as it's shown below
       * PROMPT - will ask your password every time you open TileBoard in the browser.
       * PROMPT_SAVING - same as PROMPT but with saving the password after first connection
       * Note: if you used PROMPT_SAVING and changed your password, you will be needed to clear your localStorage
       */
      passwordType: PASSWORD_TYPES.MANUAL,

      /* password: Your HomeAssistant api_password
       * NOTE: If TileBoard is accessible to the outside world, people can
       * read this file and retrieve your password. TileBoard should be placed behind
       * another form of authentication if it is publically accessible.
       * Necessary only with MANUAL password type
       */
      password: null,

      /* debug: Used for development */
      debug: false,

      /* timeFormat: 12 for AM/PM marker, 24 for 24 hour time (default) */
      timeFormat: Number,

      /* pages: A list of page objects. See documentation on Pages below */
      pages: [],

      /* events: A list of events. See documentation on Events below */
      events:  [],
   }
```

### Pages

Page object can have following fields:

```js
{
  /* title: The page title (not currently used) */
  title: 'Page title',

  /* bg: Link to the background image */
  bg: 'images/bg1.jpg',

  /* icon: Page icon for the side menu */
  icon: 'mdi-home-outline', // icon of page (for the side menu)

  /* head: import a page template as a header
   * (used to show the clock in the example configuration)
   */
  head: 'head.html',

  /* tileSize: Override the global tileSize value for the current page
     (optional)
   */
  tileSize: Number,

  /* groupMarginCss: Override global groupMarginCss for the current page
   * (optional)
   */
  groupMarginCss: '20px 40px',

  /* groups: A list of tile groups. See documentation on Tile Groups below */
  groups: [] // list of tile groups
}
```

### Tile Groups

We divide tiles (cells) into groups on every page. Group object can have following fields:

```js
{
  /* title: Title to display above the group */
  title: 'Group title',

  /* width: Number of tiles horizontally */
  width: 3,

  /* height: Number of tiles vertically */
  height: 4,

  /* groupMarginCss: Override default margin of tiles for the current group
   * (optional)
   */
  groupMarginCss: '20px 40px',

  /* items: A list of Tile objects. See documentation on Tiles below */
  items: [],
}

```

### Tiles

Tile Object. [Click here for some real life examples](TILE_EXAMPLES.md)

```js
{
  /* position: The x,y position of the tile inside the group */
  position: [1, 0],

  /* type: The type of a tile. Valid types are listed below */
  type: TYPES.DEVICE_TRACKER,

  /* id: The entity_id of the device from HomeAssistant (e.g. switch.xyz or light.family_room) */
  id: 'device_tracker.google_maps_228',

  // OPTIONAL
  /* title: Title for the entity. It will use the friendly_name from HomeAssistant if not specified
   * (optional)
   */
  title: 'Tile title',

  /* subtitle: A subtitle to display on the tile
   * (optional)
   */
  subtitle: 'Tile subtitle', // subtitle

  /* width: How many tiles wide this tile should be
   * (optional) (default=1)
   */
  width: 2,

  /* height: How many tiles tall this tile should be
   * (optional) (default=1)
   */
  height: 2,

  /* states: Map a state from HomeAssistant to a different value for TileBoard to display.
   * (optional)
   */
  states: {on: 'Enabled', off: 'Disabled'}, // Object example
  states: function (item, entity) {return entity.state}, // Function example

  /* state: Set a custom state for the tile.
   * (optional)
   */
  state: 'Working', // String example
  state: function (item, entity) {return entity.state}, // Function example
  state: false, // Set to false to disable state

  /* icons: Set the icon for a tile
   * You can use any of the material design icons from https://materialdesignicons.com/
   * as long as they have been published in the [latest npm package](https://github.com/templarian/materialdesign-svg).
   * Use an object or function to map states to icons
   */
  icons: {on: "mdi-volume-high", off: "mdi-volume-off"}, // Object example
  icons: function (item, entity) {return entity.attributes.icon}, // Function example

  /* icon: Set a static icon for a tile
   * You can use any of the material design icons from https://materialdesignicons.com/
   * as long as they have been published in the [latest npm package](https://github.com/templarian/materialdesign-svg).
   */
  icon: 'mdi-phone'

  /* bg: Link to a background image for the tile
   * @ and & prefixes are explained below
   */
  bg: '@attributes.entity_picture',

  /* bgSuffix: Same as bg, but with the serverUrl included */
  bgSuffix: '@attributes.entity_picture',

  /* bgOpacity: A decimal between 0 and 1 for the background opacity */
  bgOpacity: 0.5,

  /* theme: Override default theme for the tile */
  theme: TYPES.SWITCH,

  /* classes: A list of classes to be appended to the tile element
   * Useful for custom CSS styles
   */
  classes: ["-big-entity"],

  /* slides: A list of slide images to use for the background
   * Currently a maximum of 3 slides are supported
   * (optional)
   */
  slides: [{}, {bg: 'images/slide.jpg'}],

  /*** TILE SPECIFIC SETTINGS ***/

  /** type: SENSOR **/
  /* value: Override sensor value */
  value: '&sensor.bathroom_temp.state',

  /* unit: Override default unit of measurement */
  unit: 'kWh',

  /* filter: Function for filtering/formatting the entity value */
  filter: function (value) {return value},

  /** type: DEVICE_TRACKER **/
  /* slidesDelay: Delay before slide animation starts */
  slidesDelay: 2,

  /* map: Map provider for showing position inside tile
   * Valid options: 'google', 'yandex'
   */
  map: 'google',

  /** type: TEXT_LIST **/
  /* list: List of objects with a title, icon, and value */
  list: [{title: 'Kitchen temp', icon: 'mdi-home', value: '&sensor.kitchen_temp.state'}],

  /** type: MEDIA_PLAYER **/
  /* showSource: Whether the source selector should be displayed
   * Value options: true, false
   */
  showSource: false,

  /** type: SLIDER **/
  /* filter: Function for filtering/formatting the value */
  filter: function (value) {return value},

  /* button: Puts slider at the bottom
   * Valid options: true, false
   */
  bottom: true,

  /* slider: Object with slider config. See slider documentation below */
  slider: {}

  /** type: CAMERA or CAMERA_THUMBNAIL **/
  /* bgSize: CSS background-size property */
   bgSize: 'cover',

   /* filter: Function for filtering/formatting the camera URL */
   filter: function (url) {return url},

   /* fullscreen: object of type CAMERA or CAMERA_THUMBNAIL to show it in fullscreen */
   fullscreen: {},

   /* refresh: Number in milliseconds (or function returning a time) to set the
    * interval for refreshing the camera image
    */
   refresh: Number || Function,

   /** type: LIGHT **/
   /* sliders: list of slider object. See slider documentation below */
   sliders: [{}],

   /** type: WEATHER **/
   /* fields: Object mapping available fields and their values.
    * Full documentation on fields is below
    */
   fields: {},

   /* classes: Additional CSS classes. Use 'compact' for a compact (1x1) tile
    * (optional)
    */
   classes: ['-compact'],

}
```

Every anonymous function will call with context `{states: {}, $scope: {}}`

At the moment following entity types have been implemented:

```js
var TYPES = {
   DEVICE_TRACKER: 'device_tracker',
   SCRIPT: 'script',
   SENSOR: 'sensor',
   SENSOR_ICON: 'sensor_icon',
   SWITCH: 'switch',
   LOCK: 'lock',
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
};
```

Example of slider config used for LIGHT:

```js
{
   title: "Color temp",
   field: "color_temp",
   max: 588,
   min: 153,
   step: 15,
   request: {
      type: "call_service",
      domain: "light",
      service: "turn_on",
      field: "color_temp"
   }
}
```

Supported weather fields
```js
{
   icon: '&sensor.dark_sky_icon.state',
   iconMap: {'clear-day': 'clear', ...}, // statusKey: iconName (from images/weather-icons)
   //iconMap: function (icon, item, entity) {return icon}, // or use function
   summary: '&sensor.dark_sky_summary.state',
   apparentTemperature: '&sensor.dark_sky_apparent_temperature.state',
   apparentTemperatureUnit: '&sensor.dark_sky_apparent_temperature.attributes.unit_of_measurement',
   temperature: '&sensor.dark_sky_temperature.state',
   temperatureUnit: '&sensor.dark_sky_temperature.attributes.unit_of_measurement',
   precip: '&sensor.dark_sky_precip.state',
   precipIntensity: '&sensor.dark_sky_precip_intensity.state',
   precipIntensityUnit: '&sensor.dark_sky_precip_intensity.attributes.unit_of_measurement',
   precipProbability: '&sensor.dark_sky_precip_probability.state',
   precipProbabilityUnit: '&sensor.dark_sky_precip_probability.attributes.unit_of_measurement',
   windSpeed: '&sensor.dark_sky_wind_speed.state',
   windSpeedUnit: '&sensor.dark_sky_wind_speed.attributes.unit_of_measurement',
   humidity: '&sensor.dark_sky_humidity.state',
   humidityUnit: '&sensor.dark_sky_humidity.attributes.unit_of_measurement',
   pollen: '&sensor.pollen_count.state',
   pressure: '&sensor.dark_sky_pressure.state',
   pressureUnit: '&sensor.dark_sky_pressure.attributes.unit_of_measurement',
}

```

### @/& Prefixes
As you may notice that we use @/& prefixes to get a value inside objects (entities).
@ is relative to the current entity (@attributes.friendly_name) and & is for global (&sensor.kitchen_temp.state). This may not work everywhere, but you may give it a go.

### Events

Events are fired when dashboard receives new state of the entity.
Firing event will cause the same action as the clicking on tile.
Useful for Door-entry systems etc.

```js
[
   {
      trigger: 'script.front_gate_bell_trigger',
      state: 'off',
      tile: { // invisible
         type: TYPES.DOOR_ENTRY,
         id: 'camera.front_door',
         layout: {
            camera: {...}, // camera layout
            page: {},
            tiles: []
         }
      }
   }
]
```

## Custom CSS Styles
A number of classes are added to each tile depending on the type of tile and state. Custom CSS styles can be applied by creating a `custom.css` file in the `styles` directory.

## TODO
Where do I even begin?

## Contribution
Please feel free to post an issue or pull request and we will sort it out

## License
MIT License
