var Noty = (function () {
   var updatesListeners = [];
   var updatesFired = false;

   var Noty = function (data) {
      this.setData(data);
   };

   Noty.prototype.setData = function (data) {
      this.id = data.id || Math.random();
      this.title = data.title;
      this.message = data.message;
      this.icon = data.icon;
      this.lifetime = data.lifetime;
      this.type = data.type || Noty.INFO;

      this._timeout = null;

      this.resetTimeout();

      var self = this;

      setTimeout(function () {
         self.showed = true;

         Noty.fireUpdate();
      }, 100);

      Noty.fireUpdate();
   };

   Noty.prototype.resetTimeout = function () {
      var self = this;

      this.clearTimeout();

      if(this.lifetime) {
         this._timeout = setTimeout(function () {
            Noty.remove(self);
            Noty.fireUpdate();
         }, this.lifetime * 1000);
      }
   };

   Noty.prototype.getClasses = function () {
      if(!this._classes) {
         this._classes = [];
      }

      this._classes.length = 0;

      this._classes.push('-' + this.type);

      if(this.showed) this._classes.push('-showed');

      return this._classes;
   };

   Noty.prototype.getLifetimeStyles = function () {
      if(!this._lifetimeStyles) {
         this._lifetimeStyles = {};

         if(this.lifetime) {
            this._lifetimeStyles.animationDuration = this.lifetime + 's';
         }
      }

      return this._lifetimeStyles;
   };

   Noty.prototype.clearTimeout = function () {
      if(this._timeout) clearTimeout(this._timeout);
   };

   Noty.prototype.remove = function () {
      Noty.remove(this);
   };

   Noty.noties = [];
   Noty.notiesHistory = [];

   Noty.INFO = 'info';
   Noty.WARNING = 'warning';
   Noty.ERROR = 'error';
   Noty.SUCCESS = 'success';

   Noty.onUpdate = function (callback) {
      if(updatesListeners.indexOf(callback) !== -1) {
         return function () {}
      }

      updatesListeners.push(callback);

      return function () {
         updatesListeners = updatesListeners.filter(function (a) {
            return a !== callback;
         });
      }
   };

   Noty.fireUpdate = function () {
      if(updatesFired) return;

      updatesFired = true;

      updatesListeners.forEach(function (callback) {
         try {
            setTimeout(function () {
               updatesFired = false;
               callback();
            }, 0);
         }
         catch (e) {}
      });

      setTimeout(function () {
         updatesFired = false;
      }, 0);
   };

   Noty.add = function (type, title, message, icon, lifetime, id) {
      return Noty.addObject({
         type: type,
         title: title,
         message: message,
         icon: icon,
         lifetime: lifetime,
         id: id
      });
   };

   Noty.addObject = function (data) {
      if(data.id && Noty.getById(data.id)) {
         var oldNoty = Noty.getById(data.id);

         oldNoty.setData(data);

         return oldNoty;
      }

      var noty = new Noty(data);

      Noty.noties.push(noty);
      Noty.notiesHistory.push(noty);

      return noty;
   };

   Noty.getById = function (id) {
      for(var i = 0; i < Noty.noties.length; i++) {
         if(Noty.noties[i].id === id) {
            return Noty.noties[i];
         }
      }

      return null;
   };

   Noty.hasSeenNoteId = function (id) {
      for(var i = 0; i < Noty.notiesHistory.length; i++) {
         if(Noty.notiesHistory[i].id === id) {
            return true;
         }
      }

      return false;
   };

   Noty.remove = function (noty) {
      Noty.noties = Noty.noties.filter(function (n) {
         return n !== noty;
      });
   };

   Noty.removeAll = function () {
      Noty.noties = [];
   };

   return Noty;
}());
