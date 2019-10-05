/**
 * AUTOMATOC CONFIGURATION
 *
 * This is stored outside of config.js to increase
 * readability. But this means, we also have to move
 * the CONFIG var to here:
 *   variable.js 
 */
[
   'templates.js',
   'autoconfig.js',
   'variable.js',
].map(function (value) {
   document.write('<sc'+'ript src="'+value+suffix+'"></scr'+'ipt>');
});

