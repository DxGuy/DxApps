/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import '@babel/polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router/immutable';
import FontFaceObserver from 'fontfaceobserver';
import history from 'utils/history';
import 'sanitize.css/sanitize.css';

// Import root app
import App from './containers/App';
import './styles/layout/base.scss';

// Load the favicon and the .htaccess file
import '!file-loader?name=[name].[ext]!../public/favicons/favicon.ico'; // eslint-disable-line
import 'file-loader?name=.htaccess!./.htaccess'; // eslint-disable-line

import configureStore from './redux/configureStore';


// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
});

// Create redux store with history
const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app');

const render = messages => {
  ReactDOM.render(
    <Provider store={store}>
          <ConnectedRouter history={history} basename="/DxApps/">
              <App />
          </ConnectedRouter>
    </Provider>,
    MOUNT_NODE,
  );
};

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  new Promise(resolve => {
    resolve(import('intl'));
  })
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
      import('intl/locale-data/jsonp/de.js'),
    ])) // eslint-disable-line prettier/prettier
    .then(() => render(translationMessages))
    .catch(err => {
      throw err;
    });
} else {
  render(translationMessages);
}
// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}