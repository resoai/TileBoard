# TileBoard

This is a simple yet highly customizable dashboard for Home Assistant. The main goal of this project was to create simple dashboard with an easy way to edit and add functionality with minimum knowledge of javascript and html.
Should you have any ideas or questions please post them on home-assistant forum or create an issue on github.

## Links

https://community.home-assistant.io/t/new-dashboard-for-ha/57173


## Screenshots

![screen](https://community-home-assistant-assets.s3-us-west-2.amazonaws.com/optimized/3X/b/b/bb15cc5c10e22940698bbb7058d6ed732bb0017a_1_690x388.png)
![screen2](https://community-home-assistant-assets.s3-us-west-2.amazonaws.com/optimized/3X/1/f/1f9a1d7962f0a1335a2d06f352cb329f9d9444a5_1_690x388.png)


## How to use
* Pull/download repository
* Change `config.js`
* Open index.html directly in a web browser or move all of the files into www directory in HA's config path. Please note that dashboard was designed for local installations and you should never store dashboard files in www directory of HA if you are exposing it to the outside world since this would reveal content of `config.js` along with the password. As an alternative please consider serving files via Nginx where BasicAuth can be implemented. 

## Configure

`config.js` will initialize global CONFIG object with following fields:

```js
var CONFIG = {
      customTheme: null || 'transparent' || 'win95', // you can define it yourself
      transition: 'animated' || 'animated_gpu' || 'simple', // transition between pages
      tileSize: Number, // size of tile
      tileMargin: Number, // margin between tiles
      serverUrl: 'http://localhost:8123', // or custom
      wsUrl: 'ws://localhost:8123/api/websocket',
      password: null, //HA's password (if set)
      debug: false, // mainly used for development, now redundant
      pages: [], // list of Page objects, read about it below
      events:  [], // list of events, more info below
   }
```

### Pages

Page object can have following fields:

```js
{
   title: 'Page title', // not used atm
   bg: 'images/bg1.jpg', // link to the background image (optional)
   icon: 'mdi-home-outline', // icon of page (for the side menu)
   head: 'head.html', // used for importing template as a header of the page (we currently use it to show time)
   tileSize: Number, // optional field to override global value of tile size for current page
   groups: [] // list of tile groups
}
```

### Tile groups

We divide tiles (cells) into groups on every page. Group object can have following fields:

```js
{
   title: 'Group title',
   width: 3, // Number of tiles (horizontally)
   height: 4, // same but verticaly
   items: [], // list of Tile objects 
}

```

### Tiles

Tile Object. [Click here for some feal life examples](TILE_EXAMPLES.md)

```js
{
   position: [1, 0], // [x, y] position inside group
   type: TYPES.DEVICE_TRACKER, // type of a tile, please see the list of available types below
   id: 'device_tracker.google_maps_228', // id of HA entity for the tile (e.g. switch.xyz)
   
   // OPTIONAL
   title: 'Tile title', // overrides default entity title
   subtitle: 'Tile subtitle', // subtitle
   width: 2, // overrides basic Tile size (1)
   height: 2, //
   states: {on: 'Enabled', off: 'Disabled'}, // object of states map, used for mapping of states
   //state: false, // disables state in the Tile
   //sub: String || Function, // custom state of Tile
   icons: {on: "mdi-volume-high", off: "mdi-volume-off"}, // same as states but used for tiles with icons. You can use any of the material design icons from https://materialdesignicons.com/ 
   bg: '@attributes.entity_picture', // link to the background image (available @/& prefixes, read about it below)
   bgSuffix: '@attributes.entity_picture', // same as bg, but link appends to the serverUrl
   bgOpacity: 0.5, // bg image opacity 0..1 
   theme: TYPES.SWITCH, // overrides tile theme
   classes: ["-big-entity"], // appends class name to the tile element, useful for custom CSS styles
   slides: [{}, {bg: 'images/slide.jpg'}], // slides in the background (atm up to 3 slides)
  
   // type: SENSOR and several others
   value: '&sensor.bathroom_temp.state', // overrides sensor value
   unit: 'kWh', // override basic entity unit,
   filter: function (value) {return value}, // function for filtering/formating entity value
   
   //type: DEVICE_TRACKER
   slidesDelay: 2, // delay before slides animation starts
   map: 'google' || 'yandex', // map provider for showing position inside tile
   
   //type: TEXT_LIST,
   list: [{title: 'Kitchen temp', icon: 'mdi-home', value: '&sensor.kitchen_temp.state'}], // list of objects
   
   //type: MEDIA_PLAYER
   showSource: false || true, // show source picker (may not wont work properly atm)
   
   // type: SLIDER
   filter: function (value) {return value}, // same as filter in sensors
   bottom: true, // puts slider to the bottom
   slider: {} // object of slider, read about it below
   
   // type: CAMERA or CAMERA_THUMBNAIL
   bgSize: 'cover' || 'contain' || 'any css bg size',
   filter: function (url) {return url}, // function for filtering camera url
   fullscreen: {}, // object of type CAMERA/CAMERA_THUMBNAIL to show it in fullscreen
   refresh: Number || Function, // number in milliseconds or function returns time, set interval for refreshing image
   
   // type: LIGHT
   sliders: [{}], // list of slider object (read about it below)
   
   //type: WEATHER
   fields: {}, // object of available weather fields (supported fields are below)
   //classes: ['-compact'], // we also support -compact class for the WEATHER
  
}
```


At the moment following entity types have been implemented:

```js
var TYPES = {
   DEVICE_TRACKER: 'device_tracker',
   SCRIPT: 'script',
   SENSOR: 'sensor',
   SENSOR_ICON: 'sensor_icon',
   SWITCH: 'switch',
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

## TODO
Where do I even begin?

## Contribution
Please feel free to post an issue or pull request and we will sort it out

## License
MIT License

