
/**
 * AUTOMATIC TILES
 * 
 * Generates a tile object from (id, position, args) tuple.
 * Uses the logic as explained above for TEMPLATES-FILTERS.
 */
function autoTile(id, position, args) {
   // Match the id against the templates (sorted to match most specific first)
   var template;
   if (typeof id != 'undefined')
      template = Object.keys(TEMPLATES.FILTERS).sort().reverse().find(
         function(k) {
            return id.match(k) !== null
         }
      );
   // If none is found, use the default
   if (typeof template === 'undefined')
      template = 'default';
   // If states are available and id is not found there, use 'missing' template
   if (typeof(angular.element(document.body).scope()) !== 'undefined'
    && typeof(angular.element(document.body).scope().states[id]) === 'undefined')
      template = 'missing';
   // Return the TEMPLATE's resulting tile object
   return TEMPLATES.FILTERS[template](id, position, args);
}

/**
 * AUTOMATIC GROUPS
 * 
 * This function takes a group object with an array of tile stubs and 
 * generates a proper "items" list with proper "tile" objects from it.
 * The stubs should be arranged in a matrix as follows:
 *   [
 *     ['sun.sun', , 'sensor.uptime'   ]
 *     [         , , 'group.all_lights']
 *   ]
 * Each stub can be a simple entity_id. Then, the TEMPLATES above are used.
 * If the stub is a dictionary, its "id" element is used as "id" and the rest is merged.
 * The "position" element is generated autmatically, but can be (uselessly) overriden by
 * defining it in the stub.
 *
 * Each row of tiles is wrapped, in order to respect the group's "width" property,
 * if provided. As a side effect, you can provide only one long row of tile stubs and
 * the tiles will be arranged to match the group's "width" property.
 *
 * Take care to provide a double array (i.e. [[...]]) as items!
 */

function autoGroup(group) {
   // Stash items
   var items = group.items || [[]];
   group.items = [];
   // Calculate size
   var width = group.width 
            || Math.max.apply(Math,
                  items.map(function(e){ return e.length})
               )
            || 0;
   // Loop items
   var x = 0;
   var y = -1;
   var tile = {};
   for (row of items) {
      x = 0; y += 1;
      for (item of row) {
         //Noty.addObject({title: item});
         if (x >= width) {
            x = 0; y += 1; }
         // Create autoTiles
         switch (typeof item) {
            case 'undefined':
               x += 1;
               continue;
            case 'string':
               tile = autoTile(item, [x,y], {});
               break;
            default:
               tile = autoTile(item.id, [x,y], item);
         }
         x += tile.width || 1;
         // Push tile to next row, if needed
         if (x > width) {
            tile.position = [0, y+1];
            x = tile.width; y += 1;
         }
         // Append tile to group's items
         group.items.push(tile);
      }
   }
   // Return group object
   group.width  = group.width  || Math.min(width, group.items.length);
   group.height = group.height || y+1;
   return group;
}

/**
 * IMPORT GROUP
 * 
 * In addition to autoGroup (see above) this function also fills some 
 * group properties automatically from the HA group identified as group.id.
 */

function importGroup(group, states) {
   if (typeof states == 'undefined')
      states = angular.element(document.body).scope().states;
   group.title = group.title 
              ||  states[group.id].attributes.friendly_name;
   group.items = group.items
              || [states[group.id].attributes.entity_id];
   return autoGroup(group);
}

/**
 * IMPORT PAGE
 * 
 * This function imports a complete group from HA as a page into TileBoard.
 * This is most useful for groups with view=true in HA. Provide the entity id
 * as page.id.
 */

function importPage(page, states) {
   if (typeof states == 'undefined')
      states = angular.element(document.body).scope().states;
   // Import some simple properties 
   page.title = page.title
             || states[page.id].attributes.friendly_name;
   page.icon = page.icon
             || states[page.id].attributes.icon.replace(':','-');
   page.bg = page.bg || 'images/bg1.jpeg';
   page.width = page.width || 3;
   page.groups = page.groups || [];
   // Take care of states not in sub-groups
   page.groups.push({
      width: page.width,
      title: 'Loose items',
      items: [[]]
   });
   var loose_index = page.groups.length-1;
   // Loop all entities in the page.id
   states[page.id].attributes.entity_id.forEach(function(id) {
      // If a group: import the group
      if (id.match('group.')) {
         page.groups.push(importGroup({
            id: id,
            width: page.width
         }));
      // If not: add to loose items
      } else {
         page.groups[loose_index].items[0].push(id);
      }
   });
   // Remove or autoGroup the loose items
   if (page.groups[loose_index].items[0].length > 0) {
      page.groups[loose_index] = autoGroup(page.groups[loose_index]);
   } else {
      page.groups.splice(loose_index,1);
   }
   // Return the page object
   return page;
}

