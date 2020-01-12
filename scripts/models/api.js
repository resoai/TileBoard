App.provider('Api', function () {
   var wsUrl;
   var authToken;

   this.setInitOptions = function (options) {
      wsUrl = options.wsUrl;
      authToken = options.authToken;
   };

   this.$get = ['$http', '$location', '$q', function ($http, $location, $q) {
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

         this._getToken().then(function (token) {
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

      $Api.prototype.rest = function (requestStub) {
         var request = angular.copy(requestStub);
         request.url = toAbsoluteServerURL(request.url);
         request.headers = request.headers || {};
         request.headers.Authorization = 'Bearer ' + this._token;
         return $http(request)
            .then(function (response) {
               return response.data;
            })
            .catch(function (response) {
               switch (response.status) {
                  case 401:
                     redirectOAuth();
                  default:
                     Noty.add(Noty.ERROR, 'Error in REST api', 'Code ' + response.status + ' retrieved for ' + request.url + '.');
                     return null;
               }
            });
      };

      $Api.prototype.getHistory = function (startDate, filterEntityId, endDate) {
         var request = {
            type: 'GET',
            url: '/api/history/period'
         };
         if (startDate) request.url += '/' + startDate;
         if (endDate) {
            request.url += '?end_time=' + endDate;
         } else {
            request.url += '?end_time=' + new Date(Date.now()).toISOString();
         }
         if (filterEntityId) {
            var entityIds = filterEntityId instanceof Array ? filterEntityId.join(',') : filterEntityId;
            request.url += '&filter_entity_id=' + entityIds;
         }
         return this.rest(request);
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

      $Api.prototype._tokenRequest = function (data) {
         var request = {
            method: 'POST',
            url: toAbsoluteServerURL('/auth/token'),
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data + '&client_id=' + getOAuthClientId()
         }

         return $http(request)
            .then(function (response) {
               return response.data;
            })
            .catch(function (response) {
               if (response.status >= 400 && response.status <= 499) {  // authentication error
                  redirectOAuth();
               } else {
                  return null;
               }
            });
      };

      $Api.prototype._refreshToken = function () {
         var self = this;

         this._getFreshToken().then(function (token) {
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

      $Api.prototype._getFreshToken = function () {
         var token = readToken();

         var data = 'grant_type=refresh_token&refresh_token=' + token.refresh_token;

         return this._tokenRequest(data).then(function (data) {
            if(!data) {
               return null;
            }

            data.refresh_token = token.refresh_token;

            saveToken(data);

            return data;
         });
      };

      $Api.prototype._getTokenByCode = function (code) {
         var data = 'grant_type=authorization_code&code=' + code;

         return this._tokenRequest(data).then(function (data) {
            if(!data) {
               return null;
            }

            saveToken(data);

            return data;
         });
      };

      $Api.prototype._getToken = function () {
         if(this._configToken) {
            return $q.resolve({access_token: this._configToken});
         }

         var token = readToken();

         if (token) {
            return this._getFreshToken();
         }

         var params = $location.search();

         if (params.oauth && params.code) {
            var code = params.code;

            // Remove oauth params to clean up the URL.
            $location.search('oauth', null).search('code', null);

            return this._getTokenByCode(code);
         }

         redirectOAuth();
         return $q.resolve(null);
      };

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

      return new $Api(wsUrl, authToken);
   }];
});
