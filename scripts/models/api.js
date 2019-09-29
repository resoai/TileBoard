/**
 * @class HApi $Api
 */

var HApi = (function () {
   var STATUS_LOADING = 1;
   var STATUS_OPENED = 2;
   var STATUS_READY = 3;
   var STATUS_ERROR = 4;
   var STATUS_CLOSED = 5;

   var reconnectTimeout = null;

   function $Api (url, token) {
      this._id = 1;

      this._url = url;

      this._listeners = {
         error: [],
         message: [],
         ready: [],
         unready: []
      };

      this._callbacks = {};

      if(token) {
         this._configToken = token;
      }

      this._init();
   }

   $Api.prototype._init = function () {
      var self = this;

      this._getToken(function (token) {
         if(token) {
            self._token = token.access_token;
            self._connect.call(self);

            if(token.expires_in) {
               setTimeout(
                  self._refreshToken.bind(self),
                  token.expires_in * 900);
            }
         }
         else {
            Noty.addObject({
               type: Noty.ERROR,
               title: 'ACCESS TOKEN',
               message: 'Error while receiving access token'
            });
         }
      });
   };

   $Api.prototype.on = function (key, callback) {
      var self = this;

      if(this._listeners[key].indexOf(callback) !== -1) {
         return function () {}
      }

      this._listeners[key].push(callback);

      return function () {
         self._listeners[key] = self._listeners[key].filter(function (a) {
            return a !== callback;
         });
      }
   };

   $Api.prototype.onError = function (callback) {
      return this.on('error', callback)
   };
   $Api.prototype.onMessage = function (callback) {
      return this.on('message', callback)
   };
   $Api.prototype.onReady = function (callback) {
      if(this.status === STATUS_READY) {
         try {
            callback({status: STATUS_READY});
         }
         catch (e) {}
      }

      return this.on('ready', callback)
   };
   $Api.prototype.onUnready = function (callback) {
      return this.on('unready', callback)
   };

   $Api.prototype.send = function (data, callback, id) {
      id = id !== false;

      if(!data.id && id) data.id = this._id++;

      var wsData = JSON.stringify(data);

      if(callback && data.id) {
         this._callbacks[data.id] = callback;
      }

      return this.socket.send(wsData);
   };

   $Api.prototype.subscribeEvents = function (events, callback) {
      var self = this;
      if(events && typeof events === "object") {
         events.forEach(function (event) {
            self.subscribeEvent(event, callback);
         })
      }
      else this.subscribeEvent(events, callback);
   };

   $Api.prototype.subscribeEvent = function (event, callback) {
      var data = {type: "subscribe_events"};

      if(event) data.event_type = event;

      this.send(data, callback);
   };

   $Api.prototype.getStates = function (callback) {
      return this.send({type: "get_states"}, callback);
   };

   $Api.prototype.getPanels = function (callback) {
      return this.send({type: "get_panels"}, callback);
   };

   $Api.prototype.getConfig = function (callback) {
      return this.send({type: "get_config"}, callback);
   };

   $Api.prototype.getServices = function (callback) {
      return this.send({type: "get_services"}, callback);
   };

   $Api.prototype.getUser = function (callback) {
      return this.send({type: "auth/current_user"}, callback);
   };

   $Api.prototype.sendPing = function (callback) {
      return this.send({type: "ping"}, callback);
   };

   $Api.prototype._connect = function () {
      var self = this;

      if(this.socket && this.socket.readyState < 2) return; // opened or connecting

      this.status = STATUS_LOADING;
      this.socket = new WebSocket(this._url);

      this.socket.addEventListener('open', function (e) {
         self._setStatus(STATUS_OPENED);
      });

      this.socket.addEventListener('close', function (e) {
         self._setStatus(STATUS_CLOSED);
         self._reconnect.call(self);
      });

      this.socket.addEventListener('error', function (e) {
         self._setStatus(STATUS_ERROR);
         self._sendError.call(self, "System error", e);
         self._reconnect.call(self, 1000);
      });

      this.socket.addEventListener('message', function (e) {
         var data = JSON.parse(e.data);

         self._handleMessage.call(self, data);
      });
   };

   $Api.prototype.forceReconnect = function () {
      if(this.socket && this.socket.readyState < 2) {
         this.socket.close();
      }
      else this._reconnect();
   };

   $Api.prototype._reconnect = function (delayBeforeConnect) {
      delayBeforeConnect = delayBeforeConnect || 0;

      this._fire('unready', {status: this.status});

      if(reconnectTimeout) clearTimeout(reconnectTimeout);

      reconnectTimeout = setTimeout(this._connect.bind(this), delayBeforeConnect);
   };

   $Api.prototype._fire = function (key, data) {
      this._listeners[key].forEach(function (cb) {
         setTimeout(function () { cb(data) }, 0);
      })
   };

   $Api.prototype._handleMessage = function (data) {
      var self = this;
      if(data.type === "auth_required") return this._authenticate();
      if(data.type === "auth_invalid") return this._authInvalid(data.message);
      if(data.type === "auth_ok") return this._ready();

      if(data.error) return this._sendError(data.error.message, data);

      if(data.type === "result" && data.id) {
         if(this._callbacks[data.id]) {
            setTimeout(function () {
               self._callbacks[data.id](data);
            }, 0);
         }
      }

      if(data.type === "pong" && data.id) {
         if(this._callbacks[data.id]) {
            setTimeout(function () {
               self._callbacks[data.id](data);
            }, 0);
         }
      }

      this._fire('message', data);
   };

   $Api.prototype._authInvalid = function (message) {
      this._setStatus(STATUS_ERROR);
      this._sendError(message);
      this._refreshToken();
   };

   $Api.prototype._sendError = function (message, data) {
      var msg = {message: message};

      if(data) msg.data = data;

      this._fire('error', msg);
   };

   $Api.prototype._authenticate = function () {
      var data = {
         type: "auth",
         access_token: this._token
      };

      this.send(data, null, false);
   };

   $Api.prototype._ready = function () {
      this._setStatus(STATUS_READY);
      this._fire('ready', {status: STATUS_READY});
   };

   $Api.prototype._setStatus = function (status) {
      this.status = status;
   };

   $Api.prototype._request = function (url, callback) {
      var xhr = new XMLHttpRequest();

      xhr.open('POST', toAbsoluteServerURL('/auth/token'));
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(url + '&client_id=' + getOAuthClientId());

      xhr.onreadystatechange = function() {
         if(xhr.status !== 200) {
            redirectOAuth();
            callback(null);
         }

         if(xhr.readyState === 4) {
            callback(JSON.parse(xhr.response));
         }
      };
   };

   $Api.prototype._refreshToken = function () {
      var self = this;

      this._getFreshToken(function (token) {
         if(token) {
            self._token = token.access_token;

            if(token.expires_in) {
               setTimeout(
                  self._refreshToken.bind(self),
                  token.expires_in * 900);
            }
         }
      });
   };

   $Api.prototype._getFreshToken = function (callback) {
      var token = readToken();

      var url = 'grant_type=refresh_token&refresh_token=' + token.refresh_token;

      this._request(url, function (data) {
         data.refresh_token = token.refresh_token;

         saveToken(data);

         callback(data);
      });
   };

   $Api.prototype._getTokenByCode = function (code, callback) {
      var url = 'grant_type=authorization_code&code=' + code;

      this._request(url, function (data) {
         saveToken(data);

         callback(data);
      });
   };

   $Api.prototype._getToken = function (callback) {
      if(this._configToken) {
         return callback({access_token: this._configToken});
      }

      var token = readToken();

      if (token) {
         return this._getFreshToken(callback);
      }

      var params = getLocationArgs();

      if (params.oauth && params.code) {
         return this._getTokenByCode(params.code, callback);
      }

      redirectOAuth();
   };


   function getLocationArgs() {
      var qs = window.location.search.split('+').join(' '),
         params = {},
         tokens,
         reg = /[?&]?([^=]+)=([^&]*)/g;

      while (tokens = reg.exec(qs)) {
         params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }

      return params;
   }

   function saveToken(token) {
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(token));
   }

   function readToken() {
      var token = localStorage.getItem(TOKEN_CACHE_KEY);

      return token ? JSON.parse(token) : null;
   }

   function removeToken() {
      localStorage.removeItem(TOKEN_CACHE_KEY);
   }

   function getOAuthClientId() {
      return encodeURIComponent(window.location.origin);
   }

   function getOAuthRedirectUrl() {
      var url = window.location.origin + window.location.pathname;

      if(window.location.search) {
         url += window.location.search + '&oauth=1';
      }
      else {
         url += '?oauth=1';
      }

      return encodeURIComponent(url);
   }

   function redirectOAuth() {
      removeToken();

      window.location.href = toAbsoluteServerURL(
         '/auth/authorize?client_id=' + getOAuthClientId()
         + '&redirect_uri=' + getOAuthRedirectUrl()
      );
   }

   return $Api;
}());
