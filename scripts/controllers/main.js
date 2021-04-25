import angular from 'angular';
import Hammer from 'hammerjs';
import { calculateGridPageRowIndexes, mergeConfigDefaults, mergeTileConfigs, mergeTileDefaults } from './main-utilities';
import { App } from '../app';
import { TYPES, FEATURES, HEADER_ITEMS, MENU_POSITIONS, CUSTOM_THEMES, GROUP_ALIGNS, TRANSITIONS, MAPBOX_MAP, YANDEX_MAP, DEFAULT_SLIDER_OPTIONS, DEFAULT_LIGHT_SLIDER_OPTIONS, DEFAULT_VOLUME_SLIDER_OPTIONS, DEFAULT_POPUP_HISTORY, DEFAULT_POPUP_IFRAME, DEFAULT_POPUP_DOOR_ENTRY } from '../globals/constants';
import { debounce, leadZero, supportsFeature, toAbsoluteServerURL } from '../globals/utils';
import Noty from '../models/noty';

App.controller('Main', function ($scope, $timeout, $location, Api, tmhDynamicLocale, $filter, amMoment) {
   if (!window.CONFIG) {
      return;
   }

   const CONFIG = window.CONFIG;

   const locale = (CONFIG.locale || 'en-us').toLowerCase();
   tmhDynamicLocale
      .set(locale)
      .catch(() => {
         Noty.add(Noty.ERROR, 'Failed loading locale', `Could not find corresponding file for locale "${locale}" in the /locales/ directory.`);
      })
      .then(() => {
         amMoment.changeLocale(locale);
      });

   if (CONFIG.groupsAlign === GROUP_ALIGNS.GRID && [CUSTOM_THEMES.MOBILE, CUSTOM_THEMES.WINPHONE].includes(CONFIG.customTheme)) {
      CONFIG.groupsAlign = GROUP_ALIGNS.HORIZONTALLY;
   }

   $scope.pages = mergeConfigDefaults(CONFIG.pages);
   $scope.hasGridAlignment = CONFIG.groupsAlign === GROUP_ALIGNS.GRID;
   if ($scope.hasGridAlignment) {
      for (const page of $scope.pages) {
         page.rowIndexes = calculateGridPageRowIndexes(page);
      }
   }

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
   $scope.activePopup = null;
   $scope.popupTimeout = null;

   $scope.alarmCode = null;
   $scope.activeAlarm = null;

   $scope.supportsFeature = supportsFeature;

   let showedPages = [];

   const latestAlarmActions = {};
   let bodyClass = null;
   const mainStyles = {};
   let activePage = null;
   let cameraList = null;

   for (const page of $scope.pages) {
      for (const group of page.groups) {
         if (group.onLayout) {
            $scope.$watchCollection(
               () => group.items,
               () => group.onLayout(page, group));
         }
      }
   }

   const ghostCoordinates = [];
   document.addEventListener('click', preventGhostClick, true);

   function addGhost (coordinates) {
      const timeout = 500;
      ghostCoordinates.push(coordinates);
      $timeout(popGhost, timeout);
   }

   function popGhost () {
      ghostCoordinates.splice(0, 1);
   }

   function preventGhostClick ($event) {
      const threshold = 25;
      for (const coordinates of ghostCoordinates) {
         const [x, y] = coordinates;

         if (Math.abs($event.clientX - x) < threshold && Math.abs($event.clientY - y) < threshold) {
            $event.stopPropagation();
            $event.preventDefault();
            break;
         }
      }
   }

   function innerHeightToCSS () {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
   }
   innerHeightToCSS();
   window.addEventListener('resize', debounce(innerHeightToCSS, 250));

   $scope.entityClick = function (page, item, entity) {
      if (item.action === false) {
         return;
      }

      if (typeof item.action === 'function') {
         return callFunction(item.action, [item, entity]);
      }
   };

   $scope.entityLongPress = function ($event, page, item, entity) {
      addGhost([$event.changedPointers[0].clientX, $event.changedPointers[0].clientY]);

      if (item.secondaryAction === false) {
         return;
      }

      if (typeof item.secondaryAction === 'function') {
         return callFunction(item.secondaryAction, [item, entity]);
      }

      if (item.history || entity && entity.entity_id) {
         return $scope.openPopupHistory(item, entity);
      }
   };

   $scope.getBodyClass = function () {
      if (!bodyClass) {
         bodyClass = [];

         if (CONFIG.customTheme) {
            let themes = CONFIG.customTheme;

            if (typeof themes === 'string') {
               themes = [themes];
            }

            themes.forEach(function (theme) {
               bodyClass.push('-theme-' + theme);
            });
         }

         if (CONFIG.entitySize) {
            bodyClass.push('-' + CONFIG.entitySize + '-entity');
         }

         const menuPos = CONFIG.menuPosition || MENU_POSITIONS.LEFT;
         const groupsAlign = CONFIG.groupsAlign || GROUP_ALIGNS.HORIZONTALLY;

         bodyClass.push('-menu-' + menuPos);
         bodyClass.push('-groups-align-' + groupsAlign);

         if (CONFIG.hideScrollbar) {
            bodyClass.push('-hide-scrollbar');
         }
      }

      const scrollClasses = [];

      if (activePage) {
         if (activePage.scrolledHorizontally) {
            scrollClasses.push('-scrolled-horizontally');
         }

         if (activePage.scrolledVertically) {
            scrollClasses.push('-scrolled-vertically');
         }
      }

      return bodyClass.concat(scrollClasses);
   };


   $scope.getItemEntity = function (item) {
      if (typeof item.id === 'object') {
         return item.id;
      }

      if (!(item.id in $scope.states)) {
         warnUnknownItem(item);
         return null;
      }

      return $scope.states[item.id];
   };

   $scope.getCameraEntityFullscreen = function (item) {
      let entityId = getItemFieldValue('fullscreen.id', item, {});

      if (entityId === null) {
         entityId = item.id;
      }

      if (typeof entityId === 'object') {
         return entityId;
      }

      return $scope.states[entityId];
   };

   $scope.showPage = function (page) {
      return showedPages.indexOf(page) !== -1;
   };


   $scope.hasTrackerCoords = function (entity) {
      if (!entity.attributes) {
         return false;
      }

      return entity.attributes.longitude || entity.attributes.latitude;
   };

   $scope.slideMapStyles = function (item, page, obj, zoom, state) {
      const key = 'mapStyles' + zoom + (item.width || '1') + (item.height || '1');

      if (!obj[key]) {
         const width = item.width || 1;
         const height = item.height || 1;
         const tileSize = page.tileSize || CONFIG.tileSize;
         const name = obj.friendly_name || ' ';

         if (!obj.longitude && !obj.latitude) {
            return null;
         }

         let coords = obj.longitude + ',' + obj.latitude;
         let mapWidth = Math.ceil(tileSize * width);
         let mapHeight = Math.ceil((tileSize * height) + 80); // +80 is a hack to hide the logo

         let url;
         let label;
         let marker;

         if (item.map === YANDEX_MAP) {
            let icon = 'round';

            if (state.toLowerCase() === 'home') {
               icon = 'home';
            } else if (state.toLowerCase() === 'office') {
               icon = 'work';
            }
            // Yandex allows max 650x450px
            mapWidth = Math.min(mapWidth, 650);
            mapHeight = Math.min(mapHeight, 450);

            const pt = coords + ',' + icon;

            url = 'https://static-maps.yandex.ru/1.x/?lang=en-US&ll='
               + coords + '&z=' + zoom + '&l=map&size=' + mapWidth + ',' + mapHeight + '&pt=' + pt;
         } else if (item.map === MAPBOX_MAP) {
            // MapBox allows max 1280x1280px
            mapWidth = Math.min(mapWidth, 1280);
            mapHeight = Math.min(mapHeight, 1280);

            coords = obj.longitude + ',' + obj.latitude;

            label = name[0].toLowerCase();
            marker = 'pin-s-' + label + '(' + obj.longitude + ',' + obj.latitude + ')';
            let style = 'mapbox/streets-v11';

            if (CONFIG.mapboxStyle) {
               const styleGroups = /^mapbox:\/\/styles\/(.+)$/.exec(CONFIG.mapboxStyle);
               if (styleGroups.length > 1) {
                  style = styleGroups[1];
               }
            }

            url = 'https://api.mapbox.com/styles/v1/' + style + '/static/'
               + marker + '/' + coords + ',' + zoom + ',0/' + mapWidth + 'x' + mapHeight + '@2x';

            if (CONFIG.mapboxToken) {
               url += '?access_token=' + CONFIG.mapboxToken;
            }
         } else {
            coords = obj.latitude + ',' + obj.longitude;

            label = name[0].toUpperCase();
            marker = encodeURIComponent('color:gray|label:' + label + '|' + coords);

            url = 'https://maps.googleapis.com/maps/api/staticmap?center='
               + coords + '&zoom=' + zoom + '&size=' + mapWidth + 'x' + mapHeight + '&scale=2&maptype=roadmap&markers=' + marker;

            if (CONFIG.googleApiKey) {
               url += '&key=' + CONFIG.googleApiKey;
            }
         }

         obj[key] = { backgroundImage: 'url(\'' + url + '\')' };
      }

      return obj[key];
   };

   $scope.clockStyles = function () {
      return CONFIG.clockStyles;
   };

   $scope.pageStyles = function (page, index) {
      if (!page.styles) {
         const styles = {};

         if (page.bg) {
            const bg = parseFieldValue(page.bg, page, {});

            if (bg) {
               styles.backgroundImage = 'url("' + bg + '")';
            }
         } else if (page.bgSuffix) {
            const sbg = parseFieldValue(page.bgSuffix, page, {});

            if (sbg) {
               styles.backgroundImage = 'url("' + toAbsoluteServerURL(sbg) + '")';
            }
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
      let position = CONFIG.menuPosition;

      if (!position) {
         position = MENU_POSITIONS.LEFT;
      }

      return '-' + position;
   };

   $scope.trackerZoomLevels = function (item, entity) {
      if (!entity.zoomLevels) {
         entity.zoomLevels = [9, 13];

         if (item.zoomLevels) {
            entity.zoomLevels = item.zoomLevels;
         }
      }

      return entity.zoomLevels;
   };

   $scope.trackerSlidesClass = function (item, entity) {
      const maps = $scope.trackerZoomLevels(item, entity);

      let c = maps.length;

      if ($scope.showTrackerBg(item, entity)) {
         c++;
      }

      return '-c' + c;
   };

   $scope.trackerBg = function (entity) {
      if (!entity.trackerBg) {
         const styles = {};

         if (entity.attributes.entity_picture) {
            styles.backgroundImage = 'url("' + toAbsoluteServerURL(entity.attributes.entity_picture) + '")';
         }

         entity.trackerBg = styles;
      }

      return entity.trackerBg;
   };

   $scope.showTrackerBg = function (item, entity) {
      if (!entity.attributes.entity_picture) {
         return false;
      }

      return !item.hideEntityPicture;
   };

   $scope.groupStyles = function (group, page) {
      if (!group.styles) {
         const tileSize = page.tileSize || CONFIG.tileSize;
         const tileMargin = page.tileMargin || CONFIG.tileMargin;

         if (!('width' in group) || !('height' in group)) {
            const sizes = calcGroupSizes(group);

            if (!group.width) {
               group.width = sizes.width;
            }
            if (!group.height) {
               group.height = sizes.height;
            }
         }

         const styles = {
            width: tileSize * group.width + tileMargin * (group.width - 1) + 'px',
            height: tileSize * group.height + tileMargin * (group.height - 1) + 'px',
         };

         if (page.groupMarginCss) {
            styles.margin = page.groupMarginCss;
         } else if (group.groupMarginCss) {
            styles.margin = group.groupMarginCss;
         } else if (CONFIG.groupMarginCss) {
            styles.margin = CONFIG.groupMarginCss;
         }

         group.styles = styles;
      }

      return group.styles;
   };

   $scope.effectiveTileSize = function (page, item) {
      const tileSize = page.tileSize || CONFIG.tileSize;
      return {
         height: (item.height || 1) * tileSize,
         width: (item.width || 1) * tileSize,
      };
   };

   $scope.sliderStyles = function (page, item) {
      return cacheInItem(item, '_c_slider_styles', function () {
         const styles = {};

         if (item.vertical) {
            const width = item.width || 1;
            const height = item.height || 1;
            const tileSize = page.tileSize || CONFIG.tileSize;
            const tileMargin = page.tileMargin || CONFIG.tileMargin;

            const itemWidth = tileSize * width + tileMargin * (width - 1);
            const itemHeight = tileSize * height + tileMargin * (height - 1);

            // defines free space used by icon
            const iconSpacer = item.icon ? 0 : 35;

            // if `item.slider.sliderHeight` is defined - set SIZE to custom value
            // if `item.slider.sliderHeight` is not defined: make calculation and compare if it greater than (0/20).
            // This prevents:
            //  - to show very small sliders
            //  - negative values, which can break alignment
            // If the user would like to override automatic calculation, an appropriate option has to be defined.
            const sliderWidth = item.slider.sliderWidth || Math.max(0, itemWidth - 30);
            const sliderHeight = item.slider.sliderHeight || (x => x > 22 ? x : 0)(itemHeight - 100 + iconSpacer);

            styles.width = sliderHeight + 'px';
            styles.height = sliderWidth + 'px';
            styles.top = sliderHeight / 2 - sliderWidth / 2 + 'px';
            styles.right = sliderWidth / 2 - sliderHeight / 2 + 'px';
         } else {
            styles.width = item.slider.sliderWidth ? item.slider.sliderWidth + 'px' : '80%';
            styles.height = item.slider.sliderHeight ? item.slider.sliderHeight + 'px' : '1rem';
         }
         return styles;
      });
   };

   $scope.itemStyles = function (page, item, entity) {
      const prevSize = item._prevTileSize || page.tileSize || CONFIG.tileSize;
      const currentSize = page.tileSize || CONFIG.tileSize;
      const hasChanged = prevSize !== currentSize;

      if (!item.styles || hasChanged) {
         const width = item.width || 1;
         const height = item.height || 1;
         const pos = item.position;
         const tileSize = page.tileSize || CONFIG.tileSize;
         const tileMargin = page.tileMargin || CONFIG.tileMargin;

         item._prevTileSize = tileSize;

         const styles = {
            width: tileSize * width + tileMargin * (width - 1) + 'px',
            height: tileSize * height + tileMargin * (height - 1) + 'px',
            left: pos[0] * tileSize + (tileMargin * pos[0]) + 'px',
            top: pos[1] * tileSize + (tileMargin * pos[1]) + 'px',
         };

         item.styles = styles;
      }

      if (item.customStyles) {
         let res;

         if (typeof item.customStyles === 'function') {
            res = callFunction(item.customStyles, [item, entity]);
         } else if (typeof item.customStyles === 'object') {
            res = item.customStyles;
         }
         if (res) {
            for (const k in res) {
               item.styles[k] = res[k];
            }
         }
      }

      return item.styles;
   };

   $scope.itemBgStyles = function (item, entity) {
      const bg = getItemFieldValue('bg', item, entity);
      const bgSuffix = getItemFieldValue('bgSuffix', item, entity);
      const opacity = getItemFieldValue('bgOpacity', item, entity);

      return {
         opacity: opacity || null,
         backgroundImage: bg ? `url("${bg}")`
            : bgSuffix ? `url("${toAbsoluteServerURL(bgSuffix)}")` : null,
      };
   };

   $scope.itemClasses = function (item, entity) {
      if (!item._classes) {
         item._classes = [];
      }

      item._classes.length = 0;

      item._classes.push('-' + item.type);
      item._classes.push('-' + escapeClass(entity.state));

      if (item.theme) {
         item._classes.push('-th-' + item.theme);
      } else {
         item._classes.push('-th-' + item.type);
      }

      let itemClasses = getItemFieldValue('classes', item, entity);
      if (itemClasses) {
         if (!Array.isArray(itemClasses)) {
            itemClasses = [itemClasses];
         }
         item._classes.push(...itemClasses);
      }

      if (item.loading) {
         item._classes.push('-loading');
      }
      if ($scope.selectOpened(item)) {
         item._classes.push('-top-entity');
      }
      if (item.action) {
         item._classes.push('-clickable');
      }

      return item._classes;
   };

   $scope.entityState = function (item, entity) {
      if (item.state === false) {
         return null;
      }

      if (typeof item.state !== 'undefined') {
         if (typeof item.state === 'string') {
            const state = parseString(item.state, entity);
            if (item.states !== null && typeof item.states === 'object') {
               return item.states[state] || state;
            } else {
               return state;
            }
         } else if (typeof item.state === 'function') {
            return callFunction(item.state, [item, entity]);
         } else {
            return item.state;
         }
      }

      if (typeof item.states === 'function') {
         return callFunction(item.states, [item, entity]);
      } else if (item.states !== null && typeof item.states === 'object') {
         return item.states[entity.state] || entity.state;
      }

      const unit = entity.attributes ? entity.attributes.unit_of_measurement : '';
      return entity.state + (unit ? ' ' + unit : '');
   };

   $scope.entityIcon = function (item, entity) {
      let state = parseFieldValue(entity.state, item, entity);

      if (!state && item.state) {
         state = parseFieldValue(item.state, item, entity);
      }

      if (item.icon) {
         state = parseFieldValue(item.icon, item, entity);
      }

      if (!item.icons) {
         return state;
      }

      if (typeof item.icons === 'function') {
         return callFunction(item.icons, [item, entity]);
      }

      return item.icons[state] || null;
   };

   $scope.entityTitle = function (item, entity) {
      if (!('title' in item)) {
         return entity.attributes ? entity.attributes.friendly_name : null;
      }

      return getItemFieldValue('title', item, entity);
   };

   $scope.itemField = function (field, item, entity) {
      return getItemFieldValue(field, item, entity);
   };

   $scope.entityUnit = function (item, entity) {
      if (!('unit' in item)) {
         return entity.attributes ? entity.attributes.unit_of_measurement : null;
      }

      return getItemFieldValue('unit', item, entity);
   };

   $scope.entitySubtitle = function (item, entity) {
      return getItemFieldValue('subtitle', item, entity);
   };

   $scope.entityValue = function (item, entity) {
      let value = entity.state;

      if (item.value) {
         value = getItemFieldValue('value', item, entity);
      }

      if (typeof item.filter === 'function') {
         return callFunction(item.filter, [value, item, entity]);
      }

      return value;
   };

   $scope.filterNumber = function (number, precision) {
      return $filter('number')(number, precision);
   };

   $scope.listField = function (field, item, list) {
      const value = parseFieldValue(list[field], item, list);

      if (typeof item.filter === 'function') {
         return callFunction(item.filter, [value, field, item]);
      }

      return value;
   };

   $scope.getWeatherField = function (field, item, entity) {
      const fields = item.fields;

      if (!fields || !fields[field]) {
         return null;
      }

      return parseFieldValue(fields[field], item, entity);
   };

   $scope.getWeatherLine = function (line, item, entity) {
      if (!line) {
         return null;
      }

      return parseFieldValue(line, item, entity);
   };

   $scope.getWeatherIcon = function (item, entity) {
      let icon;

      if (item.icon || item.icons) {
         icon = $scope.entityIcon(item, entity);
      }

      if (!icon) {
         icon = $scope.getWeatherField('icon', item, entity);

         if (icon) {
            console.warn(
               '`icon` field inside fields is deprecated for WEATHER tile, ' +
               'please move it to the tile object');
         }
      }

      if (!icon) {
         return null;
      }

      let map = item.icons;

      if (!map && item.fields.iconMap) {
         map = item.fields.iconMap;

         if (icon) {
            console.warn(
               '`iconMap` field inside fields is deprecated for WEATHER tile, ' +
               'please move it to the tile object as `icons`');
         }
      }

      if (typeof map === 'function') {
         return callFunction(map, [icon, item, entity]);
      }

      if (!map) {
         return icon;
      }

      return map[icon] || icon;
   };

   $scope.getWeatherImageStyles = function (item, entity) {
      if (!item.iconImage) {
         return null;
      }

      let iconImage = parseFieldValue(item.iconImage, item, entity);

      if (typeof item.icons === 'function') {
         iconImage = callFunction(item.icons, [iconImage, item, entity]);
      }

      if (item.icons && (iconImage in item.icons)) {
         iconImage = item.icons[iconImage];
      }

      if (!iconImage) {
         return null;
      }

      if (!item._imgStyles) {
         item._imgStyles = {};
      }

      item._imgStyles.backgroundImage = 'url("' + iconImage + '")';

      return item._imgStyles;
   };

   $scope.weatherListField = function (field, line, item, entity) {
      if (!line || !line[field]) {
         return null;
      }

      return parseFieldValue(line[field], item, entity);
   };

   $scope.weatherListIcon = function (line, item, entity) {
      const icon = $scope.weatherListField('icon', line, item, entity);

      if (!icon) {
         return null;
      }

      if (typeof item.icons === 'function') {
         return callFunction(item.icons, [icon, item, entity]);
      }

      if (!item.icons) {
         return icon;
      }

      return item.icons[icon] || icon;
   };

   $scope.weatherListImageStyles = function (line, item, entity) {
      let iconImage = $scope.weatherListField('iconImage', line, item, entity);

      if (!iconImage) {
         return null;
      }

      if (typeof item.icons === 'function') {
         iconImage = callFunction(item.icons, [iconImage, item, entity]);
      }

      if (item.icons && (iconImage in item.icons)) {
         iconImage = item.icons[iconImage];
      }

      if (!iconImage) {
         return null;
      }

      if (!line._imgStyles) {
         line._imgStyles = {};
      }

      line._imgStyles.backgroundImage = 'url("' + iconImage + '")';

      return line._imgStyles;
   };

   $scope.slidesStyles = function (item, $index) {
      if (!item.slidesStyles) {
         item.slidesStyles = {
            'animation-delay': ((item.slidesDelay || $index * 0.8)) + 's',
         };

         if ('bgOpacity' in item) {
            item.slidesStyles.opacity = item.bgOpacity;
         }
      }

      return item.slidesStyles;
   };

   $scope.slideStyles = function (slide, item, entity) {
      if (!slide.slideStyles) {
         const styles = {};

         if (slide.bg) {
            const bg = parseFieldValue(slide.bg, item, entity);

            if (bg) {
               styles.backgroundImage = 'url(' + bg + ')';
            }
         }

         slide.slideStyles = styles;
      }

      return slide.slideStyles;
   };

   $scope.itemSelectStyles = function (entity, items) {
      if (!entity.itemSelectStyles) {
         const styles = {};

         if (items) {
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
      if (!page) {
         return CONFIG.header;
      }

      return page.header;
   };

   function toSafeNumber (value) {
      return !isNaN(+value) ? +value : null;
   }

   function initSliderConf (item, entity, config, defaults) {
      const key = '_c_slider_' + (config.field || defaults.field);

      return cacheInItem(item, key, function () {
         $timeout(function () {
            item._sliderInited = true;
         }, 50);
         $timeout(function () {
            config._sliderInited = true;
         }, 100);

         const attrs = entity.attributes || {};
         const sliderConf = {
            min: config.min ?? attrs.min ?? defaults.min,
            max: config.max ?? attrs.max ?? defaults.max,
            step: config.step || attrs.step || defaults.step,
            request: config.request || defaults.request,
            curValue: undefined, // current value received from HA
            oldValue: undefined, // last value received from HA
            newValue: undefined, // new value set by the user through the slider
            value: undefined, // the most current value from all the above
         };
         sliderConf.getSetValue = function (newValue) {
            if (arguments.length) {
               sliderConf.newValue = newValue;
               sliderConf.value = newValue;
            } else {
               const { attributes, state } = entity;
               sliderConf.curValue = toSafeNumber(+attributes[config.field]) ?? toSafeNumber(+attributes[defaults.field]) ?? toSafeNumber(+state)
                  ?? config.value ?? defaults.value
                  ?? config.min ?? attributes.min ?? defaults.min ?? 0;
               if (sliderConf.oldValue !== sliderConf.curValue) {
                  sliderConf.oldValue = sliderConf.curValue;
                  sliderConf.value = sliderConf.curValue;
               }
            }
            return sliderConf.value;
         };
         return sliderConf;
      });
   }

   $scope.getSliderConf = function (item, entity) {
      const config = item.slider || {};
      return initSliderConf(item, entity, config, DEFAULT_SLIDER_OPTIONS);
   };

   $scope.getLightSliderConf = function (item, entity, slider) {
      const config = slider || {};
      return initSliderConf(item, entity, config, DEFAULT_LIGHT_SLIDER_OPTIONS);
   };

   $scope.getVolumeConf = function (item, entity) {
      if (!('volume_level' in entity.attributes)) {
         return false;
      }
      return initSliderConf(item, entity, { }, DEFAULT_VOLUME_SLIDER_OPTIONS);
   };

   $scope.getSliderValue = function (item, entity, conf) {
      let value = conf.value;

      if (item.slider.formatValue) {
         value = item.slider.formatValue(conf);
      }

      if (typeof item.filter === 'function') {
         return callFunction(item.filter, [value, item, entity]);
      }

      return value;
   };

   $scope.getLightSliderValue = function (slider, conf) {
      if (slider.formatValue) {
         return slider.formatValue(conf);
      }

      return conf.value;
   };

   $scope.openLightSliders = function (item, entity) {
      if ((!item.sliders || !item.sliders.length) && !$scope.itemField('colorpicker', item, entity)) {
         return;
      }

      if (entity.state !== 'on') {
         return $scope.toggleSwitch(item, entity, function () {
            $timeout(function () {
               if (entity.state === 'on') {
                  $scope.openLightSliders(item, entity);
               }
            }, 0);
         });
      } else if (!item.controlsEnabled) {
         item.controlsEnabled = true;

         $timeout(function () {
            item._controlsInited = true;
         }, 50);
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

   $scope.shouldShowVolumeSlider = function (entity) {
      return supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_SET, entity)
          && ('volume_level' in entity.attributes)
          && entity.state !== 'off';
   };

   $scope.shouldShowVolumeButtons = function (entity) {
      return (!supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_SET, entity)
          || !('volume_level' in entity.attributes))
          && supportsFeature(FEATURES.MEDIA_PLAYER.VOLUME_STEP, entity)
          && entity.state !== 'off';
   };

   $scope.getGaugeField = function (field, item, entity) {
      return getItemFieldValue(`settings.${field}`, item, entity);
   };

   $scope.itemURL = function (item, entity) {
      if (typeof item.url === 'function') {
         return callFunction(item.url, [item, entity]);
      }

      return item.url;
   };

   // Actions

   const setSliderValue = debounce(setSliderValueFn, 250);

   function setSliderValueFn (item, entity, sliderConf) {
      const { request, newValue } = sliderConf;

      if (!request) {
         return;
      }

      const serviceData = {};
      serviceData[request.field] = newValue;

      callService(item, request.domain, request.service, serviceData);
   }

   $scope.sliderChanged = function (item, entity, sliderConf) {
      if (!item._sliderInited) {
         return;
      }

      setSliderValue(item, entity, sliderConf);
   };

   $scope.volumeChanged = function (item, entity, sliderConf) {
      if (!item._sliderInited) {
         return;
      }

      setSliderValue(item, entity, sliderConf);
   };

   $scope.lightSliderChanged = function (item, entity, slider, sliderConf) {
      if (!item._controlsInited || !item._sliderInited || !slider._sliderInited) {
         return;
      }

      setSliderValue(item, entity, sliderConf);
   };

   $scope.toggleSwitch = function (item, entity, callback) {
      if (item.type === TYPES.LIGHT && item.controlsEnabled) {
         return;
      }
      let domain = 'homeassistant';
      const group = item.id.split('.')[0];

      if (['switch', 'light', 'fan'].indexOf(group) !== -1) {
         domain = group;
      }

      let service = 'toggle';

      if (entity.state === 'off') {
         service = 'turn_on';
      } else if (entity.state === 'on') {
         service = 'turn_off';
      }

      callService(item, domain, service, {}, callback);
   };

   $scope.dimmerToggle = function (item, entity, callback) {
      if (item.action) {
         callFunction(item.action, [item, entity, callback]);
      } else if (angular.isString(item.id) && entity) {
         $scope.toggleSwitch(item, entity, callback);
      }
   };

   $scope.dimmerAction = function (action, $event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      const func = 'action' + (action === 'plus' ? 'Plus' : 'Minus');

      if (item[func]) {
         callFunction(item[func], [item, entity, $event]);
      }

      return false;
   };

   $scope.toggleLock = function (item, entity) {
      let service;

      if (entity.state === 'locked') {
         service = 'unlock';
      } else if (entity.state === 'unlocked') {
         service = 'lock';
      }

      callService(item, 'lock', service, {});
   };

   $scope.toggleVacuum = function (item, entity) {
      let service;
      if (entity.state === 'off') {
         service = 'turn_on';
      } else if (entity.state === 'on') {
         service = 'turn_off';
      } else if (['idle', 'docked', 'paused'].indexOf(entity.state) !== -1) {
         service = 'start';
      } else if (entity.state === 'cleaning') {
         service = 'return_to_base';
      }

      callService(item, 'vacuum', service, {});
   };

   $scope.triggerAutomation = function (item, entity) {
      callService(item, 'automation', 'trigger', {});
   };

   $scope.sendPlayer = function (service, item, entity) {
      callService(item, 'media_player', service, {});
   };

   $scope.mutePlayer = function (muteState, item, entity) {
      callService(item, 'media_player', 'volume_mute', { is_volume_muted: muteState });
   };

   $scope.callScript = function (item, entity) {
      let variables;

      if (typeof item.variables === 'function') {
         variables = callFunction(item.variables, [item, entity]);
      } else {
         variables = item.variables || {};
      }

      const serviceData = {
         variables: variables,
      };

      callService(item, 'script', 'turn_on', serviceData);
   };

   $scope.callScene = function (item, entity) {
      callService(item, 'scene', 'turn_on', {});
   };

   $scope.increaseBrightness = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      if (entity.state === 'off') {
         return false;
      }

      if (!('brightness' in entity.attributes)) {
         return addError('No brightness field in object');
      }

      let brightness = +entity.attributes.brightness + 25.5;

      brightness = Math.min(brightness, 255);

      $scope.setLightBrightness(item, brightness);

      return false;
   };

   $scope.decreaseBrightness = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      if (entity.state === 'off') {
         return false;
      }

      if (!('brightness' in entity.attributes)) {
         return addError('No brightness field in object');
      }

      let brightness = +entity.attributes.brightness - 25.5;

      brightness = Math.max(brightness, 1);

      $scope.setLightBrightness(item, brightness);

      return false;
   };

   $scope.increaseNumber = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      let value = parseFloat(entity.state);

      value += (entity.attributes.step || 1);

      if (entity.attributes.max) {
         value = Math.min(value, entity.attributes.max);
      }

      $scope.setInputNumber(item, value);

      return false;
   };

   $scope.decreaseNumber = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      let value = parseFloat(entity.state);

      value -= (entity.attributes.step || 1);

      if (entity.attributes.min) {
         value = Math.max(value, entity.attributes.min);
      }

      $scope.setInputNumber(item, value);

      return false;
   };

   $scope.setLightBrightness = function (item, brightness) {
      const serviceData = {
         brightness_pct: Math.round(brightness / 255 * 100 / 10) * 10,
      };

      callService(item, 'light', 'turn_on', serviceData);
   };

   $scope.getRGBStringFromArray = function (color) {
      if (!color) {
         return null;
      }
      return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
   };

   $scope.getRGBArrayFromString = function (color) {
      if (!color || color.indexOf('rgb') !== 0) {
         return null;
      }

      let colorValues;

      if (color.indexOf('rgba') === 0) {
         colorValues = color.substring(color.indexOf('(') + 1, color.lastIndexOf(',')).split(',');
      } else {
         colorValues = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',');
      }

      return [parseInt(colorValues[0]), parseInt(colorValues[1]), parseInt(colorValues[2])];
   };

   $scope.setLightColor = function (item, color) {
      const colors = $scope.getRGBArrayFromString(color);

      if (colors) {
         callService(item, 'light', 'turn_on', { rgb_color: colors });
      }
   };

   $scope.$on('colorpicker-colorupdated', function (event, data) {
      $scope.setLightColor(data.item, data.color);
   });

   $scope.setInputNumber = function (item, value) {
      callService(item, 'input_number', 'set_value', { value: value });
   };

   $scope.setSelectOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      callService(item, 'input_select', 'select_option', { option: option });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.setSourcePlayer = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      callService(item, 'media_player', 'select_source', { source: option });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.climateTarget = function (item, entity) {
      const value = entity.attributes.temperature || [
         entity.attributes.target_temp_low,
         entity.attributes.target_temp_high,
      ].join(' - ');

      if (item.filter) {
         return item.filter(value);
      }

      return value;
   };

   $scope.reverseLookupClimateOption = function (item, entity, option) {
      initializeClimateOptions(item, entity);
      for (const [key, value] of Object.entries(item.climateOptions)) {
         if (value === option) {
            return key;
         }
      }
      return option;
   };

   $scope.lookupClimateOption = function (item, entity, option) {
      initializeClimateOptions(item, entity);
      return item.climateOptions[option] || option;
   };

   function initializeClimateOptions (item, entity) {
      if (typeof item.climateOptions === 'undefined') {
         const options = item.useHvacMode ? entity.attributes.hvac_modes : entity.attributes.preset_modes;
         const resolvedOption = {};
         for (const option of options) {
            if (item.states !== null && typeof item.states === 'object') {
               resolvedOption[option] = item.states[option] || option;
            } else {
               resolvedOption[option] = option;
            }
         }
         item.climateOptions = resolvedOption;
      }
   }

   $scope.getClimateOptions = function (item, entity) {
      initializeClimateOptions(item, entity);
      return item.climateOptions;
   };

   $scope.getClimateCurrentOption = function (item, entity) {
      const option = item.useHvacMode ? entity.state : entity.attributes.preset_mode;
      return $scope.lookupClimateOption(item, entity, option);
   };

   $scope.setClimateOption = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      let service;
      const serviceData = {};
      const resolvedOption = $scope.reverseLookupClimateOption(item, entity, option);

      if (item.useHvacMode) {
         service = 'set_hvac_mode';
         serviceData.hvac_mode = resolvedOption;
      } else {
         service = 'set_preset_mode';
         serviceData.preset_mode = resolvedOption;
      }

      callService(item, 'climate', service, serviceData);

      $scope.closeActiveSelect();

      return false;
   };


   $scope.increaseClimateTemp = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      let value = parseFloat(entity.attributes.temperature);

      value += (entity.attributes.target_temp_step || 1);

      if (entity.attributes.max_temp) {
         value = Math.min(value, entity.attributes.max_temp);
      }

      $scope.setClimateTemp(item, value);

      return false;
   };

   $scope.decreaseClimateTemp = function ($event, item, entity) {
      $event.preventDefault();
      $event.stopPropagation();

      let value = parseFloat(entity.attributes.temperature);

      value -= (entity.attributes.target_temp_step || 1);

      if (entity.attributes.min_temp) {
         value = Math.max(value, entity.attributes.min_temp);
      }

      $scope.setClimateTemp(item, value);

      return false;
   };

   $scope.setClimateTemp = function (item, value) {
      callService(item, 'climate', 'set_temperature', { temperature: value });
   };

   $scope.sendCover = function (service, item, entity) {
      callService(item, 'cover', service, {});
   };

   $scope.toggleCover = function (item, entity) {
      let service;

      if (entity.state === 'open') {
         service = 'close_cover';
      } else if (entity.state === 'closed') {
         service = 'open_cover';
      }

      if (service) {
         $scope.sendCover(service, item, entity);
      }
   };

   $scope.openFanSpeedSelect = function ($event, item) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.openSelect(item);
   };

   $scope.setFanSpeed = function ($event, item, entity, option) {
      $event.preventDefault();
      $event.stopPropagation();

      callService(item, 'fan', 'set_speed', { speed: option });

      $scope.closeActiveSelect();

      return false;
   };

   $scope.actionAlarm = function (action, item, entity) {
      const code = $scope.alarmCode;

      const serviceData = {};

      if (code) {
         serviceData.code = code;
      }

      latestAlarmActions[item.id] = Date.now();

      callService(item, 'alarm_control_panel', action, serviceData);

      $scope.alarmCode = null;
   };


   // UI

   $scope.openPage = function (page, preventAnimation) {
      preventAnimation = preventAnimation || false;
      showedPages = [];

      if (activePage) {
         showedPages = [activePage];
      }

      showedPages.push(page);

      activePage = page;

      if (CONFIG.transition === TRANSITIONS.SIMPLE) {
         // Do nothing
      } else {
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

      if (entity.attributes && entity.attributes.has_date) {
         const d = new Date();

         $scope.datetimeString = d.getFullYear() + '';
         $scope.datetimeString += leadZero(d.getMonth() + 1);
         $scope.datetimeString += leadZero(d.getDate());
      }
   };

   $scope.closeDatetime = function () {
      $scope.activeDatetime = null;
      $scope.datetimeString = null;
   };

   $scope.openPopup = function (item, entity, layout) {
      item = mergeTileDefaults(item);

      if ($scope.popupTimeout) {
         clearTimeout($scope.popupTimeout);
         $scope.popupTimeout = null;
      }
      $scope.activePopup = {
         item: item,
         entity: entity,
         layout: layout || item.popup,
      };
   };

   $scope.closePopup = function () {
      if ($scope.popupTimeout) {
         clearTimeout($scope.popupTimeout);
         $scope.popupTimeout = null;
      }
      $scope.activePopup = null;
   };

   $scope.getPopupClasses = function () {
      if (!$scope.activePopup || !$scope.activePopup.layout.classes) {
         return '';
      }
      return parseFieldValue($scope.activePopup.layout.classes, $scope.activePopup.item, $scope.activePopup.entity);
   };

   $scope.isPopupActive = function (page) {
      return $scope.activePopup && $scope.activePopup.layout === page;
   };

   function getHistoryObject (item, entity, config) {
      const historyObject = {
         item: angular.copy(item),
         config: angular.copy(config),
         isLoading: true,
         errorText: null,
         watchers: [],
      };
      historyObject.deregister = function () {
         historyObject.watchers.forEach(function (watcher) {
            watcher();
         });
      };

      const entityId = $scope.itemField('entity', config, entity) || entity.entity_id;

      if (!entityId) {
         historyObject.errorText = 'No entity was specified';
         return historyObject;
      }

      const day = 24 * 60 * 60 * 1000;
      const startDate = new Date(Date.now() - ($scope.itemField('offset', config, entity) || day)).toISOString();

      Api.getHistory(startDate, entityId)
         .then(function (data) {
            historyObject.isLoading = false;

            if (!data) {
               historyObject.errorText = 'Failed';
               return;
            }

            if (data.length === 0) {
               historyObject.errorText = 'No history data found';
               return;
            }

            const datasets = [];
            const datasetOverride = [];
            const yAxes = [];
            const seenAxisIds = {};

            data.forEach(function (states) {
               const firstStateInfo = states[0];

               const dataset = states.map(function (state) {
                  return { x: new Date(state.last_changed), y: state.state };
               });

               // Create extra state with current value.
               dataset.push({
                  x: new Date(),
                  y: $scope.states[firstStateInfo.entity_id].state,
               });

               datasets.push(dataset);

               const seriesName = firstStateInfo.attributes.friendly_name;
               const seriesUnit = firstStateInfo.attributes.unit_of_measurement;

               // Either categorial or continuous data.
               const yAxisType = Number.isNaN(parseFloat(dataset[dataset.length - 1].y)) ? 'category' : 'linear';
               const yAxisId = yAxisType + (seriesUnit ? '-' + seriesUnit : '');
               let createYAxis = false;

               // Create once and reuse same axis for multiple entities using same unit.
               if (seriesUnit && !(seriesUnit in seenAxisIds)) {
                  seenAxisIds[seriesUnit] = true;
                  createYAxis = true;
               } else if (!seriesUnit) {
                  createYAxis = true;
               }

               if (createYAxis) {
                  let yLabels = null;
                  // Only non-continuous data needs explicit labels.
                  if (yAxisType === 'category') {
                     yLabels = [];
                     dataset.forEach(function (value) {
                        if (yLabels.indexOf(value.y) === -1) {
                           yLabels.push(value.y);
                        }
                     });
                     yLabels.sort().reverse();
                     // Special handling for labels when there is only one label present in history.
                     if (yLabels.length === 1) {
                        // on/off - add the other state so that y axis positioning is consistent.
                        if (['on', 'off'].indexOf(yLabels[0]) !== -1) {
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
            const interactionsMode = datasets.length > 1 ? 'nearest' : 'index';

            historyObject.data = datasets;
            historyObject.datasetOverride = datasetOverride;
            historyObject.options = angular.merge({
               scales: {
                  yAxes: yAxes,
               },
               tooltips: {
                  mode: interactionsMode,
               },
               hover: {
                  mode: interactionsMode,
               },
               animation: {
                  duration: 0,
               },
               legend: {
                  display: typeof entityId !== 'string',
               },
            }, $scope.itemField('options', config, entity));

            // Delete old data
            const deleteOldData = function () {
               // Update start date
               const newStartDate = new Date(Date.now() - ($scope.itemField('offset', config, entity) || day));

               // Clean data older than new start date (done on all datasets)
               for (let dataIndex = 0; dataIndex < historyObject.data.length; dataIndex++) {
                  let cleaningFinished = false;
                  while (!cleaningFinished && historyObject.data[dataIndex].length > 0) {
                     const firstHistoryDate = historyObject.data[dataIndex][0].x;
                     if (firstHistoryDate < newStartDate) {
                        historyObject.data[dataIndex].shift();
                     } else {
                        cleaningFinished = true;
                     }
                  }
               }
            };

            // Add watchers to update data on the fly
            if (typeof entityId === 'string') {
               historyObject.watchers.push($scope.$watchCollection(
                  function () {
                     return [ $scope.states[entityId].state, $scope.states[entityId].last_updated ];
                  },
                  function (newValue) {
                     historyObject.data[0].push({
                        x: new Date(),
                        y: newValue[0],
                     });
                     deleteOldData();
                  }));
            } else {
               entityId.forEach(function (entityId, index) {
                  historyObject.watchers.push($scope.$watchCollection(
                     function () {
                        return [ $scope.states[entityId].state, $scope.states[entityId].last_updated ];
                     },
                     function (newValue) {
                        historyObject.data[index].push({
                           x: new Date(),
                           y: newValue[0],
                        });
                        deleteOldData();
                     }));
               });
            }
         });

      return historyObject;
   }

   function cacheInItem (item, key, data) {
      if (!item[key]) {
         item[key] = typeof data === 'function' ? data() : data;
      }
      return item[key];
   }

   $scope.initTileHistory = function (item, entity) {
      return cacheInItem(item, '_historyObject', () => getHistoryObject(item, entity, item));
   };

   $scope.openPopupHistory = function (item, entity) {
      item = mergeTileDefaults(item);
      const layout = cacheInItem(item, '_popupHistory', () => mergeTileConfigs({}, DEFAULT_POPUP_HISTORY(item, entity), {
         classes: getItemFieldValue('history.classes', item, entity) || [],
         items: [getItemFieldValue('history', item, entity) || {}],
      }));
      $scope.openPopup(item, entity, layout);
   };

   $scope.openPopupIframe = function (item, entity) {
      item = mergeTileDefaults(item);
      const layout = cacheInItem(item, '_popupIframe', () => mergeTileConfigs({}, DEFAULT_POPUP_IFRAME(item, entity), {
         classes: getItemFieldValue('iframeClasses', item, entity) || [],
         items: [{
            customStyles: getItemFieldValue('iframeStyles', item, entity) || {},
         }],
      }));
      $scope.openPopup(item, entity, layout);
   };

   $scope.openDoorEntry = function (item, entity) {
      item = mergeTileDefaults(item);
      const layout = cacheInItem(item, '_popupDoorEntry', () => mergeTileConfigs({}, DEFAULT_POPUP_DOOR_ENTRY(item, entity), {
         items: [
            getItemFieldValue('layout.camera', item, entity) || {},
            ...(getItemFieldValue('layout.tiles', item, entity) || []),
         ],
      }, getItemFieldValue('layout.page', item, entity) || {}));

      $scope.openPopup(item, entity, layout);

      if (CONFIG.doorEntryTimeout) {
         $scope.popupTimeout = $timeout(function () {
            $scope.closePopup();
         }, CONFIG.doorEntryTimeout * 1000);
      }
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
      if (cameraList) {
         return cameraList;
      }

      const res = [];

      $scope.pages.forEach(function (page) {
         (page.groups || []).forEach(function (group) {
            (group.items || []).forEach(function (item) {
               if ([TYPES.CAMERA, TYPES.CAMERA_STREAM].includes(item.type) && !item.hideFromList) {
                  res.push(item);
               }
            });
         });
      });

      cameraList = res;

      return res;
   };

   function scrollToActivePage (preventAnimation) {
      const index = $scope.pages.indexOf(activePage);
      const translate = '-' + (index * 100) + '%';
      $scope.pagesContainerStyles.transform = getTransformCssValue(translate);

      if (preventAnimation) {
         $scope.pagesContainerStyles.transition = 'none';

         $timeout(function () {
            $scope.pagesContainerStyles.transition = null;
         }, 50);
      }
   }

   function getTransformCssValue (translateValue) {
      let params;

      if (CONFIG.transition === TRANSITIONS.ANIMATED_GPU) {
         params = $scope.isMenuOnTheLeft ? [0, translateValue, 0] : [translateValue, 0, 0];
         return 'translate3d(' + params.join(',') + ')';
      }

      if (CONFIG.transition === TRANSITIONS.ANIMATED) {
         params = $scope.isMenuOnTheLeft ? [0, translateValue] : [translateValue, 0];
         return 'translate(' + params.join(',') + ')';
      }
   }

   $scope.isPageActive = function (page) {
      return activePage === page;
   };

   $scope.shouldDrawPage = function (page) {
      if (CONFIG.transition === TRANSITIONS.SIMPLE) {
         return $scope.isPageActive(page);
      }

      return true;
   };

   $scope.isHidden = function (object, entity) {
      if (!('hidden' in object)) {
         return false;
      }

      if (typeof object.hidden === 'function') {
         return callFunction(object.hidden, [object, entity]);
      }

      return object.hidden;
   };

   $scope.isMenuOnTheLeft = CONFIG.menuPosition === MENU_POSITIONS.LEFT;

   let hasScrolledDuringPan = false;

   $scope.onPageScroll = function () {
      // Will disable panning when page starts scrolling.
      // Is reset from isPanEnabled function on starting to pan.
      hasScrolledDuringPan = true;

      return true;
   };

   $scope.isPanEnabled = function (recognizer, event) {
      if (hasOpenPopup()) {
         return;
      }

      // Workaround for touch events - cancel recognition on scroll event.
      if (event && event.pointerType === 'touch') {
         if (event.isFirst) {
            hasScrolledDuringPan = false;
         }

         return !hasScrolledDuringPan;
      }

      return true;
   };

   $scope.onPagePan = function (event) {
      if (event.eventType & (Hammer.INPUT_END | Hammer.INPUT_CANCEL)) {
         // Re-enable transitions.
         $scope.pagesContainerStyles.transition = null;

         if (event.eventType === Hammer.INPUT_CANCEL) {
            // Reverts any partial scrolling.
            scrollToActivePage();
            return;
         }
      } else {
         // Disable transitions.
         $scope.pagesContainerStyles.transition = 'none';
      }

      const pageCount = $scope.pages.length;
      const pageIndex = $scope.pages.indexOf(activePage);
      const initialOffset = -pageIndex * 100;
      const viewportDimension = $scope.isMenuOnTheLeft ? window.innerHeight : window.innerWidth;
      const panDelta = $scope.isMenuOnTheLeft ? event.deltaY : event.deltaX;
      const panPercentViewport = (panDelta / viewportDimension) * 100;
      const newOffset = initialOffset + panPercentViewport;

      // If gesture is finished, determine whether page should switch or be rolled back.
      if (event.isFinal) {
         let targetPageIndex = pageIndex;

         // Switch to other page if:
         // - panned 50% of new page onto screen
         // or
         // - the velocity of movement was above the threshold (and velocity direction matches delta direction)
         const velocity = $scope.isMenuOnTheLeft ? event.velocityY : event.velocityX;
         if (Math.abs(panPercentViewport) >= 50 || (Math.abs(velocity) > .5 && velocity < 0 === panDelta < 0)) {
            const potentialTargetIndex = targetPageIndex + (newOffset < initialOffset ? 1 : -1);
            // Set new page index if new index is within range.
            if (potentialTargetIndex >= 0 && potentialTargetIndex < pageCount) {
               targetPageIndex = potentialTargetIndex;
            }
         }

         $scope.openPage($scope.pages[targetPageIndex]);
         return;
      }

      // Check that new offset is within range of pages area.
      if (newOffset <= 0 && newOffset >= ((pageCount - 1) * -100)) {
         $scope.pagesContainerStyles.transform = getTransformCssValue(newOffset + '%');
      }
   };

   function hasOpenPopup () {
      return $scope.activeCamera || $scope.activePopup;
   }

   $scope.toggleSelect = function (item) {
      if ($scope.selectOpened(item)) {
         $scope.closeActiveSelect();
      } else {
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
      $scope.alarmCode = $scope.alarmCode || '';

      $scope.alarmCode += num;
   };

   $scope.clearAlarm = function () {
      $scope.alarmCode = '';
   };

   $scope.sendDatetime = function () {
      if (!$scope.activeDatetimeValid()) {
         return;
      }

      const item = $scope.activeDatetime;
      const entity = $scope.getItemEntity(item);

      const str = $scope.getActiveDatetimeInput();
      const dt = str.split(' ');

      const serviceData = {};

      if (entity.attributes.has_date) {
         serviceData.date = dt[0];
      }
      if (entity.attributes.has_time) {
         serviceData.time = dt[1] || dt[0];
      }

      callService(item, 'input_datetime', 'set_datetime', serviceData);
   };

   $scope.inputDatetime = function (num) {
      const entity = $scope.getItemEntity($scope.activeDatetime);

      if (!entity) {
         return;
      }

      let placeholder = getDatetimePlaceholder(entity);

      placeholder = placeholder.replace(/\W/gi, '');

      $scope.datetimeString = $scope.datetimeString || '';

      if ($scope.datetimeString.length >= placeholder.length) {
         return;
      }

      $scope.datetimeString += num;
   };

   $scope.clearCharDatetime = function () {
      if ($scope.datetimeString) {
         $scope.datetimeString = $scope.datetimeString
            .slice(0, $scope.datetimeString.length - 1);
      }
   };

   $scope.getActiveDatetimeInput = function () {
      const entity = $scope.getItemEntity($scope.activeDatetime);
      const placeholder = getDatetimePlaceholder(entity);

      const res = $scope.datetimeString || '';

      let i = 0;

      return placeholder.replace(/\w|\W/gi, function (match, index) {
         if (i >= res.length) {
            return '';
         }

         if (/\W/.test(match)) {
            return match;
         }

         return res[i++];
      });
   };

   $scope.getActiveDatetimePlaceholder = function () {
      const entity = $scope.getItemEntity($scope.activeDatetime);
      const placeholder = getDatetimePlaceholder(entity);

      const dt = $scope.getActiveDatetimeInput() || '';

      return placeholder.slice(dt.length);
   };

   $scope.activeDatetimeValid = function () {
      const entity = $scope.getItemEntity($scope.activeDatetime);

      if (!entity) {
         return false;
      }

      let placeholder = getDatetimePlaceholder(entity);

      placeholder = placeholder.replace(/\W/gi, '');

      $scope.datetimeString = $scope.datetimeString || '';

      return $scope.datetimeString.length === placeholder.length;
   };

   function getDatetimePlaceholder (entity) {
      const res = [];

      if (!entity || !entity.attributes) {
         return null;
      }

      if (entity.attributes.has_date) {
         res.push('YYYY-MM-DD');
      }
      if (entity.attributes.has_time) {
         res.push('hh:mm');
      }

      return res.join(' ');
   }


   // / INIT

   let realReadyState = false;

   Api.onError(function (data) {
      console.error(data);
      addError(data.message);
   });

   Api.onReady(function () {
      Api.subscribeEvents('state_changed', function (res) {
         debugLog('subscribed to state_changed', res);
      });

      Api.subscribeEvents('tileboard', function (res) {
         debugLog('subscribed to tileboard', res);
      });

      Api.getStates(function (res) {
         if (res.success) {
            debugLog(res.result);

            setStates(res.result);
         }

         $scope.ready = true;
         realReadyState = true;
         callFunction(CONFIG.onReady);

         let pageNum = $location.hash();

         if (!CONFIG.rememberLastPage || !$scope.pages[pageNum]) {
            pageNum = 0;
         }

         $scope.openPage($scope.pages[pageNum], true);

         updateView();
      });
   });

   Api.onUnready(function () {
      realReadyState = false;

      // $scope.ready = false;

      // we give a timeout to prevent blinking (if reconnected)
      $timeout(function () {
         if (realReadyState === false) {
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
      let maxWidth = 0;
      let maxHeight = 0;

      for (let i = 0; i < (group.items || []).length; i++) {
         const item = group.items[i];

         maxHeight = Math.max(maxHeight, item.position[1] + (item.height || 1));
         maxWidth = Math.max(maxWidth, item.position[0] + (item.width || 1));
      }

      return {
         width: maxWidth,
         height: maxHeight,
      };
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
      if (typeof func !== 'function') {
         return func;
      }

      return func.apply(getContext(), args || []);
   }

   function apiRequest (data, callback) {
      Api.send(data, function (res) {
         updateView();

         if (callback) {
            callback(res);
         }
      });
   }

   function callService (item, domain, service, data, callback) {
      if (item.loading) {
         return;
      }

      item.loading = true;

      const serviceData = angular.extend({ entity_id: item.id }, data);

      Api.callService(domain, service, serviceData, function (res) {
         item.loading = false;

         updateView();

         if (callback) {
            callback(res);
         }
      });
   }

   function getItemFieldValue (field, item, entity) {
      let value = item;
      field.split('.').forEach(function (f) {
         value = (typeof value === 'object') ? value[f] : undefined;
      });
      return parseFieldValue(value, item, entity);
   }

   function parseFieldValue (value, item, entity) {
      if (!value) {
         return null;
      }

      if (typeof value === 'function') {
         return callFunction(value, [item, entity]);
      }
      if (typeof value === 'string') {
         return parseString(value, entity);
      }

      return value;
   }

   function parseVariable (value, entity) {
      if (value[0] === '@') {
         return getObjectAttr(entity, value.slice(1));
      }
      if (value[0] === '&') {
         return getEntityAttr(value.slice(1));
      }

      return value;
   }

   function parseString (value, entity) {
      return value.replace(/([&@][\w\d._]+)/gi, function (match, contents, offset) {
         if (match[0] === '&' && match.split('.').length < 3) {
            return match;
         }

         const res = parseVariable(match, entity);

         if (typeof res === 'undefined') {
            if (match === value) {
               return '';
            }

            return match;
         }

         if (res === null) {
            return '';
         }

         return res;
      });
   }

   function escapeClass (text) {
      return text && typeof text === 'string'
         ? text.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'non';
   }

   function getEntityAttr (str) {
      const path = str.split('.');

      if (path.length < 3) {
         return;
      }

      const entity = $scope.states[path.slice(0, 2).join('.')] || null;

      return getObjectAttr(entity, path.slice(2).join('.'));
   }

   function getObjectAttr (obj, path) {
      let res = obj;

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
      if (!$scope.states[key]) {
         $scope.states[key] = state;
      }

      for (const k in state) {
         $scope.states[key][k] = state[k];
      }
   }

   function checkStatesTriggers (key, state) {
      checkAlarmState(key, state);
   }

   function checkAlarmState (key, state) {
      if (key in latestAlarmActions) {
         const ts = latestAlarmActions[key];

         if (Date.now() - ts < 3000) {
            $scope.closeAlarm();
            updateView();
         }
      }
   }

   function triggerEvents (eventData) {
      if (!CONFIG.events) {
         return;
      }

      CONFIG.events.forEach(function (event) {
         if (eventData.command !== event.command) {
            return;
         }

         if (typeof event.action === 'function') {
            callFunction(event.action, [eventData]);
         }
      });
   }

   function handleMessage (data) {
      if (data.type === 'event') {
         handleEvent(data.event);
      }
   }

   function handleEvent (event) {
      try {
         if (event.event_type === 'state_changed') {
            debugLog('state change', event.data.entity_id, event.data.new_state);

            setNewState(event.data.entity_id, event.data.new_state);
            checkStatesTriggers(event.data.entity_id, event.data.new_state);
         } else if (event.event_type === 'tileboard') {
            debugLog('tileboard', event.data);

            triggerEvents(event.data);
         }
      } catch (e) {
         console.error(e);
      }
      updateView();
   }

   function addError (error) {
      if (!CONFIG.ignoreErrors) {
         Noty.addObject({
            type: Noty.ERROR,
            title: 'Error',
            message: error,
            lifetime: 10,
         });
      }
   }

   function warnUnknownItem (item) {
      const notyId = item.id + '_not_found';
      if (!CONFIG.ignoreErrors && !Noty.hasSeenNoteId(notyId)) {
         Noty.addObject({
            type: Noty.WARNING,
            title: 'Entity not found',
            message: 'Entity "' + item.id + '" not found',
            id: notyId,
         });
      }
   }

   function debugLog () {
      if (CONFIG.debug) {
         console.log.apply(console, [].slice.call(arguments));
      }
   }

   function updateView () {
      if (!$scope.$$phase) {
         $scope.$apply();
      }
   }

   // @ts-ignore
   window.openPage = function (page) {
      $scope.openPage(page);
      updateView();
   };

   // @ts-ignore
   window.setScreensaverShown = function (state) {
      $scope.screensaverShown = state;

      updateView();
   };

   function pingConnection () {
      if (!$scope.ready || realReadyState === false) {
         return;
      } // no reason to ping if unready was fired

      const timeout = 3000;

      let success = false;

      Api.sendPing(function (res) {
         if ('id' in res) {
            success = true;
         }
      });

      $timeout(function () {
         if (success) {
            return;
         }

         realReadyState = false;

         const noty = Noty.addObject({
            type: Noty.WARNING,
            title: 'Ping unsuccessful',
            message: 'Trying to reconnect',
         });

         Api.forceReconnect();

         const destroy = Api.onReady(function () {
            destroy();

            if (noty) {
               noty.remove();
            }

            Noty.addObject({
               type: Noty.SUCCESS,
               title: 'Reconnection',
               message: 'Reconnection successful',
               lifetime: 1,
            });
         });
      }, timeout);
   }

   if (CONFIG.pingConnection !== false) {
      setInterval(pingConnection, 5000);

      window.addEventListener('focus', function () {
         pingConnection();
      });
   }
});
