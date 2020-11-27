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
      const mergedTile = mergeTileDefaults(tile);
      tiles[index] = mergedTile;
      switch (mergedTile.type) {
         case TYPES.CAMERA:
         case TYPES.CAMERA_STREAM:
         case TYPES.CAMERA_THUMBNAIL:
            if (mergedTile.type === TYPES.CAMERA_THUMBNAIL) {
               console.warn('The CAMERA_THUMBNAIL tile is deprecated. Please replace it with the CAMERA tile. Tile: ', tile);
               mergedTile.type = TYPES.CAMERA;
            }
            mergedTile.fullscreen = mergeTileDefaults(mergedTile.fullscreen);
            break;
         case TYPES.DOOR_ENTRY:
            if (mergedTile.layout?.camera) {
               mergedTile.layout.camera = mergeTileDefaults(mergedTile.layout.camera);
            }
            mergeTileListDefaults(mergedTile.layout?.tiles);
            break;
         case TYPES.POPUP:
            mergeTileListDefaults(mergedTile.popup?.items);
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
