/*
This is an example configuration file.

COPY OR RENAME THIS FILE TO config.js.

Make sure you use real IDs from your HA entities.
*/

function formatDate ( ts ) {
	
	var date = new Date( ts );
	var year = date.getFullYear();
	var month = ( "0" + ( date.getMonth () + 1 ) ).substr ( -2 );
	var day = ( "0" + date.getDate () ).substr ( -2 );
	var hour =  ( "0" + date.getHours () ).substr ( -2 );
	var minutes = ( "0" + date.getMinutes () ).substr ( -2 );
	//var seconds = ( "0" + date.getSeconds () ).substr ( -2 );

	return day + "." + month + "." + year + " - " + hour + ":" + minutes + " Uhr";
	  
}

var weather_condition_map = {
	"clear-night": "klar",
	"clear-night": "klar",
	"cloudy": "wolkig",
	"fog": "Nebel",
	"hail": "Hagel",
	"lightning": "Blitzschlag",
	"lightning-rainy": "Gewitter",
	"partlycloudy": "teilweise bewölkt",
	"pouring": "Wolkenbruch",
	"rainy": "Regen",
	"snowy": "Schneefall",
	"snowy-rainy": "Schneeregen",
	"sunny": "sonnig",
	"windy": "windig",
	"windy-variant": "stürmisch",
};

var weather_icon_map = {
	// from home-assistant https://www.home-assistant.io/components/weather/
	'clear-night': 'nt-clear',
	'cloudy': 'cloudy',
	'fog': 'fog',
	'hail': 'chanceflurries',
	'lightning': 'chancetstorms',
	'lightning-rainy': 'chancerain',
	'partlycloudy': 'partlycloudy',
	'pouring': 'rain',
	'rainy': 'sleet',
	'snowy': 'snow',
	'snowy-rainy': 'sleet',
	'sunny': 'clear',
	'windy': 'hazy',
	'windy-variant': 'flurries',
};

var CONFIG = {
	
	customTheme: null, // CUSTOM_THEMES.TRANSPARENT, CUSTOM_THEMES.MATERIAL, CUSTOM_THEMES.MOBILE, CUSTOM_THEMES.COMPACT, CUSTOM_THEMES.HOMEKIT, CUSTOM_THEMES.WINPHONE, CUSTOM_THEMES.WIN95
	transition: TRANSITIONS.ANIMATED_GPU, //ANIMATED_GPU, ANIMATED or SIMPLE (better perfomance)
	entitySize: ENTITY_SIZES.NORMAL, //SMALL, NORMAL, BIG are available
	tileSize: 145,
	tileMargin: 6,
	serverUrl: "http://" + location.hostname + ":8123",
	wsUrl: "ws://" + location.hostname + ":8123/api/websocket",
	authToken: null, // optional long-lived token (CAUTION: only if TileBoard is not exposed to the internet)
	//googleApiKey: "XXXXXXXXXX", // Required if you are using Google Maps for device tracker
	//mapboxToken: "XXXXXXXXXX", // Required if you are using Mapbox for device tracker
	debug: false, // Prints entities and state change info to the console.
	pingConnection: true, //ping connection to prevent silent disconnections

	// next fields are optional
	events: [],
	timeFormat: 24,
	menuPosition: MENU_POSITIONS.LEFT, // LEFT or BOTTOM
	hideScrollbar: true, // horizontal scrollbar
	groupsAlign: GROUP_ALIGNS.HORIZONTALLY, // or VERTICALLY

	header: { // https://github.com/resoai/TileBoard/wiki/Header-configuration
		styles: {
			padding: '5px 40px 0',
			fontSize: '22px'
		},
		right: [],
		left: [
			{
				type: HEADER_ITEMS.DATETIME,
				dateFormat: 'EEEE, dd. LLLL yyyy', //https://docs.angularjs.org/api/ng/filter/date
			}
		]
	},

	/*screensaver: {// optional. https://github.com/resoai/TileBoard/wiki/Screensaver-configuration
	timeout: 300, // after 5 mins of inactive
	slidesTimeout: 10, // 10s for one slide
	styles: { fontSize: '40px' },
	leftBottom: [{ type: SCREENSAVER_ITEMS.DATETIME }], // put datetime to the left-bottom of screensaver
	slides: [
	{ bg: 'images/bg1.jpeg' },
	{
	bg: 'images/bg2.png',
	rightTop: [ // put text to the 2nd slide
	{
	type: SCREENSAVER_ITEMS.CUSTOM_HTML,
	html: 'Welcome to the <b>TileBoard</b>',
	styles: { fontSize: '40px' }
	}
	]
	},
	{ bg: 'images/bg3.jpg' }
	]
	},*/

	pages: [
		{
			hidden: false,
			//title: 'Main page',
			bg: 'images/bg1.jpeg',
			icon: 'mdi-home-outline', // home icon
			styles: {
				padding: '5px 0px'
			},
			groups: [
				{
					//title: '',
					width: 4,
					height: 2,
					items: [
						{
							position: [0, 0],
							height: 2,
							//classes: ['-compact'],
							type: TYPES.WEATHER,
							title: 'Wetter',
							id: 'weather.openweathermap',
							states: weather_condition_map,
							icon: '&weather.openweathermap.state',
							icons: weather_icon_map,
							fields: {
								summary: '&sensor.owm_condition.state',
								temperature: '&sensor.owm_temperature.state',
								temperatureUnit: '&sensor.owm_temperature.attributes.unit_of_measurement',
								humidity: '&sensor.owm_humidity.state',
								humidityUnit: '&sensor.owm_humidity.attributes.unit_of_measurement',
								windSpeed: '&sensor.owm_wind_speed.state',
								windSpeedUnit: 'kmh',								
								list: [
									'Luftdruck '
									+ '&sensor.owm_pressure.state'
									+ '&sensor.owm_pressure.attributes.unit_of_measurement'
									// + '&sensor.owm_condition.state',
									// 'code '
									// + '&sensor.owm_weather_code.state',
								]
							}
						},
						{
							position: [1, 0],
							type: TYPES.SENSOR,
							title: 'Außentemperatur',
							id: 'sensor.dht22_terrace_temperature',
							unit: '°C',
							state: false
						},
						{
							position: [2, 0],
							type: TYPES.COVER,
							title: 'Garagentor',
							id: 'cover.relay_garage',
							states: {
								open: 'Offen',
								closed: 'Geschlossen'
							}
						},
						{
							position: [3, 0],
							type: TYPES.LIGHT,
							id: 'light.automatic_indoor_lights',
							title: 'Innenlichter',
							//subtitle: 'indoor',
							states: {
								on: "An",
								off: "Aus"
							},					  
							icons: {
								on: "mdi-lightbulb-on",
								off: "mdi-lightbulb"
							}
						},
						{
							classes: ['sbahn-traffic'],
							position: [1, 1],
							width: 3,
							height: 1,
							title: 'S-Bahn',
							id: {}, // since we are binding each list item to different sensor, so we simply use an empty object
							type: TYPES.TEXT_LIST,
							state: false,
							list: [
								{ value: ' ' },
								{ value: '&sensor.traffic_sbahn_1.state' },
								{ value: ' ' },
								{ value: '&sensor.traffic_sbahn_2.state' }
							]
						}				  
					]
				}
			]
		},
		{
			hidden: false,
			//title: 'Lichter',
			bg: 'images/bg2.png',
			icon: 'mdi-lightbulb',
			styles: {
				padding: '75px 0px'
			},
			groups: [
				{
					title: '',
					width: 4,
					height: 2,
					items: [
						{
							position: [0, 0],
							type: TYPES.LIGHT,
							id: 'light.automatic_indoor_lights',
							title: 'Innenlichter',
							subtitle: 'indoor',
							states: {
								on: "An",
								off: "Aus"
							},					  
							icons: {
								on: "mdi-lightbulb-on",
								off: "mdi-lightbulb"
							}
						},
						{
							position: [0, 1],
							type: TYPES.LIGHT,
							id: 'light.automatic_outdoor_lights',
							title: 'Außenlichter',
							subtitle: 'outdoor',
							states: {
								on: "An",
								off: "Aus"
							},					  
							icons: {
								on: "mdi-lightbulb-on",
								off: "mdi-lightbulb"
							}
						},
						{
							position: [1, 0],
							type: TYPES.LIGHT,
							id: 'light.sonoff_kitchen_led',
							title: 'Arbeitslicht',
							subtitle: 'Küche',
							states: {
								on: "On",
								off: "Off"
							},
							icons: {
								on: "mdi-lightbulb-on",
								off: "mdi-lightbulb",
							},
							sliders: [
								{
									title: 'Brightness',
									field: 'brightness',
									max: 255,
									min: 0,
									step: 5,
									request: {
										type: "call_service",
										domain: "light",
										service: "turn_on",
										field: "brightness"
									}
								},
								{
									title: 'Color temp',
									field: 'color_temp',
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
							],
							colorpicker: true
						},
						{
							position: [3, 0],
							type: TYPES.SWITCH,
							id: 'switch.sonoff_k8200_socket',
							title: 'K8200',
							subtitle: 'Wohnzimmer',
							states: {
								on: "On",
								off: "Off"
							},
							icons: {
								on: "mdi-printer-3d",
								off: "mdi-printer-3d",
							}
						},
						{
							position: [3, 1],
							type: TYPES.INPUT_BOOLEAN,
							id: 'input_boolean.light_simulation',
							title: 'Lichtsimulation',
							subtitle: 'Einstellung',
							states: {
								on: "On",
								off: "Off"
							},
							icons: {
								on: "mdi-dip-switch",
								off: "mdi-dip-switch",
							}
						},
					]
				},
			]
		},
		{
			hidden: false,
			// title: 'Wettervorhersage',
			bg: 'images/bg2.png',
			icon: 'mdi-weather-partly-rainy',
			styles: {
				padding: '75px 0px'
			},
			groups: [
				{
					//title: '',
					width: 4,
					height: 2	,
					items: [
						{
							position: [0, 0],
							type: TYPES.WEATHER_LIST,
							width: 4,
							height: 2,
							title: 'Vorschau',
							id: 'weather.openweathermap',
							state: false,
							icons: weather_icon_map,
							hideHeader: false,
							dateTitle: "Zeitpunkt",
							primaryTitle: "Temperatur",
							iconTitle: "Vorhersage",
							//secondaryTitle: 'Bedingung',
							list: ["x", "x", "x", "x", "x", "x", "x", "x"].map ( function ( v, i ) {
									return { 
										date: 		function ( item, entity ) { return formatDate ( entity.attributes.forecast [i].datetime ) }, 
										primary: 	function ( item, entity ) { return entity.attributes.forecast [i].temperature.toFixed ( 1 ) + "°C" }, 
										//secondary: 	function ( item, entity ) { return weather_condition_map [entity.attributes.forecast [i].condition] },
										icon: 		function ( item, entity ) { return entity.attributes.forecast [i].condition },
									};
							}),
						}
					]
				},
			]
		},
		{
			hidden: false,
			//title: 'Brauerei',
			bg: 'images/bg2.png',
			icon: 'mdi-glass-mug',
			styles: {
				padding: '5px 0px'
			},
			groups: [
				{
					//title: '',
					width: 4,
					height: 2,
					items: [
					]
				},
			]
		}
	],
}
