import './globals';
import './app';
import './init';
import './models/api';
import './directives';
import './controllers/main';
import './controllers/noty';
import './controllers/screensaver';
import '../styles/all.less';

function onConfigLoadOrError(loaded) {
   if (loaded && !window.CONFIG) {
      alert('The "config.js" configuration file has loaded but window.CONFIG is not defined!\n' +
               'Please make sure that it defines a CONFIG variable with proper configuration.');
      return;
   }
   if (!loaded) {
      alert('Please make sure that you have "config.js" file and it is a valid javascript!\n' +
              'If you are running TileBoard for the first time, please copy "config.example.js" into "dist/config.js"');
      return;
   }
   // @ts-ignore
   window.window.initApp();
}

const script = document.createElement('script');
script.src = './config.js?r=' + Date.now();
script.onload = () => onConfigLoadOrError(true);
script.onerror = () => onConfigLoadOrError(false);
document.head.appendChild(script);
