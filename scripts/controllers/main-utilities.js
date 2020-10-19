import angular from 'angular';
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
      if (tile.type in TILE_DEFAULTS) {
         tiles[index] = mergeTileDefaults(tile);
      }
      switch (tile.type) {
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
   return angular.merge({}, TILE_DEFAULTS[tile.type], tile);
}
