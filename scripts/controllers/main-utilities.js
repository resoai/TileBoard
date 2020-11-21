import mergeWith from 'lodash.mergewith';
import { TILE_DEFAULTS, TYPES } from '../globals/constants';

export function mergeConfigDefaults (pages) {
   for (const page of pages) {
      for (const group of page.groups) {
         mergeTileListDefaults(group.items);
      }
   }
   return pages;
}

function mergeTileListDefaults (tiles) {
   if (!Array.isArray(tiles)) {
      return;
   }
   for (const [index, tile] of tiles.entries()) {
      tiles[index] = mergeTileDefaults(tile);
      switch (tile.type) {
         case TYPES.CAMERA:
         case TYPES.CAMERA_STREAM:
         case TYPES.CAMERA_THUMBNAIL:
            tile.fullscreen = mergeTileDefaults(tile.fullscreen);
            break;
         case TYPES.DOOR_ENTRY:
            if (tile.layout?.camera) {
               tile.layout.camera = mergeTileDefaults(tile.layout.camera);
            }
            mergeTileListDefaults(tile.layout?.tiles);
            break;
         case TYPES.POPUP:
            mergeTileListDefaults(tile.popup?.items);
            break;
      }
   }
   return tiles;
}

function mergeTileDefaults (tile) {
   if (tile && tile.type in TILE_DEFAULTS) {
      return mergeTileConfigs({}, TILE_DEFAULTS[tile.type], tile);
   }
   return tile;
}

export function mergeTileConfigs (object, ...sources) {
   return mergeWith(object, ...sources, mergeTileCustomizer);
}

function mergeTileCustomizer (objValue, srcValue, key) {
   if (key === 'classes') {
      return function (item, entity) {
         const objValueParsed = this.parseFieldValue(objValue, item, entity) || [];
         const srcValueParsed = this.parseFieldValue(srcValue, item, entity) || [];
         return (Array.isArray(objValueParsed) ? objValueParsed : [objValueParsed]).concat(Array.isArray(srcValueParsed) ? srcValueParsed : [srcValueParsed]);
      };
   }
}
