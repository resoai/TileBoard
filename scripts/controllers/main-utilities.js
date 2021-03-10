import mergeWith from 'lodash.mergewith';
import { TILE_DEFAULTS, TYPES } from '../globals/constants';

const MERGED_DEFAULTS_KEY = '__merged_defaults';

export function calculateGridPageRowIndexes (page) {
   const rowIndexes = [];
   for (const group of page.groups) {
      const rowIndex = group.row || 0;
      if (!rowIndexes.includes(rowIndex)) {
         rowIndexes.push(rowIndex);
      }
   }

   if (rowIndexes.length === 0) {
      rowIndexes.push(0);
   } else {
      rowIndexes.sort();
   }

   return rowIndexes;
}

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
   }
   return tiles;
}

export function mergeTileDefaults (tile) {
   if (tile[MERGED_DEFAULTS_KEY]) {
      return tile;
   }
   let mergedTile = tile;
   if (mergedTile && mergedTile.type in TILE_DEFAULTS) {
      mergedTile = mergeTileConfigs({}, TILE_DEFAULTS[mergedTile.type], mergedTile);
   }
   switch (mergedTile.type) {
      case TYPES.CAMERA:
      case TYPES.CAMERA_STREAM:
      case TYPES.CAMERA_THUMBNAIL:
         if (mergedTile.type === TYPES.CAMERA_THUMBNAIL) {
            console.warn('The CAMERA_THUMBNAIL tile is deprecated. Please replace it with the CAMERA tile. Tile: ', mergedTile);
            mergedTile.type = TYPES.CAMERA;
         }
         if (mergedTile.fullscreen) {
            mergedTile.fullscreen = mergeTileDefaults(mergedTile.fullscreen);
         }
         break;
      case TYPES.DOOR_ENTRY:
         if (mergedTile.layout?.camera) {
            mergedTile.layout.camera = mergeTileDefaults(mergedTile.layout.camera);
         }
         if (mergedTile.layout?.tiles) {
            mergeTileListDefaults(mergedTile.layout.tiles);
         }
         break;
      case TYPES.POPUP:
         if (mergedTile.popup?.items) {
            mergeTileListDefaults(mergedTile.popup.items);
         }
         break;
   }
   mergedTile[MERGED_DEFAULTS_KEY] = true;
   return mergedTile;
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
