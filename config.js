// This is just an example of config
// most of ids here are replaced with empty objects {}
// please make sure you use real string ids from your HA entities
// you may also rename this file to "override_config.js"
// doing so will not overwrite your config with the new one after updates


var CONFIG = {
   customTheme: null, //CUSTOM_THEMES.TRANSPARENT
   transition: TRANSITIONS.ANIMATED_GPU,
   tileSize: 150,
   tileMargin: 6,
   timeFormat: 24,
   serverUrl: "http://localhost:8123",
   wsUrl: "ws://localhost:8123/api/websocket",
   password: null,
   //googleApiKey: "XXXXXXXXXX", // Required if you are using Google Maps for device tracker
   events: [],
   pages: [
      {
         title: 'Main page',
         bg: 'images/bg1.jpeg',
         icon: 'mdi-home-outline', // home icon
         head: 'head.html', // you might need to comment this out if you have a small screen and header overlaps the tiles
         groups: [
            {
               title: 'First group',
               width: 2,
               height: 3,
               items: [
                  {
                     position: [0, 0],
                     width: 2,
                     type: TYPES.TEXT_LIST,
                     id: {}, // using empty object for an unknown id
                     state: false, // disable state element
                     list: [
                        {
                           title: 'Sun.sun state',
                           icon: 'mdi-weather-sunny',
                           value: '&sun.sun.state'
                        },
                        {
                           title: 'Custom',
                           icon: 'mdi-clock-outline',
                           value: 'value'
                        }
                     ]
                  },
                  {
                     position: [0, 1], // [x, y]
                     width: 1,
                     type: TYPES.SENSOR,
                     id: 'updater.updater',
                     state: '@attributes.release_notes' // custom state
                  }
               ]
            },

            {
               title: 'Second group',
               width: 2,
               height: 3,
               items: [
                  {
                     position: [0, 0],
                     width: 1,
                     type: TYPES.SLIDER,
                     //id: "input_number.volume",
                     id: {state: 50}, // replace it with real string id
                     state: false,
                     title: 'Custom slider',
                     subtitle: 'Example of subtitle',
                     slider: {
                        min: 0,
                        max: 100,
                        step: 2,
                        request: {
                           type: "call_service",
                           domain: "input_number",
                           service: "set_value",
                           field: "value"
                        }
                     }
                  },
                  {
                     position: [1, 0],
                     width: 1,
                     type: TYPES.SWITCH,
                     //id: "switch.lights",
                     id: {state: 'off'}, // replace it with real string id (e.g. "switch.lights")
                     state: false,
                     title: 'Custom switch',
                     icons: {'off': 'mdi-volume-off', 'on': 'mdi-volume-high'}
                  },

               ]
            },

            {
               title: '',
               width: 1,
               height: 3,
               items: [
                  {
                     // please read README.md for more information
                     // this is just an example
                     position: [0, 0],
                     height: 2, // 1 for compact
                     //classes: ['-compact'],
                     type: TYPES.WEATHER,
                     id: {},
                     state: function () {return 'Sunny'},
                     fields: {
                        icon: 'clear-day',
                        iconMap: { 'clear-day': 'clear'},
                        summary: 'Sunny',
                        apparentTemperature: '15',
                        apparentTemperatureUnit: 'C',
                        temperature: '18',
                        temperatureUnit: 'C',
                        //precip: '&sensor.dark_sky_precip_1.state',
                        //precipIntensity: '&sensor.dark_sky_precip_intensity_1.state',
                        //precipIntensityUnit: '&sensor.dark_sky_precip_intensity_1.attributes.unit_of_measurement',
                        precipProbability: '5',
                        precipProbabilityUnit: '%',
                        windSpeed: '5',
                        windSpeedUnit: 'kmh',
                        humidity: '50',
                        humidityUnit: '%',
                        //pollen: '&sensor.pollen_count_1.state',
                        pressure: '1024',
                        pressureUnit: '', //'&sensor.dark_sky_pressure_1.attributes.unit_of_measurement',
                     }
                  }

               ]
            }
         ]
      },
      {
         title: 'Second page',
         bg: 'images/bg2.png',
         icon: 'mdi-numeric-2-box-outline',
         groups: [
            {
               title: '',
               width: 2,
               height: 3,
               items: [
                  {
                     position: [0, 0],
                     width: 2,
                     title: 'Short instruction',
                     type: TYPES.TEXT_LIST,
                     id: {}, // using empty object for an unknown id
                     state: false, // disable state element
                     list: [
                        {
                           title: 'Read',
                           icon: 'mdi-numeric-1-box-outline',
                           value: 'README.md'
                        },
                        {
                           title: 'Ask on forum',
                           icon: 'mdi-numeric-2-box-outline',
                           value: 'home-assistant.io'
                        },
                        {
                           title: 'Open an issue',
                           icon: 'mdi-numeric-3-box-outline',
                           value: 'github.com'
                        }
                     ]
                  }
               ]
            },
         ]
      }
   ],
}
