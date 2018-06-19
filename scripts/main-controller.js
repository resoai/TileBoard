App.controller('Main', ['$scope', MainController]);

function MainController ($scope) {
   $scope.pages = CONFIG.pages;
   $scope.TYPES = TYPES;

   $scope.activeSelect = null;
   $scope.ready = false; // ready state

   $scope.errors = []; // list of errors
   $scope.states = {}; // dict of entities key => entity

   $scope.activeCamera = null;
   $scope.activeDoorEntry = null;

   var showedPages = [];

   var doorEntryTimeout = null;
   var bodyClass = null;
   var mainStyles = {};
   var activePage = null;
   var cameraList = null;

   $scope.entityClick = function (page, item, entity) {
      switch (item.type) {
         case TYPES.SWITCH:
         case TYPES.LIGHT:
         case TYPES.INPUT_BOOLEAN: return $scope.toggleSwitch(item, entity);

         case TYPES.SCRIPT: return $scope.callScript(item, entity);

         case TYPES.INPUT_SELECT: return $scope.toggleSelect(item, entity);

         case TYPES.CAMERA:
         case TYPES.CAMERA_THUMBNAIL: return $scope.openCamera(item, entity);

         case TYPES.SCENE: return $scope.callScene(item, entity);

         case TYPES.DOOR_ENTRY: return $scope.openDoorEntry(item, entity);
      }
   };

   $scope.entryLongClick = function ($event, page, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      switch (item.type) {
         case TYPES.LIGHT: return $scope.toggleLightSliders(item, entity);
      }

      return false;
   };

   $scope.getBodyClass = function () {
      if(!bodyClass) {
         bodyClass = [];

         if(CONFIG.customTheme) {
            bodyClass.push('-theme-' + CONFIG.customTheme);
         }
      }

      return bodyClass;
   };

   $scope.getItemEntity = function (item) {
      if(typeof item.id === "object") return item.id;

      return $scope.states[item.id];
   };

   $scope.getEntryCameraEntity = function (itemEntry) {
      var item = itemEntry.layout.camera;

      if(typeof item.id === "object") return item.id;

      return $scope.states[item.id];
   };

   $scope.showPage = function (page) {
      return showedPages.indexOf(page) !== -1;
   };

   $scope.slideMapStyles = function (item, page, obj, zoom, state) {
      var key = 'mapStyles' + zoom + (item.width || '1') + (item.height || '1');

      if(!obj[key]) {
         var width = item.width || 1, height = item.height || 1;
         var tileSize = page.tileSize || CONFIG.tileSize;
         var name = obj.friendly_name || ' ';

         var coords = obj.longitude + ',' + obj.latitude;
         // +80 - hack to hide logo
         var sizes = (tileSize * width) + ',' + ((tileSize * height) + 80);

         var url;

         if(item.map === YANDEX_MAP) {
            var icon = 'round';

            if(state.toLowerCase() === 'home') icon = 'home';
            else if(state.toLowerCase() === 'office') icon = 'work';

            var pt = coords + ',' + icon;

            url = "https://static-maps.yandex.ru/1.x/?lang=en-US&ll="
               + coords + "&z=" + zoom + "&l=map&size=" + sizes + "&pt=" + pt;
         }
         else {
            coords = obj.latitude + ',' + obj.longitude;
            sizes = sizes.replace(',', 'x');

            var label = name[0].toUpperCase();
            var marker = encodeURIComponent("color:gray|label:"+label+"|" + coords);

            url = "https://maps.googleapis.com/maps/api/staticmap?center="
               + coords + "&zoom="+zoom+"&size="+sizes+"x&maptype=roadmap&markers=" + marker;
         }

         obj[key] = {backgroundImage: 'url(' + url + ')'};
      }

      return obj[key];
   };

   $scope.pageStyles = function (page) {
      if(!page.styles) {
         var styles = {};

         if(page.bg) {
            styles.backgroundImage = 'url(' + page.bg + ')';
         }
         else if(page.bgSuffix) {
            styles.backgroundImage = 'url(' + CONFIG.serverUrl + page.bgSuffix + ')';
         }

         page.styles = styles;
      }

      return page.styles;
   };

   $scope.pagesMenuStyles = function (pages) {
      if(!pages.styles) {
         pages.styles = {
            marginTop: -(pages.length * 40) + 'px'
         };
      }

      return pages.styles;
   };

   $scope.trackerBg = function (entity) {
      if(!entity.trackerBg) {
         var styles = {};

         if(entity.attributes.entity_picture) {
            styles.backgroundImage = 'url(' + entity.attributes.entity_picture + ')';
         }

         entity.trackerBg = styles;
      }

      return entity.trackerBg;
   };

   $scope.groupStyles = function (group, page) {
      if(!group.styles) {
         var tileSize = page.tileSize || CONFIG.tileSize;
         var tileMargin = page.tileMargin || CONFIG.tileMargin;

         group.styles = {
            width: tileSize * group.width + tileMargin * (group.width - 1) + 'px',
            height: tileSize * group.height + tileMargin * (group.height - 1) + 'px',
         };
      }

      return group.styles;
   };

   $scope.itemStyles = function (item, page) {
      if(!item.styles) {
         var width = item.width || 1;
         var height = item.height || 1;
         var pos = item.position;
         var tileSize = page.tileSize || CONFIG.tileSize;
         var tileMargin = page.tileMargin || CONFIG.tileMargin;

         var styles = {
            width: tileSize * width + tileMargin * (width - 1) + 'px',
            height: tileSize * height + tileMargin * (height - 1) + 'px',
            left: pos[0] * tileSize + (tileMargin * pos[0]) + 'px',
            top: pos[1] * tileSize + (tileMargin * pos[1]) + 'px',
         };

         item.styles = styles;
      }

      return item.styles;
   };

   $scope.itemBgStyles = function (item, page) {
      if(!item.bgStyles) {
         var bg, styles = {};

         if('bgOpacity' in item) {
            styles.opacity = item.bgOpacity;
         }

         if(item.bg) {
            bg = item.bg;

            if(item.bg[0] === '@') {
               bg = getItemAttr(item, item.bg.slice(1));
            }

            if(bg) styles.backgroundImage = 'url(' + bg + ')';
         }
         else if(item.bgSuffix) {
            bg = item.bgSuffix;

            if(item.bgSuffix[0] === '@') {
               bg = getItemAttr(item, item.bgSuffix.slice(1));
            }

            styles.backgroundImage = 'url(' + CONFIG.serverUrl + bg + ')';
         }

         item.bgStyles = styles;
      }

      return item.bgStyles;
   };

   $scope.itemClasses = function (item) {
      var entity = $scope.getItemEntity(item);

      if(!item._classes) {
         item._classes = [];
      }

      item._classes.length = 0;

      item._classes.push('-' + item.type);
      item._classes.push('-' + escapeClass(entity.state));

      if(item.theme) item._classes.push('-th-' + item.theme);
      else item._classes.push('-th-' + item.type);

      if(item.classes) item.classes.forEach(function (c) { item._classes.push(c); });

      if(item.loading) item._classes.push('-loading');
      if($scope.selectOpened(item)) item._classes.push('-top-entity');

      return item._classes;
   };

   $scope.entityState = function (item, state) {
      if(item.state === false) return null;

      if(!item.states) return state;

      return item.states[state] || state;
   };

   $scope.entityIcon = function (item, state) {
      if(item.icon) return item.icon;

      if(!item.icons) return state;

      return item.icons[state] || state;
   };

   $scope.entityValue = function (item, entity) {
      var value = getEntityValue(item, entity);

      if(item.filter) return item.filter(value);

      return value;
   };

   $scope.climateTarget = function (item, entity) {
      var value = entity.attributes.temperature;

      if(item.filter) return item.filter(value);

      return value;
   };

   $scope.listField = function (field, item, list) {
      if(!list[field]) return "";

      var value = list[field];

      if(value[0] === "&") value = getEntityAttr(value.slice(1));

      if(!value) value = list[field];

      if(item.filter) return item.filter(value, field);

      return value;
   };

   $scope.entitySub = function (item, entity) {
      if(!item.sub) return entity.state;

      if(typeof item.sub === "function") return item.sub(item, entity);

      if(item.sub[0] === "@") return getObjectAttr(entity, item.sub.slice(1));
      if(item.sub[0] === "&") return getEntityAttr(item.sub.slice(1));

      return item.value;
   };

   $scope.getWeatherField = function (field, item, entity) {
      var fields = item.fields;

      if(!fields[field]) return null;

      if(typeof fields[field] === "function") return fields[field](item, entity);

      if(fields[field][0] === "@") return getObjectAttr(entity, fields[field].slice(1));
      if(fields[field][0] === "&") return getEntityAttr(fields[field].slice(1));

      return fields[field];
   };

   $scope.getWeatherIcon = function (item, entity) {
      var icon = $scope.getWeatherField('icon', item, entity);

      if(!icon) return null;

      var map = item.fields.iconMap;

      if(!map) return icon;

      return map[icon] || icon;
   };

   $scope.slidesStyles = function (item, $index) {
      if(!item.slidesStyles) {
         item.slidesStyles = {
            'animation-delay': ((item.slidesDelay || $index* 0.8)) + 's'
         };

         if('bgOpacity' in item) {
            item.slidesStyles.opacity = item.bgOpacity;
         }
      }

      return item.slidesStyles;
   };

   $scope.slideStyles = function (slide) {
      if(!slide.slideStyles) {
         var styles = {};

         if(slide.bg) {
            styles.backgroundImage = 'url(' + slide.bg + ')';
         }

         slide.slideStyles = styles;
      }

      return slide.slideStyles;
   };

   $scope.itemSelectStyles = function (entity, items) {
      if(!entity.itemSelectStyles) {
         var styles = {};

         if(items) {
            styles.marginTop = (-items.length * 17) + 'px';
         }

         entity.itemSelectStyles = styles;
      }

      return entity.itemSelectStyles;
   };

   $scope.getMainStyles = function () {
      return mainStyles;
   };

   $scope.getSliderConf = function (item, entity) {
      if(item._c) return item._c;

      var def = item.slider || {};
      var attrs = entity.attributes || {};

      item._c = {
         max: attrs.max || def.max || 100,
         min: attrs.min || def.min || 0,
         step: attrs.step || def.step || 1,
         value: +entity.state || def.value || 0,
         request: def.request || {
            type: "call_service",
            domain: "input_number",
            service: "set_value",
            field: "value"
         }
      };

      setTimeout(function () {
         item._sliderInited = true;
      }, 50);

      return item._c;
   };

   $scope.getLightSliderConf = function (slider, entity) {
      var key = "_c_" + slider.field;

      if(entity.attributes[key]) return entity.attributes[key];


      var def = slider || {};
      var attrs = entity.attributes;
      var value = +attrs[def.field] || 0;

      entity.attributes[key] = {
         max: def.max || attrs.max || 100,
         min: def.min || attrs.min || 0,
         step: def.step || attrs.step || 1,
         value: value || def.min || attrs.min || 0,
         request: def.request || {
            type: "call_service",
            domain: "input_number",
            service: "set_value",
            field: "value"
         }
      };

      setTimeout(function () {
         entity.attributes._sliderInited = true;
         slider._sliderInited = true;
      }, 100);

      setTimeout(function () {
         entity.attributes._sliderInited = true;
      }, 0);

      return entity.attributes[key];
   };

   $scope.getVolumeConf = function (item, entity) {
      if(entity.attributes._c) return entity.attributes._c;

      var def = {max: 100, min: 0, step: 2};
      var attrs = entity.attributes;
      var value = attrs.volume_level * 100 || 0;

      if(!('volume_level' in attrs)) return false;

      entity.attributes._c = {
         max: attrs.max || def.max || 100,
         min: attrs.min || def.min || 0,
         step: attrs.step || def.step || 1,
         value: value || 0
      };

      setTimeout(function () {
         entity.attributes._sliderInited = true;
      }, 50);

      return entity.attributes._c;
   };

   $scope.getLightSliderValue = function (slider, conf) {
      if(slider.formatValue) return slider.formatValue(conf);

      return conf.value;
   };

   $scope.toggleLightSliders = function (item, entity) {
      if(entity.state !== "on") {
         return $scope.toggleSwitch(item, entity, function () {
            setTimeout(function () {
               if(entity.state === "on") {
                  $scope.toggleLightSliders(item, entity);
                  updateView();
               }
            }, 0);
         })
      }
      else {
         if(!item.controlsEnabled) {
            item.controlsEnabled = true;

            setTimeout(function () {
               item._controlsInited = true;
            }, 50);

            updateView();
         }
      }
   };

   $scope.closeLightSliders = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      item.controlsEnabled = false;
      item._controlsInited = false;

      return false;
   };

   $scope.preventClick = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      return false;
   };


   // actions

   var setSliderValue = debounce(setSliderValueFn, 250);

   function setSliderValueFn (item, entity, value, setState) {
      if(!value.request) return;

      console.log('SET SLIDER', value.request.field, value.value)

      var conf = value.request;
      var serviceData = {entity_id: item.id};

      serviceData[conf.field] = value.value;

      var data = {
         type: conf.type,
         domain: conf.domain,
         service: conf.service,
         service_data: serviceData
      };

      if(setState) {
         // @TODO REMOVE (or not)
         entity.state = value.value;
         updateView();
      }

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   }

   $scope.sliderChanged = function (item, entity, value) {
      if(!item._sliderInited) return;

      setSliderValue(item, entity, value, true);
   };

   $scope.volumeChanged = function (item, entity, conf) {
      if(!entity.attributes._sliderInited) return;

      var value = {
         value: conf.value / 100,
         request: {
            type: "call_service",
            domain: "media_player",
            service: "volume_set",
            field: "volume_level"
         }
      };

      setSliderValue(item, entity, value, false);
   };

   $scope.lightSliderChanged = function (slider, item, entity, value) {
      if(!item._controlsInited) return;
      if(!slider._sliderInited) return;
      if(!entity.attributes._sliderInited) return;

      setSliderValue(item, entity, value, false);
   };

   $scope.toggleSwitch = function (item, entity, callback) {
      var domain = "homeassistant";
      var group = item.id.split('.')[0];

      if(group === "switch") domain = "switch";
      if(group === "light") domain = "light";

      var service = "toggle";

      if(entity.state === "off") service = "turn_on";
      else if(entity.state === "on") service = "turn_off";

      if(CONFIG.debug) {
         if(entity.state === "off") entity.state = "on";
         else if(entity.state === "on") entity.state = "off";
      }

      var data = {
         type: "call_service",
         domain: domain,
         service: service,
         service_data: {
            entity_id: item.id
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();

         if(callback) callback();
      });
   };

   $scope.sendPlayer = function (service, item, entity) {
      sendItemData(item, {
         type: "call_service",
         domain: "media_player",
         service: service,
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.mutePlayer = function (muteState, item, entity) {
      if(CONFIG.debug) {
         entity.attributes.is_volume_muted = muteState;
      }

      sendItemData(item, {
         type: "call_service",
         domain: "media_player",
         service: 'volume_mute',
         service_data: {
            entity_id: item.id,
            is_volume_muted: muteState
         }
      });
   };

   $scope.callScript = function (item, entity) {
      var data = {
         type: "call_service",
         domain: "homeassistant",
         service: "turn_on",
         service_data: {
            entity_id: item.id
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   };

   $scope.callScene = function (item, entity) {
      var data = {
         type: "call_service",
         domain: "scene",
         service: "turn_on",
         service_data: {
            entity_id: item.id
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   };

   $scope.increaseBrightness = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      if(entity.state === "off") return false;

      if(!('brightness' in entity.attributes)) {
         return addError("No brightness field in object")
      }

      var brightness = +entity.attributes.brightness + 25.5;

      brightness = Math.min(brightness, 255);

      $scope.setLightBrightness(item, brightness);

      return false;
   };

   $scope.decreaseBrightness = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      if(entity.state === "off") return false;

      if(!('brightness' in entity.attributes)) {
         return addError("No brightness field in object")
      }

      var brightness = +entity.attributes.brightness - 25.5;

      brightness = Math.max(brightness, 1);

      $scope.setLightBrightness(item, brightness);

      return false;
   };

   $scope.increaseNumber = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      var value = parseFloat(entity.state);

      value += (entity.attributes.step || 1);

      if(entity.attributes.max) {
         value = Math.min(value, entity.attributes.max);
      }

      $scope.setInputNumber(item, value);

      return false;
   };

   $scope.decreaseNumber = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      var value = parseFloat(entity.state);

      value -= (entity.attributes.step || 1);

      if(entity.attributes.min) {
         value = Math.max(value, entity.attributes.min);
      }

      $scope.setInputNumber(item, value);

      return false;
   };

   $scope.setLightBrightness = function (item, brightness) {
      if(item.loading) return;

      var data = {
         type: "call_service",
         domain: "light",
         service: "turn_on",
         service_data: {
            entity_id: item.id,
            brightness_pct: Math.round(brightness / 255 * 100 / 10) * 10
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   };

   $scope.setInputNumber = function (item, value) {
      if(item.loading) return;

      var data = {
         type: "call_service",
         domain: "input_number",
         service: "set_value",
         service_data: {
            entity_id: item.id,
            value: value
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   };

   $scope.setInputSelect = function (item, option) {
      if(item.loading) return;

      var data = {
         type: "call_service",
         domain: "input_select",
         service: "select_option",
         service_data: {
            entity_id: item.id,
            option: option
         }
      };

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();
      });
   };

   $scope.setMediaPlayerSource = function (item, option) {
     if(item.loading) return;

     var data = {
        type: "call_service",
        domain: "media_player",
        service: "select_source",
        service_data: {
           entity_id: item.id,
           source: option
        }
     };

     item.loading = true;

     api.send(data, function (res) {
        item.loading = false;

        updateView();
     });
  };



   $scope.setSelectOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.setInputSelect(item, option);

      if(CONFIG.debug) {
         entity.state = option;
      }

      $scope.closeActiveSelect();

      return false;
   };

   $scope.setSourcePlayer = function ($event, item, entity, option) {
     $event.preventDefault();
     $event.stopPropagation();

     $scope.setMediaPlayerSource(item, option);

     if(CONFIG.debug) {
        entity.attributes.source = option;
     }

     $scope.closeActiveSelect();

     return false;
  };

   $scope.setClimateOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      sendItemData(item, {
         type: "call_service",
         domain: "climate",
         service: "set_operation_mode",
         service_data: {
            entity_id: item.id,
            operation_mode: option
         }
      });

      if(CONFIG.debug) {
         entity.attributes.operation_mode = option;
      }

      $scope.closeActiveSelect();

      return false;
   };


   $scope.increaseClimateTemp = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      var value = parseFloat(entity.attributes.temperature);

      value += (entity.attributes.target_temp_step || 1);

      if(entity.attributes.max_temp) {
         value = Math.min(value, entity.attributes.max_temp);
      }

      if(CONFIG.debug) {
         entity.attributes.temperature = value;
      }

      $scope.setClimateTemp(item, value);

      return false;
   };

   $scope.decreaseClimateTemp = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      var value = parseFloat(entity.attributes.temperature);

      value -= (entity.attributes.target_temp_step || 1);

      if(entity.attributes.min_temp) {
         value = Math.max(value, entity.attributes.min_temp);
      }

      if(CONFIG.debug) {
         entity.attributes.temperature = value;
      }

      $scope.setClimateTemp(item, value);

      return false;
   };

   $scope.setClimateTemp = function (item, value) {
      sendItemData(item, {
         type: "call_service",
         domain: "climate",
         service: "set_temperature",
         service_data: {
            entity_id: item.id,
            temperature: value
         }
      });
   };


   // UI

   $scope.openPage = function (page) {
      showedPages = [];

      if(activePage) {
         showedPages = [activePage]
      }

      showedPages.push(page);

      activePage = page;

      if(CONFIG.transition === TRANSITIONS.SIMPLE) {

      }
      else {
         setTimeout(scrollToActivePage, 40);
      }
   };

   $scope.openCamera = function (item) {
      $scope.activeCamera = item;
   };

   $scope.closeCamera = function () {
      $scope.activeCamera = null;
   };

   $scope.closeDoorEntry = function () {
      $scope.activeDoorEntry = null;

      if(doorEntryTimeout) clearTimeout(doorEntryTimeout);
   };

   $scope.openDoorEntry = function (item, entity) {
      $scope.activeDoorEntry = item;

      if(doorEntryTimeout) clearTimeout(doorEntryTimeout);

      if(CONFIG.doorEntryTimeout) {
         doorEntryTimeout = setTimeout(function () {
            $scope.closeDoorEntry();

            updateView();
         }, CONFIG.doorEntryTimeout * 1000);
      }
   };

   $scope.getCameraList = function () {
      if(cameraList) return cameraList;

      var res = [];

      $scope.pages.forEach(function (page) {
         (page.groups || []).forEach(function (group) {
            (group.items || []).forEach(function (item) {
               if([TYPES.CAMERA, TYPES.CAMERA_THUMBNAIL]
                     .indexOf(item.type) !== -1) {
                  res.push(item);
               }
            })
         })
      });

      cameraList = res;

      return res;
   };

   function scrollToActivePage () {
      var index = $scope.pages.indexOf(activePage);
      var translate = index * 100;

      var $pages = document.getElementById("pages");

      var transform;

      if(CONFIG.transition === TRANSITIONS.ANIMATED_GPU) {
         transform = 'translate3d(0, -' + translate + '%, 0)';
      }
      else if(CONFIG.transition === TRANSITIONS.ANIMATED) {
         transform = 'translate(0, -' + translate + '%)';
      }

      $pages.style.transform = transform;
   }

   $scope.isPageActive = function (page) {
      return activePage === page;
   };

   $scope.shouldDrawPage = function (page) {
      if(CONFIG.transition === TRANSITIONS.SIMPLE) {
         return $scope.isPageActive(page);
      }

      return true;
   };

   $scope.swipeUp = function () {
      var index = $scope.pages.indexOf(activePage);

      if($scope.pages[index + 1]) {
         $scope.openPage($scope.pages[index + 1]);
      }
   };

   $scope.swipeDown = function () {
      var index = $scope.pages.indexOf(activePage);

      if($scope.pages[index - 1]) {
         $scope.openPage($scope.pages[index - 1]);
      }
   };

   $scope.toggleSelect = function (item) {
      if($scope.selectOpened(item)) {
         $scope.closeActiveSelect();
      }
      else {
         $scope.openSelect(item);
      }
   };

   $scope.openSelect = function (item) {
      $scope.activeSelect = item;
   };

   $scope.closeActiveSelect = function () {
      $scope.activeSelect = null;
   };

   $scope.selectOpened = function (item) {
      return $scope.activeSelect === item;
   };


   /// INIT

   api.onError(function (data) {
      console.error(data);
      addError(data.message);
   });

   api.onReady(function () {
      // null mean all events, also available array and string
      // callback isn't necessary, result can be handled via events
      api.subscribeEvents("state_changed", function (res) {
         console.log('subscribed', res);
      });

      api.getStates(function (res) { // getting initialize states
         if(res.success) {
            console.log(res.result);

            // @TODO leave only res.result
            if(!CONFIG.debug || !window.DEBUG_SENSORS) {
               setStates(res.result);
            }
            else setStates(DEBUG_SENSORS);
         }

         $scope.ready = true;
         $scope.openPage($scope.pages[0]);

         updateView();
      });

      //updateView(); // trigger updates checker
   });

   api.onUnready(function () { // mean connection terminated
      $scope.ready = false;

      updateView();
   });

   api.onMessage(function (data) {
      // we received some message
      handleMessage(data);
   });

   function sendItemData (item, data, callback) {
      if(item.loading) return;

      item.loading = true;

      api.send(data, function (res) {
         item.loading = false;

         updateView();

         if(callback) callback();
      });
   }

   function getEntityValue (item, entity) {
      if(!item.value) return entity.state;

      if(item.value[0] === "@") return getObjectAttr(entity, item.value.slice(1));
      if(item.value[0] === "&") return getEntityAttr(item.value.slice(1));

      return item.value;
   }

   function escapeClass (text) {
      return text && typeof text === "string"
         ? text.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'non';
   }

   function getEntityAttr (path) {
      path = path.split('.');

      var entity = $scope.states[path.slice(0, 2).join('.')] || null;

      return getObjectAttr(entity, path.slice(2).join('.'));
   }

   function getItemAttr (item, path) { // getting entity attribute
      var entity = $scope.getItemEntity(item);

      if(!entity) return null;

      return getObjectAttr(entity, path);
   }

   function getObjectAttr (obj, path) {
      var res = obj;

      path.split('.').forEach(function (key) {
         res = typeof res === 'object' && res ? res[key] : null;
      });

      return res;
   }

   function setStates (states) {
      // we put entities in entities' object on init
      states.forEach(function (state) {
         $scope.states[state.entity_id] = state;
      });
   }

   function setNewState (key, state) {
      if(!$scope.states[key]) $scope.states[key] = state;

      // update every field of object to new state
      for(var k in state) $scope.states[key][k] = state[k];
   }

   function triggerEvents (key, state) {
      if(!CONFIG.events) return;

      CONFIG.events.forEach(function (event) {
         if(event.trigger !== state.entity_id) return;

         if(event.state !== state.state) return;

         $scope.entityClick({}, event.tile, $scope.getItemEntity(event.tile));
      });
   }

   function handleMessage (data) { // main handle function
      //console.log(data);

      if(data.type === "event") handleEvent(data.event);
      //else if(data.type === "result") console.log('command finished');
   }

   function handleEvent (event) {
      if(event.event_type === "state_changed") {
         try {
            console.log('state change', event.data.entity_id, event.data.new_state);
            setNewState(event.data.entity_id, event.data.new_state);
            triggerEvents(event.data.entity_id, event.data.new_state);
         }
         catch (e) {console.error(e);}
         updateView();
      }
   }

   function addError (error) {
      $scope.errors.push(error);

      setTimeout(function () { // remove error from stack after 10s
         $scope.errors.shift();
         updateView();
      }, 10000);

      updateView();
   }

   function updateView () { // help angular notice async update
      if(!$scope.$$phase) $scope.$digest();
   }
}
