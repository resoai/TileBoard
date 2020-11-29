import './globals';
import './app';
import './init';
import './models/api';
import './directives';
import './controllers/main';
import './controllers/noty';
import './controllers/screensaver';
import '../styles/all.less';
import '@mdi/font/scss/materialdesignicons.scss';
import 'url-search-params-polyfill';

function onConfigLoadOrError (error) {
   if (error) {
      alert(`Please make sure that you have "${configName}.js" file and it is a valid javascript!
If you are running TileBoard for the first time, please copy "config.example.js" into "dist/${configName}.js"`);
      return;
   }
   if (!window.CONFIG) {
      alert(`The "${configName}.js" configuration file has loaded but window.CONFIG is not defined!
Please make sure that it defines a CONFIG variable with proper configuration.`);
      return;
   }
   // @ts-ignore
   window.window.initApp();
}

const configName = new URLSearchParams(document.location.search).get('config') || 'config';

const script = document.createElement('script');
script.src = `./${configName}.js?r=${Date.now()}`;
script.onload = () => onConfigLoadOrError();
script.onerror = event => onConfigLoadOrError(event);
document.head.appendChild(script);
