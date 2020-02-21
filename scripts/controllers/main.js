App.controller('Main', ['$scope', '$timeout', '$location', 'Api', function ($scope, $timeout, $location, Api) {
   if(!window.CONFIG) return;
   
   $scope.pages = CONFIG.pages;
   $scope.pagesContainerStyles = {};
   $scope.TYPES = TYPES;
   $scope.FEATURES = FEATURES;
   $scope.HEADER_ITEMS = HEADER_ITEMS;

   $scope.activeSelect = null;
   $scope.screensaverShown = false;
   $scope.ready = false;

   $scope.errors = [];
   $scope.states = {};

   $scope.activeDatetime = null;
   $scope.datetimeString = null;

   $scope.activeCamera = null;
   $scope.activeDoorEntry = null;
   $scope.activeIframe = null;
   $scope.activeHistory = null;

   $scope.alarmCode = null;
   $scope.activeAlarm = null;

   var showedPages = [];

   var latestAlarmActions = {};
   var doorEntryTimeout = null;
   var bodyClass = null;
   var mainStyles = {};
   var activePage = null;
   var cameraList = null;
   var popupIframeStyles = {};
   var popupHistoryStyles = {};

   $scope.entityClick = function (page, item, entity) {
      if(typeof item.action === "function") {
         return callFunction(item.action, [item, entity]);
      }

      switch (item.type) {
         case TYPES.SWITCH:
         case TYPES.LIGHT:
         case TYPES.FAN:
         case TYPES.INPUT_BOOLEAN: return $scope.toggleSwitch(item, entity);

         case TYPES.LOCK: return $scope.toggleLock(item, entity);
         case TYPES.COVER_TOGGLE: return $scope.toggleCover(item, entity);

         case TYPES.VACUUM: return $scope.toggleVacuum(item, entity);

         case TYPES.AUTOMATION: return $scope.triggerAutomation(item, entity);

         case TYPES.SCRIPT: return $scope.callScript(item, entity);

         case TYPES.INPUT_SELECT: return $scope.toggleSelect(item, entity);

         case TYPES.CAMERA:
         case TYPES.CAMERA_STREAM:
         case TYPES.CAMERA_THUMBNAIL: return $scope.openCamera(item, entity);

         case TYPES.SCENE: return $scope.callScene(item, entity);

         case TYPES.DOOR_ENTRY: return $scope.openDoorEntry(item, entity);

         case TYPES.ALARM: return $scope.openAlarm(item, entity);

         case TYPES.DIMMER_SWITCH: return $scope.dimmerToggle(item, entity);

         case TYPES.POPUP_IFRAME: return $scope.openPopupIframe(item, entity);

         case TYPES.INPUT_DATETIME: return $scope.openDatetime(item, entity);
      }
   };

   $scope.entityLongPress = function ($event, page, item, entity) {
      if(typeof item.secondaryAction === "function") {
         return callFunction(item.secondaryAction, [item, entity]);
      }

      if (item.history) return $scope.openPopupHistory(item, entity);

      switch (item.type) {
         case TYPES.LIGHT: return $scope.openLightSliders(item, entity);
         default: {
            if (entity && entity.entity_id) {
               return $scope.openPopupHistory(item, entity);
            }
         }
      }
   };

   $scope.getBodyClass = function () {
      if(!bodyClass) {
         bodyClass = [];

         if(CONFIG.customTheme) {
            var themes = CONFIG.customTheme;

            if(typeof themes === "string") themes = [themes];

            themes.map(function (theme) {
               bodyClass.push('-theme-' + theme);
            });
         }

         if(CONFIG.entitySize) {
            bodyClass.push('-' + CONFIG.entitySize + '-entity');
         }

         var menuPos = CONFIG.menuPosition || MENU_POSITIONS.LEFT;
         var groupsAlign = CONFIG.groupsAlign || GROUP_ALIGNS.HORIZONTALLY;

         bodyClass.push('-menu-' + menuPos);
         bodyClass.push('-groups-align-' + groupsAlign);

         if(CONFIG.hideScrollbar) {
            bodyClass.push('-hide-scrollbar');
         }
      }

      var scrollClasses = [];

      if(activePage) {
         if(activePage.scrolledHorizontally) {
            scrollClasses.push('-scrolled-horizontally');
         }

         if(activePage.scrolledVertically) {
            scrollClasses.push('-scrolled-vertically');
         }
      }

      return bodyClass.concat(scrollClasses);
   };


   $scope.getItemEntity = function (item) {
      if(typeof item.id === "object") return item.id;

      if(!(item.id in $scope.states)) {
         warnUnknownItem(item);
         return null;
      }

      return $scope.states[item.id];
   };

   $scope.getCameraEntityFullscreen = function (item) {
      var entity_id = item.fullscreen.id;

      if(typeof entity_id === "undefined") {
         entity_id = item.id;
      }

      if(typeof entity_id === "object") return entity_id;

      return $scope.states[entity_id];
   };

   $scope.getEntryCameraEntity = function (itemEntry) {
      var item = itemEntry.layout.camera;

      if(typeof item.id === "object") return item.id;

      return $scope.states[item.id];
   };

   $scope.showPage = function (page) {
      return showedPages.indexOf(page) !== -1;
   };


   $scope.hasTrackerCoords = function (entity) {
      if(!entity.attributes) return false;

      return entity.attributes.longitude || entity.attributes.latitude;
   };

   $scope.slideMapStyles = function (item, page, obj, zoom, state) {
      var key = 'mapStyles' + zoom + (item.width || '1') + (item.height || '1');

      if(!obj[key]) {
         var width = item.width || 1, height = item.height || 1;
         var tileSize = page.tileSize || CONFIG.tileSize;
         var name = obj.friendly_name || ' ';

         if(!obj.longitude && !obj.latitude) return null;

         var coords = obj.longitude + ',' + obj.latitude;
         // +80 - hack to hide logo
         var sizes = Math.ceil(tileSize * width) + ',' + Math.ceil((tileSize * height) + 80);

         var url;

         if(item.map === YANDEX_MAP) {
            var icon = 'round';

            if(state.toLowerCase() === 'home') icon = 'home';
            else if(state.toLowerCase() === 'office') icon = 'work';

            var pt = coords + ',' + icon;

            url = "https://static-maps.yandex.ru/1.x/?lang=en-US&ll="
               + coords + "&z=" + zoom + "&l=map&size=" + sizes + "&pt=" + pt;
         }
         else if(item.map === MAPBOX_MAP) {
            coords = obj.longitude + ',' + obj.latitude;
            sizes = sizes.replace(',', 'x');

            var label = name[0].toLowerCase();
            var marker = "pin-s-" + label + "(" + obj.longitude + ',' + obj.latitude + ")";
            var style = "mapbox/streets-v11";

            if(CONFIG.mapboxStyle) {
               var styleGroups = /^mapbox:\/\/styles\/(.+)$/.exec(CONFIG.mapboxStyle);
               if (styleGroups.length > 1) {
                  style = styleGroups[1];
               }
            }

            url = "https://api.mapbox.com/styles/v1/" + style + "/static/"
               + marker + "/" + coords + "," + zoom + ",0/" + sizes;

            if(CONFIG.mapboxToken) {
               url += "?access_token=" + CONFIG.mapboxToken;
            }
         }
         else {
            coords = obj.latitude + ',' + obj.longitude;
            sizes = sizes.replace(',', 'x');

            var label = name[0].toUpperCase();
            var marker = encodeURIComponent("color:gray|label:"+label+"|" + coords);

            url = "https://maps.googleapis.com/maps/api/staticmap?center="
               + coords + "&zoom=" + zoom + "&size=" + sizes + "&scale=2&maptype=roadmap&markers=" + marker;

            if(CONFIG.googleApiKey) {
               url += "&key=" + CONFIG.googleApiKey;
            }
         }

         obj[key] = {backgroundImage: "url('" + url + "')"};
      }

      return obj[key];
   };

   $scope.clockStyles = function () {
      return CONFIG.clockStyles;
   };

   $scope.headWarning = function () {
      // @TODO remove
      Noty.addObject({
         id: 'header-deprecated',
         type: Noty.WARNING,
         title: 'Head deprecated',
         message: 'Head is deprecated, please replace it with "header" object. ' +
         '<br> More info <a href="https://github.com/resoai/TileBoard/wiki/Header-configuration">' +
         'https://github.com/resoai/TileBoard/wiki/Header-configuration</a>'
      });

      return true;
   };

   $scope.pageStyles = function (page, index) {
      if(!page.styles) {
         var styles = {};

         if(page.bg) {
            var bg = parseFieldValue(page.bg, page, {});

            if(bg) styles.backgroundImage = 'url("' + bg + '")';
         }
         else if(page.bgSuffix) {
            var sbg = parseFieldValue(page.bgSuffix, page, {});

            if(sbg) styles.backgroundImage = 'url("' + toAbsoluteServerURL(sbg) + '")';
         }

         if ((CONFIG.transition === TRANSITIONS.ANIMATED || CONFIG.transition === TRANSITIONS.ANIMATED_GPU)
             && index > 0 && !$scope.isMenuOnTheLeft) {
            styles.position = 'absolute';
            styles.left = (index * 100) + '%';
            styles.top = '0';
         }

         page.styles = styles;
      }

      return page.styles;
   };

   $scope.showPagesMenu = function () {
      return CONFIG.pages.length > 1;
   };

   $scope.pagesMenuClasses = function () {
      var position = CONFIG.menuPosition;

      if(!position) position = MENU_POSITIONS.LEFT;

      return '-' + position;
   };

   $scope.trackerZoomLevels = function (item, entity) {
      if(!entity.zoomLevels) {
         entity.zoomLevels = [9, 13];

         if(item.zoomLevels) {
            entity.zoomLevels = item.zoomLevels;
         }
      }

      return entity.zoomLevels;
   };

   $scope.trackerSlidesClass = function (item, entity) {
      var maps = $scope.trackerZoomLevels(item, entity);

      var c = maps.length;

      if($scope.showTrackerBg(item, entity)) c++;

      return '-c' + c;
   };

   $scope.trackerBg = function (entity) {
      if(!entity.trackerBg) {
         var styles = {};

         if(entity.attributes.entity_picture) {
            styles.backgroundImage = 'url("' + toAbsoluteServerURL(entity.attributes.entity_picture) + '")';
         }

         entity.trackerBg = styles;
      }

      return entity.trackerBg;
   };

   $scope.showTrackerBg = function (item, entity) {
      if(!entity.attributes.entity_picture) {
         return false;
      }

      return !item.hideEntityPicture;
   };

   $scope.groupStyles = function (group, page) {
      if(!group.styles) {
         var tileSize = page.tileSize || CONFIG.tileSize;
         var tileMargin = page.tileMargin || CONFIG.tileMargin;

         if(!('width' in group) || !('height' in group)) {
            var sizes = calcGroupSizes(group);

            if(!group.width) group.width = sizes.width;
            if(!group.height) group.height = sizes.height;
         }

         var styles = {
            width: tileSize * group.width + tileMargin * (group.width - 1) + 'px',
            height: tileSize * group.height + tileMargin * (group.height - 1) + 'px',
         };

         if(page.groupMarginCss) {
            styles.margin = page.groupMarginCss;
         }
         else if(group.groupMarginCss) {
            styles.margin = group.groupMarginCss;
         }
         else if(CONFIG.groupMarginCss) {
            styles.margin = CONFIG.groupMarginCss;
         }

         group.styles = styles;
      }

      return group.styles;
   };

   $scope.itemStyles = function (page, item, entity) {
      var prevSize = item._prevTileSize || page.tileSize || CONFIG.tileSize;
      var currentSize = page.tileSize || CONFIG.tileSize;
      var hasChanged = prevSize !== currentSize;

      if(!item.styles || hasChanged) {
         var width = item.width || 1;
         var height = item.height || 1;
         var pos = item.position;
         var tileSize = page.tileSize || CONFIG.tileSize;
         var tileMargin = page.tileMargin || CONFIG.tileMargin;

         item._prevTileSize = tileSize;

         var styles = {
            width: tileSize * width + tileMargin * (width - 1) + 'px',
            height: tileSize * height + tileMargin * (height - 1) + 'px',
            left: pos[0] * tileSize + (tileMargin * pos[0]) + 'px',
            top: pos[1] * tileSize + (tileMargin * pos[1]) + 'px',
         };

         item.styles = styles;
      }

      if(item.customStyles) {
         var res;

         if(typeof item.customStyles === "function") {
            res = callFunction(item.customStyles, [item, entity]);
         }
         else if(typeof item.customStyles === "object") {
            res = item.customStyles;
         }
         if(res) for(var k in res) item.styles[k] = res[k];
      }
      
      return item.styles;
   };

   $scope.itemBgStyles = function (item, entity) {
      var obj = entity.attributes || entity;

      if(!obj.bgStyles) {
         var bg, styles = {};

         if('bgOpacity' in item) {
            styles.opacity = parseFieldValue(item.bgOpacity, item, entity);
         }

         if(item.bg) {
            bg = parseFieldValue(item.bg, item, entity);

            if(bg) styles.backgroundImage = 'url(' + bg + ')';
         }
         else if(item.bgSuffix) {
            bg = parseFieldValue(item.bgSuffix, item, entity);

            if(bg) styles.backgroundImage = 'url("' + toAbsoluteServerURL(bg) + '")';
         }

         obj.bgStyles = styles;
      }

      return obj.bgStyles;
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

      if(item.classes) item.classes.forEach(function (c) {
         item._classes.push(c);
      });

      if(item.loading) item._classes.push('-loading');
      if($scope.selectOpened(item)) item._classes.push('-top-entity');

      return item._classes;
   };

   $scope.entityState = function (item, entity) {
      if(item.state === false) return null;

      if(typeof item.state !== 'undefined') {
         if(typeof item.state === "string") {
            return parseString(item.state, entity);
         }
         else if(typeof item.state === "function") {
            return callFunction(item.state, [item, entity]);
         }
         else {
            return item.state;
         }
      }

      if(typeof item.states === "function") {
         return callFunction(item.states, [item, entity]);
      }
      else if(typeof item.states === "object") {
         return item.states[entity.state] || entity.state;
      }

      return entity.state;
   };

   $scope.entityIcon = function (item, entity) {
      var state = parseFieldValue(entity.state, item, entity);

      if(!state && item.state) {
         state = parseFieldValue(item.state, item, entity);
      }

      if(item.icon) {
         state = parseFieldValue(item.icon, item, entity);
      }

      if(!item.icons) return state;

      if(typeof item.icons === "function") {
         return callFunction(item.icons, [item, entity]);
      }

      return item.icons[state] || null;
   };

   $scope.entityTitle = function (item, entity) {
      if(!('title' in item)) {
         return entity.attributes ? entity.attributes.friendly_name : null;
      }

      return getItemFieldValue('title', item, entity);
   };

   $scope.itemField = function (field, item, entity) {
      return getItemFieldValue(field, item, entity);
   };

   $scope.itemCustomHtml = function (item, entity) {
      if (typeof item.customHtml === 'function') {
         return callFunction(item.customHtml, [item, entity]);
      }

      return item.customHtml;
   };

   $scope.entityUnit = function (item, entity) {
      if(!('unit' in item)) {
         return entity.attributes ? entity.attributes.unit_of_measurement : null;
      }

      return getItemFieldValue('unit', item, entity);
   };

   $scope.entitySubtitle = function (item, entity) {
      return getItemFieldValue('subtitle', item, entity);
   };

   $scope.entityValue = function (item, entity) {
      var value = entity.state;

      if(item.value) {
         value = getItemFieldValue('value', item, entity);
      }

      if(typeof item.filter === "function") {
         return callFunction(item.filter, [value, item, entity]);
      }

      return value;
   };

   $scope.climateTarget = function (item, entity) {
      var value = entity.attributes.temperature || [
         entity.attributes.target_temp_low,
         entity.attributes.target_temp_high
      ].join(" - ");

      if(item.filter) return item.filter(value);

      return value;
   };

   $scope.listField = function (field, item, list) {
      var value = parseFieldValue(list[field], item, list);

      if(typeof item.filter === "function") {
         return callFunction(item.filter, [value, field, item]);
      }

      return value;
   };

   $scope.getWeatherField = function (field, item, entity) {
      var fields = item.fields;

      if(!fields || !fields[field]) return null;

      return parseFieldValue(fields[field], item, entity);
   };

   $scope.getWeatherLine = function (line, item, entity) {
      if(!line) return null;

      return parseFieldValue(line, item, entity);
   };

   $scope.getWeatherIcon = function (item, entity) {
      var icon;

      if(item.icon || item.icons) {
         icon = $scope.entityIcon(item, entity);
      }

      if(!icon) {
         icon = $scope.getWeatherField('icon', item, entity);

         if(icon) console.warn(
            "`icon` field inside fields is deprecated for WEATHER tile, " +
            "please move it to the tile object");
      }

      if(!icon) return null;

      var map = item.icons;

      if(!map && item.fields.iconMap) {
         map = item.fields.iconMap;

         if(icon) console.warn(
            "`iconMap` field inside fields is deprecated for WEATHER tile, " +
            "please move it to the tile object as `icons`");
      }

      if(typeof map === "function") return callFunction(map, [icon, item, entity]);

      if(!map) return icon;

      return map[icon] || icon;
   };

   $scope.getWeatherImageStyles = function (item, entity) {
      if(!item.iconImage) return null;

      var iconImage = parseFieldValue(item.iconImage, item, entity);

      if(typeof item.icons === "function") {
         iconImage = callFunction(item.icons, [iconImage, item, entity]);
      }

      if(item.icons && (iconImage in item.icons)) {
         iconImage = item.icons[iconImage];
      }

      if(!iconImage) return null;

      if(!item._imgStyles) item._imgStyles = {};

      item._imgStyles['backgroundImage'] = 'url("' + iconImage + '")';

      return item._imgStyles;
   };

   $scope.weatherListField = function (field, line, item, entity) {
      if(!line || !line[field]) return null;

      return parseFieldValue(line[field], item, entity);
   };

   $scope.weatherListIcon = function (line, item, entity) {
      var icon = $scope.weatherListField('icon', line, item, entity);

      if(!icon) return null;

      if(typeof item.icons === "function") {
         return callFunction(item.icons, [icon, item, entity]);
      }

      if(!item.icons) return icon;

      return item.icons[icon] || icon;
   };

   $scope.weatherListImageStyles = function (line, item, entity) {
      var iconImage = $scope.weatherListField('iconImage', line, item, entity);

      if(!iconImage) return null;

      if(typeof item.icons === "function") {
         iconImage = callFunction(item.icons, [iconImage, item, entity]);
      }

      if(item.icons && (iconImage in item.icons)) {
         iconImage = item.icons[iconImage];
      }

      if(!iconImage) return null;

      if(!line._imgStyles) line._imgStyles = {};

      line._imgStyles['backgroundImage'] = 'url("' + iconImage + '")';

      return line._imgStyles;
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

   $scope.slideStyles = function (slide, item, entity) {
      if(!slide.slideStyles) {
         var styles = {};

         if(slide.bg) {
            var bg = parseFieldValue(slide.bg, item, entity);

            if(bg) styles.backgroundImage = 'url(' + bg + ')';
         }

         slide.slideStyles = styles;
      }

      return slide.slideStyles;
   };

   $scope.itemSelectStyles = function (entity, items) {
      if(!entity.itemSelectStyles) {
         var styles = {};

         if(items) {
            // magic numbers
            styles.marginTop = (-Math.min(items.length * 17, 180)) + 'px';
         }

         entity.itemSelectStyles = styles;
      }

      return entity.itemSelectStyles;
   };

   $scope.getMainStyles = function () {
      return mainStyles;
   };

   $scope.getHeader = function (page) {
      if(!page) return CONFIG.header;

      return page.header;
   };

   $scope.getSliderConf = function (item, entity) {
      var key = "_c";

      if(!entity.attributes) entity.attributes = {};
      if(entity.attributes[key]) return entity.attributes[key];

      var def = item.slider || {};
      var attrs = entity.attributes || {};
      var value = +attrs[def.field] || 0;
      
      entity.attributes[key] = {
         max: attrs.max || def.max || 100,
         min: attrs.min || def.min || 0,
         step: attrs.step || def.step || 1,
         value: value || +entity.state || def.value || 0,
         request: def.request || {
            type: "call_service",
            domain: "input_number",
            service: "set_value",
            field: "value"
         }
      };

      $timeout(function () {
         item._sliderInited = true;
      }, 50);

      return entity.attributes[key];
   };

   $scope.getLightSliderConf = function (slider, entity) {
      var key = "_c_" + slider.field;

      if(!entity.attributes) entity.attributes = {};
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

      $timeout(function () {
         entity.attributes._sliderInited = true;
         slider._sliderInited = true;
      }, 100);

      $timeout(function () {
         entity.attributes._sliderInited = true;
      }, 0);

      return entity.attributes[key];
   };

   $scope.getVolumeConf = function (item, entity) {
      if(!entity.attributes) entity.attributes = {};
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

      $timeout(function () {
         entity.attributes._sliderInited = true;
      }, 50);

      return entity.attributes._c;
   };

   $scope.getLightSliderValue = function (slider, conf) {
      if(slider.formatValue) return slider.formatValue(conf);

      return conf.value;
   };

   $scope.openLightSliders = function (item, entity) {
      if((!item.sliders || !item.sliders.length) && !item.colorpicker) return;

      if(entity.state !== "on") {
         return $scope.toggleSwitch(item, entity, function () {
            $timeout(function () {
               if(entity.state === "on") {
                  $scope.openLightSliders(item, entity);
               }
            }, 0);
         })
      }
      else {
         if(!item.controlsEnabled) {
            item.controlsEnabled = true;

            $timeout(function () {
               item._controlsInited = true;
            }, 50);
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

   $scope.supportsFeature = function (feature, entity) {
      if(!('supported_features' in entity.attributes)) {
         return false;
      }

      var features = entity.attributes.supported_features;

      return (features | feature) === features;
   };

   $scope.isDisarmed = function (entity) {
      if(['disarmed'].indexOf(entity.state) === -1) {
         return true;
      }

      return false;
   };

   $scope.shouldShowVolumeSlider = function (entity) {
      return $scope.supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_SET, entity)
          && ('volume_level' in entity.attributes)
          && entity.state !== 'off';
   };

   $scope.shouldShowVolumeButtons = function (entity) {
      return (!$scope.supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_SET, entity)
          || !('volume_level' in entity.attributes))
          && $scope.supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_STEP, entity)
          && entity.state !== 'off';
   };

   var GAUGE_DEFAULTS = {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      foregroundColor: 'rgba(0, 150, 136, 1)',
      size: function (item) {
         return .8 * (CONFIG.tileSize * (item.height < item.width ? item.height : item.width));
      },
      duration: 1500,
      thick: 6,
      type: 'full',
      min: 0,
      max: 100,
      cap: 'butt',
      thresholds: {},
   };

   $scope.getGaugeField = function (field, item, entity) {
      if(!item) return null;

      if(typeof item.filter === "function") {
         return callFunction(item.filter, [value, item, entity]);
      }

      if(item.settings && field in item.settings) {
         return parseFieldValue(item.settings[field], item, entity);
      }

      if(field in GAUGE_DEFAULTS) {
         return parseFieldValue(GAUGE_DEFAULTS[field], item, entity);
      }

      return null;
   };

   $scope.itemURL = function (item, entity) {
      if(typeof item.url === 'function') {
         return callFunction(item.url, [item, entity]);
      }

      return item.url;
   };

   // Actions

   var setSliderValue = debounce(setSliderValueFn, 250);

   function setSliderValueFn (item, entity, value) {
      if(!value.request) return;

      var conf = value.request;
      var serviceData = {entity_id: item.id};

      serviceData[conf.field] = value.value;

      sendItemData(item, {
         type: conf.type,
         domain: conf.domain,
         service: conf.service,
         service_data: serviceData
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

      if(['switch', 'light', 'fan'].indexOf(group) !== -1) domain = group;

      var service = "toggle";

      if(entity.state === "off") service = "turn_on";
      else if(entity.state === "on") service = "turn_off";

      sendItemData(item, {
         type: "call_service",
         domain: domain,
         service: service,
         service_data: {
            entity_id: item.id
         }
      }, callback);
   };

   $scope.dimmerToggle = function (item, entity, callback) {
      if(item.action) {
         callFunction(item.action, [item, entity, callback]);
      }
      else if(angular.isString(item.id) && entity) {
         $scope.toggleSwitch(item, entity, callback);
      }
   };

   $scope.dimmerAction = function (action, $event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      var func = "action" + (action === "plus" ? "Plus" : "Minus");

      if(item[func]) callFunction(item[func], [item, entity, $event]);

      return false;
   };

   $scope.toggleLock = function (item, entity) {
      var service;

      if(entity.state === "locked") service = "unlock";
      else if(entity.state === "unlocked") service = "lock";

      sendItemData(item, {
         type: "call_service",
         domain: "lock",
         service: service,
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.toggleVacuum = function (item, entity) {
      var service;
      if(entity.state === "off") service = "turn_on";
      else if(entity.state === "on") service = "turn_off";
      else if(['idle', 'docked', 'paused'].indexOf(entity.state) !== -1) {
         service = "start";
      }
      else if(entity.state === "cleaning") service = "return_to_base";

      sendItemData(item, {
         type: "call_service",
         domain: "vacuum",
         service: service,
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.triggerAutomation = function (item, entity) {
      sendItemData(item, {
         type: "call_service",
         domain: "automation",
         service: "trigger",
         service_data: {
            entity_id: item.id
         }
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
      sendItemData(item, {
         type: "call_service",
         domain: "media_player",
         service: "volume_mute",
         service_data: {
            entity_id: item.id,
            is_volume_muted: muteState
         }
      });
   };

   $scope.callScript = function (item, entity) {
      sendItemData(item, {
         type: "call_service",
         domain: "script",
         service: "turn_on",
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.callScene = function (item, entity) {
      sendItemData(item, {
         type: "call_service",
         domain: "scene",
         service: "turn_on",
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.increaseBrightness = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      if(entity.state === "off") return false;

      if(!('brightness' in entity.attributes)) {
         return addError("No brightness field in object");
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
         return addError("No brightness field in object");
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

      sendItemData(item, {
         type: "call_service",
         domain: "light",
         service: "turn_on",
         service_data: {
            entity_id: item.id,
            brightness_pct: Math.round(brightness / 255 * 100 / 10) * 10
         }
      });
   };

   $scope.getRGBStringFromArray = function( color ) {
      if(!color) return null;
      return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
   };

   $scope.getRGBArrayFromString = function( color ) {
      if(!color || color.indexOf("rgb") !== 0) return null;

      var colorValues;

      if (color.indexOf("rgba") === 0) {
         colorValues = color.substring(color.indexOf("(") + 1, color.lastIndexOf(",")).split(",");
      }
      else {
         colorValues = color.substring(color.indexOf("(") + 1, color.indexOf(")")).split(",");
      }

      return [parseInt(colorValues[0]), parseInt(colorValues[1]), parseInt(colorValues[2])];
   };

   $scope.setLightColor = function (item, color) {
      if(item.loading) return;

      var colors = $scope.getRGBArrayFromString(color);

      if(colors) sendItemData(item, {
         type: "call_service",
         domain: "light",
         service: "turn_on",
         service_data: {
            entity_id: item.id,
            rgb_color: colors
         }
      });
   };   

   $scope.$on('colorpicker-colorupdated', function (event, data) {
      $scope.setLightColor(data.item, data.color);
   });

   $scope.setInputNumber = function (item, value) {
      if(item.loading) return;

      sendItemData(item, {
         type: "call_service",
         domain: "input_number",
         service: "set_value",
         service_data: {
            entity_id: item.id,
            value: value
         }
      });
   };

   $scope.setSelectOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      sendItemData(item, {
         type: "call_service",
         domain: "input_select",
         service: "select_option",
         service_data: {
            entity_id: item.id,
            option: option
         }
      });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.setSourcePlayer = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      sendItemData(item, {
         type: "call_service",
         domain: "media_player",
         service: "select_source",
         service_data: {
            entity_id: item.id,
            source: option
         }
      });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.setClimateOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      sendItemData(item, {
         type: "call_service",
         domain: "climate",
         service: "set_preset_mode",
         service_data: {
            entity_id: item.id,
            preset_mode: option
         }
      });

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

   $scope.sendCover = function (service, item, entity) {
      sendItemData(item, {
         type: "call_service",
         domain: "cover",
         service: service,
         service_data: {
            entity_id: item.id
         }
      });
   };

   $scope.toggleCover = function (item, entity) {
      if(entity.state === "open") service = "close_cover";
      else if(entity.state === "closed") service = "open_cover";

      $scope.sendCover(service, item, entity);
   };

   $scope.openFanSpeedSelect = function ($event, item) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.openSelect(item);
   };

   $scope.setFanSpeed = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      sendItemData(item, {
         type: "call_service",
         domain: "fan",
         service: "set_speed",
         service_data: {
            entity_id: item.id,
            speed: option
         }
      });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.actionAlarm = function (action, item, entity) {
      var code = $scope.alarmCode;

      var data = {entity_id: item.id};

      if (code) data.code = code;

      latestAlarmActions[item.id] = Date.now();

      sendItemData(item, {
         type: "call_service",
         domain: "alarm_control_panel",
         service: action,
         service_data: data
      });

      $scope.alarmCode = null;
   };


   // UI

   $scope.openPage = function (page, preventAnimation) {
      preventAnimation = preventAnimation || false;
      showedPages = [];

      if(activePage) {
         showedPages = [activePage]
      }

      showedPages.push(page);

      activePage = page;

      if(CONFIG.transition === TRANSITIONS.SIMPLE) {

      }
      else {
         $timeout(function () {
            scrollToActivePage(preventAnimation);
         }, 20);
      }
      if (CONFIG.rememberLastPage) {
         $location.hash($scope.pages.indexOf(page));
      }
   };

   $scope.openCamera = function (item) {
      $scope.activeCamera = item;
   };
   
   $scope.closeCamera = function () {
      $scope.activeCamera = null;
   };

   $scope.openDatetime = function (item, entity) {
      $scope.activeDatetime = item;

      if(entity.attributes && entity.attributes.has_date) {
         var d = new Date();

         $scope.datetimeString = d.getFullYear() + "";
         $scope.datetimeString += leadZero(d.getMonth() + 1);
         $scope.datetimeString += leadZero(d.getDate());
      }
   };

   $scope.closeDatetime = function () {
      $scope.activeDatetime = null;
      $scope.datetimeString = null;
   };

   $scope.getPopupIframeStyles = function () {
      if(!$scope.activeIframe || !$scope.activeIframe.iframeStyles) return null;

      var entity = $scope.getItemEntity($scope.activeIframe);

      var styles = $scope.itemField('iframeStyles', $scope.activeIframe, entity);

      if(!styles) return null;

      for (var k in popupIframeStyles) delete popupIframeStyles[k];
      for (k in styles) popupIframeStyles[k] = styles[k];

      return popupIframeStyles;
   };

   $scope.openPopupIframe = function (item, entity) {
      $scope.activeIframe = item;
   };

   $scope.closePopupIframe = function () {
      $scope.activeIframe = null;
   };

   $scope.getPopupHistoryStyles = function () {
      if(!$scope.activeHistory || !$scope.activeHistory.item.history || !$scope.activeHistory.item.history.styles) return null;

      var entity = $scope.getItemEntity($scope.activeHistory.item);

      var styles = $scope.itemField('history.styles', $scope.activeHistory.item, entity);

      if(!styles) return null;

      for (var k in popupHistoryStyles) delete popupHistoryStyles[k];
      for (k in styles) popupHistoryStyles[k] = styles[k];

      return popupHistoryStyles;
   };

   $scope.openPopupHistory = function (item, entity) {
      $scope.activeHistory = {
         item: angular.copy(item),
         isLoading: true,
         errorText: null
      };

      var entityId = $scope.itemField('history.entity', item, entity) || entity.entity_id;

      if(!entityId) {
         $scope.activeHistory.errorText = 'No entity was specified';
         return;
      }

      var day = 24 * 60 * 60 * 1000;
      var startDate = new Date(Date.now() - ($scope.itemField('history.offset', item, entity) || day)).toISOString();

      return Api.getHistory(startDate, entityId)
         .then(function (data) {
            $scope.activeHistory.isLoading = false;

            if(data.length === 0) {
               $scope.activeHistory.errorText = 'No history data found';
               return;
            }

            var datasets = [];
            var datasetOverride = [];
            var yAxes = [];
            var seenAxisIds = {};

            data.forEach(function (states) {
               var firstStateInfo = states[0];

               var dataset = states.map(function (state) {
                  return { x: new Date(state.last_changed), y: state.state };
               });

               // Create extra state with current value.
               dataset.push({
                  x: Date.now(),
                  y: $scope.states[firstStateInfo.entity_id].state
               });

               datasets.push(dataset);

               var seriesName = firstStateInfo.attributes.friendly_name;
               var seriesUnit = firstStateInfo.attributes.unit_of_measurement;

               // Either categorial or continuous data.
               var yAxisType = Number.isNaN(parseFloat(dataset[0].y)) ? 'category' : 'linear';
               var yAxisId = yAxisType + (seriesUnit ? '-' + seriesUnit : '');
               var createYAxis = false;

               // Create once and reuse same axis for multiple entities using same unit.
               if(seriesUnit && !(seriesUnit in seenAxisIds)) {
                  seenAxisIds[seriesUnit] = true;
                  createYAxis = true;
               } else if(!seriesUnit) {
                  createYAxis = true;
               }

               if(createYAxis) {
                  var yLabels = null;
                  // Only non-continuous data needs explicit labels.
                  if(yAxisType === 'category') {
                     yLabels = [];
                     dataset.forEach(function (value) {
                        if(yLabels.indexOf(value.y) === -1) {
                           yLabels.push(value.y);
                        }
                     });
                     yLabels.sort().reverse();
                     // Special handling for labels when there is only one label present in history.
                     if(yLabels.length === 1) {
                        // on/off - add the other state so that y axis positioning is consistent.
                        if(['on', 'off'].indexOf(yLabels[0]) !== -1) {
                           yLabels = ['on', 'off'];
                        } else {
                           // Add dummy states to vertically center the actual state.
                           yLabels.push('');
                           yLabels.unshift('');
                        }
                     }
                  }

                  yAxes.push({
                     type: yAxisType,
                     labels: yLabels,
                     id: yAxisId,
                  });
               }

               datasetOverride.push({
                  label: seriesUnit ? (seriesName + ' / ' + seriesUnit) : seriesName,
                  yAxisID: yAxisId,
               });
            });

            // 'index' mode doesn't work well with multiple datasets - revert to default mode.
            var interactionsMode = datasets.length > 1 ? 'nearest' : 'index';

            $scope.activeHistory.data = datasets;
            $scope.activeHistory.datasetOverride = datasetOverride;
            $scope.activeHistory.options = angular.merge({
               scales: {
                  yAxes: yAxes
               },
               tooltips: {
                  mode: interactionsMode
               },
               hover: {
                 mode: interactionsMode
               }
            }, $scope.itemField('history.options', item, entity));
         });
   };

   $scope.closePopupHistory = function () {
      $scope.activeHistory = null;
   };

   $scope.openDoorEntry = function (item, entity) {
      $scope.activeDoorEntry = item;

      if(doorEntryTimeout) clearTimeout(doorEntryTimeout);

      if(CONFIG.doorEntryTimeout) {
         doorEntryTimeout = $timeout(function () {
            $scope.closeDoorEntry();
         }, CONFIG.doorEntryTimeout * 1000);
      }
   };

   $scope.closeDoorEntry = function () {
      $scope.activeDoorEntry = null;

      if(doorEntryTimeout) clearTimeout(doorEntryTimeout);
   };

   $scope.openAlarm = function (item) {
      $scope.activeAlarm = item;
      $scope.alarmCode = null;
   };

   $scope.closeAlarm = function () {
      $scope.activeAlarm = null;
      $scope.alarmCode = null;
   };

   $scope.getCameraList = function () {
      if(cameraList) return cameraList;

      var res = [];

      $scope.pages.forEach(function (page) {
         (page.groups || []).forEach(function (group) {
            (group.items || []).forEach(function (item) {
               if([TYPES.CAMERA, TYPES.CAMERA_THUMBNAIL, TYPES.CAMERA_STREAM]
                     .indexOf(item.type) !== -1) {
                  res.push(item);
               }
            })
         })
      });

      cameraList = res;

      return res;
   };

   function scrollToActivePage (preventAnimation) {
      var index = $scope.pages.indexOf(activePage);
      var translate = '-' + (index * 100) + '%';
      $scope.pagesContainerStyles.transform = getTransformCssValue(translate);

      if(preventAnimation) {
         $scope.pagesContainerStyles.transition = 'none';

         $timeout(function () {
            $scope.pagesContainerStyles.transition = null;
         }, 50);
      }
   }

   function getTransformCssValue(translateValue) {
      if(CONFIG.transition === TRANSITIONS.ANIMATED_GPU) {
         var params = $scope.isMenuOnTheLeft ? [0, translateValue, 0] : [translateValue, 0, 0];
         return 'translate3d(' + params.join(',') + ')';
      }

      if(CONFIG.transition === TRANSITIONS.ANIMATED) {
         var params = $scope.isMenuOnTheLeft ? [0, translateValue] : [translateValue, 0];
         return 'translate(' + params.join(',') + ')';
      }
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

   $scope.isHidden = function (object, entity) {
      if(!('hidden' in object)) return false;

      if(typeof object.hidden === "function") {
         return callFunction(object.hidden, [object, entity]);
      }

      return object.hidden;
   };

   $scope.isMenuOnTheLeft = CONFIG.menuPosition === MENU_POSITIONS.LEFT;

   var hasScrolledDuringPan = false;

   $scope.onPageScroll = function () {
      // Will disable panning when page starts scrolling.
      // Is reset from isPanEnabled function on starting to pan.
      hasScrolledDuringPan = true;

      return true;
   };

   $scope.isPanEnabled = function (recognizer, event) {
      if(hasOpenPopup()) {
         return;
      }

      // Workaround for touch events - cancel recognition on scroll event.
      if(event && event.pointerType === 'touch') {
         if(event.isFirst) {
            hasScrolledDuringPan = false;
         }

         return !hasScrolledDuringPan;
      }

      return true;
   }

   $scope.onPagePan = function (event) {
      if(event.eventType & (Hammer.INPUT_END | Hammer.INPUT_CANCEL)) {
         // Re-enable transitions.
         $scope.pagesContainerStyles.transition = null;

         if(event.eventType === Hammer.INPUT_CANCEL) {
            // Reverts any partial scrolling.
            scrollToActivePage();
            return;
         }
      } else {
         // Disable transitions.
         $scope.pagesContainerStyles.transition = 'none';
      }

      var pageCount = $scope.pages.length;
      var pageIndex = $scope.pages.indexOf(activePage);
      var initialOffset = -pageIndex * 100;
      var viewportDimension = $scope.isMenuOnTheLeft ? window.innerHeight : window.innerWidth;
      var panDelta = $scope.isMenuOnTheLeft ? event.deltaY : event.deltaX;
      var panPercentViewport = (panDelta / viewportDimension) * 100;
      var newOffset = initialOffset + panPercentViewport;

      // If gesture is finished, determine whether page should switch or be rolled back.
      if(event.isFinal) {
         var targetPageIndex = pageIndex;

         // Switch to other page if:
         // - panned 50% of new page onto screen
         // or
         // - the velocity of movement was above the threshold (and velocity direction matches delta direction)
         var velocity = $scope.isMenuOnTheLeft ? event.velocityY : event.velocityX;
         if(Math.abs(panPercentViewport) >= 50 || (Math.abs(velocity) > .5 && velocity < 0 === panDelta < 0)) {
            var potentialTargetIndex = targetPageIndex + (newOffset < initialOffset ? 1 : -1);
            // Set new page index if new index is within range.
            if(potentialTargetIndex >= 0 && potentialTargetIndex < pageCount) {
               targetPageIndex = potentialTargetIndex;
            }
         }

         $scope.openPage($scope.pages[targetPageIndex]);
         return;
      }

      // Check that new offset is within range of pages area.
      if(newOffset <= 0 && newOffset >= ((pageCount - 1) * -100)) {
         $scope.pagesContainerStyles.transform = getTransformCssValue(newOffset + '%');
      }
   }

   function hasOpenPopup () {
      return $scope.activeCamera || $scope.activeDoorEntry || $scope.activeIframe
         || $scope.activeHistory;
   }

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

   $scope.inputAlarm = function (num) {
      $scope.alarmCode = $scope.alarmCode || "";

      $scope.alarmCode += num;
   };

   $scope.clearAlarm = function () {
      $scope.alarmCode = "";
   };

   $scope.sendDatetime = function () {
      if(!$scope.activeDatetimeValid()) return;

      var item = $scope.activeDatetime;
      var entity = $scope.getItemEntity(item);

      var str = $scope.getActiveDatetimeInput();
      var dt = str.split(' ');

      var data = {entity_id: item.id};

      if(entity.attributes.has_date) data.date = dt[0];
      if(entity.attributes.has_time) data.time = dt[1] || dt[0];

      sendItemData(item, {
         type: "call_service",
         domain: "input_datetime",
         service: "set_datetime",
         service_data: data
      });
   };

   $scope.inputDatetime = function (num) {
      var entity = $scope.getItemEntity($scope.activeDatetime);

      if(!entity) return;

      var placeholder = getDatetimePlaceholder(entity);

      placeholder = placeholder.replace(/\W/gi, "");

      $scope.datetimeString = $scope.datetimeString || "";

      if($scope.datetimeString.length >= placeholder.length) return;

      $scope.datetimeString += num;
   };

   $scope.clearCharDatetime = function () {
      if($scope.datetimeString) {
         $scope.datetimeString = $scope.datetimeString
            .slice(0, $scope.datetimeString.length - 1);
      }
   };

   $scope.getActiveDatetimeInput = function () {
      var entity = $scope.getItemEntity($scope.activeDatetime);
      var placeholder = getDatetimePlaceholder(entity);

      var res = $scope.datetimeString || "";

      var i = 0;

      return placeholder.replace(/\w|\W/gi, function (match, index) {
         if(i >= res.length) return "";

         if(/\W/.test(match)) return match;

         return res[i++];
      });
   };

   $scope.getActiveDatetimePlaceholder = function () {
      var entity = $scope.getItemEntity($scope.activeDatetime);
      var placeholder = getDatetimePlaceholder(entity);

      var dt = $scope.getActiveDatetimeInput() || "";

      return placeholder.slice(dt.length);
   };

   $scope.activeDatetimeValid = function () {
      var entity = $scope.getItemEntity($scope.activeDatetime);

      if(!entity) return false;

      var placeholder = getDatetimePlaceholder(entity);

      placeholder = placeholder.replace(/\W/gi, "");

      $scope.datetimeString = $scope.datetimeString || "";

      return $scope.datetimeString.length === placeholder.length;
   };

   function getDatetimePlaceholder (entity) {
      var res = [];

      if(!entity || !entity.attributes) return null;

      if(entity.attributes.has_date) res.push("YYYY-MM-DD");
      if(entity.attributes.has_time) res.push("hh:mm");

      return res.join(" ");
   }


   /// INIT

   var realReadyState = false;

   Api.onError(function (data) {
      console.error(data);
      addError(data.message);
   });

   Api.onReady(function () {
      Api.subscribeEvents("state_changed", function (res) {
         debugLog('subscribed to state_changed', res);
      });

      Api.subscribeEvents("tileboard", function (res) {
         debugLog('subscribed to tileboard', res);
      });

      Api.getStates(function (res) {
         if(res.success) {
            debugLog(res.result);

            // in case of development, when sensors are predefined
            if(window.DEBUG_SENSORS) {
               setStates(DEBUG_SENSORS);
            }
            else {
               setStates(res.result);
            }
         }

         $scope.ready = true;
         realReadyState = true;
         callFunction(CONFIG.onReady);

         var pageNum = $location.hash();

         if (!CONFIG.rememberLastPage || !$scope.pages[pageNum]) {
            pageNum = 0;
         }

         $scope.openPage($scope.pages[pageNum], true);

         updateView();
      });
   });

   Api.onUnready(function () {
      realReadyState = false;

      //$scope.ready = false;

      //we give a timeout to prevent blinking (if reconnected)
      $timeout(function () {
         if(realReadyState === false) {
            $scope.ready = false;
         }
      }, 1000);
   });

   Api.onMessage(function (data) {
      handleMessage(data);
   });

   angular.element(window).on('view:updated', function () {
      updateView();
   });

   $scope.$watchGroup([
     'activePage.scrolledVertically',
     'activePage.scrolledHorizontally',
   ], updateView);

   function calcGroupSizes (group) {
      var maxWidth = 0;
      var maxHeight = 0;

      for (var i = 0; i < (group.items || []).length; i++) {
         var item = group.items[i];

         maxHeight = Math.max(maxHeight, item.position[1] + (item.height || 1));
         maxWidth = Math.max(maxWidth, item.position[0] + (item.width || 1));
      }

      return {
         width: maxWidth,
         height: maxHeight
      }
   }

   function getContext () {
      return {
         states: $scope.states,
         $scope: $scope,
         parseFieldValue: parseFieldValue.bind(this),
         api: Api,
         apiRequest: apiRequest.bind(this),
      };
   }

   function callFunction (func, args) {
      if(typeof func !== "function") return func;

      return func.apply(getContext(), args || []);
   }

   function apiRequest (data, callback) {
      Api.send(data, function (res) {
         updateView();

         if(callback) callback(res);
      });
   }

   function sendItemData (item, data, callback) {
      if(item.loading) return;

      item.loading = true;

      Api.send(data, function (res) {
         item.loading = false;

         updateView();

         if(callback) callback(res);
      });
   }

   function getItemFieldValue (field, item, entity) {
      var value = item;
      field.split('.').forEach(function (f) {
         value = (typeof value === 'object') ? value[f] : undefined;
      });
      return parseFieldValue(value, item, entity);
   }

   function parseFieldValue (value, item, entity) {
      if(!value) return null;

      if(typeof value === "function") return callFunction(value, [item, entity]);
      if(typeof value === "string") return parseString(value, entity);

      return value;
   }

   function parseVariable (value, entity) {
      if(value[0] === "@") return getObjectAttr(entity, value.slice(1));
      if(value[0] === "&") return getEntityAttr(value.slice(1));

      return value;
   }

   function parseString (value, entity) {
      return value.replace(/([&@][\w\d._]+)/gi, function (match, contents, offset) {
         if(match[0] === "&" && match.split('.').length < 3) return match;

         var res = parseVariable(match, entity);

         if(typeof res === "undefined") {
            if(match === value) return "";

            return match;
         }

         if(res === null) return "";

         return res;
      });
   }

   function escapeClass (text) {
      return text && typeof text === "string"
         ? text.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'non';
   }

   function getEntityAttr (str) {
      var path = str.split('.');

      if(path.length < 3) return;

      var entity = $scope.states[path.slice(0, 2).join('.')] || null;

      return getObjectAttr(entity, path.slice(2).join('.'));
   }

   function getObjectAttr (obj, path) {
      var res = obj;

      path.split('.').forEach(function (key) {
         res = typeof res === 'object' && res ? res[key] : undefined;
      });

      return res;
   }

   function setStates (states) {
      states.forEach(function (state) {
         $scope.states[state.entity_id] = state;
      });
   }

   function setNewState (key, state) {
      if(!$scope.states[key]) $scope.states[key] = state;

      for(var k in state) $scope.states[key][k] = state[k];
   }

   function checkStatesTriggers (key, state) {
      checkAlarmState(key, state);
   }

   function checkAlarmState (key, state) {
      if(key in latestAlarmActions) {
         var ts = latestAlarmActions[key];

         if(Date.now() - ts < 3000) {
            $scope.closeAlarm();
            updateView();
         }
      }
   }

   function triggerEvents (eventData) {
      if(!CONFIG.events) return;

      CONFIG.events.forEach(function (event) {
         if (eventData.command !== event.command) return;

         if (typeof event.action === "function") {
            callFunction(event.action, [eventData]);
         }
      });
   }

   function handleMessage (data) {
      if(data.type === "event") handleEvent(data.event);
   }

   function handleEvent (event) {
      try {
         if (event.event_type === "state_changed") {
            debugLog('state change', event.data.entity_id, event.data.new_state);

            setNewState(event.data.entity_id, event.data.new_state);
            checkStatesTriggers(event.data.entity_id, event.data.new_state);
         }
         else if (event.event_type === "tileboard") {
            debugLog('tileboard', event.data);

            triggerEvents(event.data);
         }
      }
      catch (e) {console.error(e);}
      updateView();
   }

   function addError (error) {
      if(!CONFIG.ignoreErrors) Noty.addObject({
         type: Noty.ERROR,
         title: 'Error',
         message: error,
         lifetime: 10
      });
   }

   function warnUnknownItem(item) {
      var notyId = item.id + '_not_found';
      if(!CONFIG.ignoreErrors && !Noty.hasSeenNoteId(notyId)) {
         Noty.addObject({
            type: Noty.WARNING,
            title: 'Entity not found',
            message: 'Entity "' + item.id + '" not found',
            id: notyId
         });
      }
   }

   function debugLog () {
      if(CONFIG.debug) {
         console.log.apply(console, [].slice.call(arguments));
      }
   }

   function updateView () {
      if(!$scope.$$phase) $scope.$apply();
   }

   window.openPage = function (page) {
      $scope.openPage(page);
      updateView();
   };

   window.setScreensaverShown = function (state) {
      $scope.screensaverShown = state;

      updateView();
   };

   function pingConnection () {
      if(!$scope.ready || realReadyState === false) return; // no reason to ping if unready was fired

      var timeout = 3000;

      var success = false;

      Api.sendPing(function (res) {
         if('id' in res) success = true;
      });

      $timeout(function () {
         if(success) return;

         realReadyState = false;

         var noty = Noty.addObject({
            type: Noty.WARNING,
            title: 'Ping unsuccessful',
            message: 'Trying to reconnect',
         });

         Api.forceReconnect();

         var destroy = Api.onReady(function () {
            destroy();

            if(noty) noty.remove();

            Noty.addObject({
               type: Noty.SUCCESS,
               title: 'Reconnection',
               message: 'Reconnection successful',
               lifetime: 1,
            });

         });  
      }, timeout);
   }

   if(CONFIG.pingConnection !== false) {
      setInterval(pingConnection, 5000);

      window.addEventListener("focus", function () {
         pingConnection();
      });
   }
}]);
