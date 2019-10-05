
/**
 * TEMPLATES FOR TILES
 * 
 * The variable TEMPLATES.FILTERS holds a dictionary of this type:
 *   PATTERN: TEMPLATE_FUNCTION(id, position, args)
 * The patterns are matched against the entity_id to generate a tile for.
 * The id and the position are passed to the TEMPLATE_FUNCTION. 
 * Additional arguments can be passed as args and will be merged into the tile.
 *
 * You can extend the TEMPLATES.FILTERS variable simply by doing the following:
 *   TEMPLATES.FILTERS['my_id'] = MY_TEMPLATE_FUNCTION;
 */
var TEMPLATES = {FILTERS: {}};

// DEFAULT: Special template to be used as a default
// Simply apply the arguments and use the domain as type..
TEMPLATES.DEFAULT = function(id, position, args){
   return angular.merge({
      id: id,
      position: position,
      type: TYPES[id.split('.', 1)[0].toUpperCase()]
   }, args);
};

// MISSING: Special template for unfound entity_id's
// Simply use a text field...
TEMPLATES.MISSING = function(id, position, args){
   return angular.merge({
      type: TYPES.TEXT_LIST,
                     id: {}, // using empty object for an unknown id
                     position: position,
                     state: false, // disable state element
                     list: [
                        {
                           title: 'Missing',
                           icon: 'mdi-clock-outline',
                           value: id
                        }
                     ]
   }, args);
};

// FILTERS: This is the actual dictionary queried by the autoTile function
TEMPLATES.FILTERS = {
   'default':                      TEMPLATES.DEFAULT,      // Special template to be used as a default
   'missing':                      TEMPLATES.MISSING,      // Special template for unfound entity_id's
};

// MEDIA_PLAYER: Example how to extend the template filters
TEMPLATES.MEDIA_PLAYER = function(id,position,args){
   return angular.merge({
   position: position,
   id: id,
   width: 2,
   type: TYPES.MEDIA_PLAYER,
   hideSource: false,
   hideMuteButton: false,
   state: false,
   //state: '@attributes.media_title',
   subtitle: '@attributes.media_title',
   bgSuffix: '@attributes.entity_picture',
},args);
};
TEMPLATES.FILTERS['media_player.'] = TEMPLATES.MEDIA_PLAYER;

// SNAPCLIENT: Use a switch/dimmer with plus/minus buttons for volume control
// Note: Also the MEDIA_PLAYER does most of these things. And provides a slider!
TEMPLATES.SNAPCLIENT = function(id, position, args) {
   return angular.merge({
      id: id,
      position: position,
      title: function (item, entity) { // remove the word snapclient from friendly_name
         return entity.attributes.friendly_name.replace('snapclient ', '');
      },
      subtitle: 'Snapclient',
      type: TYPES.DIMMER_SWITCH, // TYPES.LIGHT would allow for long-press sliders but has hardcoded things there...
      state: function (item, entity) { // use 'off', 'muted', or '...%'
         return entity.state === 'off' ? 'off'
              : entity.attributes.is_volume_muted ? 'muted' 
              : (entity.attributes.volume_level*100).toString() + '%';
      },
      icon: function (item, entity) { // use mdi-volume-*
         return entity.attributes.is_volume_muted    ? 'mdi-volume-mute'
              : entity.attributes.volume_level < 0.5 ? 'mdi-volume-low'
              : entity.attributes.volume_level < 1.0 ? 'mdi-volume-medium'
              : 'mdi-volume-high';
      },
      action: function(item, entity) { // toggle mute
         Api.send({
           type: "call_service",
           domain: 'media_player',
           service: "volume_mute",
           service_data: {
             entity_id: item.id,
             is_volume_muted: !entity.attributes.is_volume_muted
           }
         });
      },
      actionPlus: function(item, entity) { // incease volume by 10%
         Api.send({
           type: "call_service",
           domain: 'media_player',
           service: "volume_set",
           service_data: {
             entity_id: item.id,
             volume_level: Math.max(0.0, Math.min(1.0, entity.attributes.volume_level + 0.1))
           }
         });
      },
      actionMinus: function(item, entity) { // decrease volume by 10%
         Api.send({
           type: "call_service",
           domain: 'media_player',
           service: "volume_set",
           service_data: {
             entity_id: item.id,
             volume_level: Math.max(0.0, Math.min(1.0, entity.attributes.volume_level - 0.1))
           }
         });
      },
      /* This would work for TYPES.LIGHT only...      
      sliders: [{
         title: 'Volume',
         field: 'volume_level',
         max:  1.0,
         min:  0.0,
         step: 0.1,
         request: {
            type: "call_service",
            domain: "media_player",
            service: "volume_set",
            field: "volume_level"
         }
      }],
      colorpicker: false
      */
   }, args);
};
TEMPLATES.FILTERS['media_player.snapcast_client'] = TEMPLATES.SNAPCLIENT;
