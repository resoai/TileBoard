import template from './tileClimate.html';

/**
 * @ngInject
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      require: { rootCtrl: '^^ngController' },
      restrict: 'AE',
      template,
      scope: {
         item: '<',
         entity: '<',
      },
      controllerAs: 'ctrl',
      bindToController: true,
      controller: ClimateController,
   };
}

class ClimateController {
   constructor () {
      // Those are automatically injected after the controller is created.
      this.entity = {};
      this.item = {};
      this.rootCtrl = null;
   }

   climateTarget () {
      const { temperature, target_temp_low: tempLow, target_temp_high: tempHigh } = this.entity.attributes;
      const value = temperature || [tempLow, tempHigh].join(' - ');
      return this.item.filter ? this.item.filter(value) : value;
   }

   reverseLookupClimateOption (option) {
      this.initializeClimateOptions();
      for (const [key, value] of Object.entries(this.item.climateOptions)) {
         if (value === option) {
            return key;
         }
      }
      return option;
   }

   lookupClimateOption (option) {
      this.initializeClimateOptions();
      return this.item.climateOptions[option] || option;
   }

   initializeClimateOptions () {
      if (typeof this.item.climateOptions === 'undefined') {
         const options = this.item.useHvacMode ? this.entity.attributes.hvac_modes : this.entity.attributes.preset_modes;
         const resolvedOption = {};
         for (const option of options) {
            if (this.item.states !== null && typeof this.item.states === 'object') {
               resolvedOption[option] = this.item.states[option] || option;
            } else {
               resolvedOption[option] = option;
            }
         }
         this.item.climateOptions = resolvedOption;
      }
   }

   getClimateOptions () {
      this.initializeClimateOptions();
      return this.item.climateOptions;
   }

   getClimateCurrentOption () {
      const option = this.item.useHvacMode ? this.entity.state : this.entity.attributes.preset_mode;
      return this.lookupClimateOption(option);
   }

   setClimateOption (event, option) {
      event.preventDefault();
      event.stopPropagation();

      let service;
      const serviceData = {};
      const resolvedOption = this.reverseLookupClimateOption(option);

      if (this.item.useHvacMode) {
         service = 'set_hvac_mode';
         serviceData.hvac_mode = resolvedOption;
      } else {
         service = 'set_preset_mode';
         serviceData.preset_mode = resolvedOption;
      }

      this.rootCtrl.callService(this.item, 'climate', service, serviceData);
      this.rootCtrl.closeActiveSelect();

      return false;
   }


   increaseClimateTemp (event) {
      event.preventDefault();
      event.stopPropagation();

      let value = parseFloat(this.entity.attributes.temperature);

      value += (this.entity.attributes.target_temp_step || 1);

      if (this.entity.attributes.max_temp) {
         value = Math.min(value, this.entity.attributes.max_temp);
      }

      this.setClimateTemp(value);

      return false;
   }

   decreaseClimateTemp (event) {
      event.preventDefault();
      event.stopPropagation();

      let value = parseFloat(this.entity.attributes.temperature);

      value -= (this.entity.attributes.target_temp_step || 1);

      if (this.entity.attributes.min_temp) {
         value = Math.max(value, this.entity.attributes.min_temp);
      }

      this.setClimateTemp(value);

      return false;
   }

   setClimateTemp (value) {
      this.rootCtrl.callService(this.item, 'climate', 'set_temperature', { temperature: value });
   }
}
