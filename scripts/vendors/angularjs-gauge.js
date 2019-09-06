(function (angular) {
    'use strict';
    angular
        .module('angularjs-gauge', [])
        .directive('ngGauge', gaugeMeterDirective)
        .provider('ngGauge', gaugeMeterProviderFn);

    gaugeMeterProviderFn.$inject = [];
    function gaugeMeterProviderFn() {
        var defaultOptions = {
            size: 200,
            value: undefined,
            min: 0,
            max: 100,
            cap: 'butt',
            thick: 6,
            type: 'full',
            foregroundColor: 'rgba(0, 150, 136, 1)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            duration: 1500,
            fractionSize: null,
            labelOnly: false,
        };

        this.setOptions = function (customOptions) {
            if (!(customOptions && angular.isObject(customOptions)))
                throw new Error('Invalid option type specified in the ngGaugeProvider');
            defaultOptions = angular.merge(defaultOptions, customOptions);
        };

        var ngGauge = {
            getOptions: function () {
                return angular.extend({}, defaultOptions);
            }
        };

        this.$get = function () {
            return ngGauge;
        };
    }

    gaugeMeterDirective.$inject = ['ngGauge'];

    function gaugeMeterDirective(ngGauge) {


        var tpl = '<div style="display:inline-block;text-align:center;position:relative;">' +
            '<span ng-show="{{!labelOnly}}"><u>{{prepend}}</u>' +
            '<span ng-if="fractionSize === null">{{value | number}}</span>' +
            '<span ng-if="fractionSize !== null">{{value | number: fractionSize}}</span>' +
            '<u>{{append}}</u></span>' +
            '<b>{{ label }}</b>' +
            '<canvas></canvas></div>';

        var Gauge = function (element, options) {
            this.element = element.find('canvas')[0];
            this.text = element.find('span');
            this.legend = element.find('b');
            this.unit = element.find('u');
            this.context = this.element.getContext('2d');
            this.options = options;
            this.init();
        };

        Gauge.prototype = {

            init: function () {
                this.setupStyles();
                this.create(null, null);
            },

            setupStyles: function () {

                this.context.canvas.width = this.options.size;
                this.context.canvas.height = this.options.size;
                this.context.lineCap = this.options.cap;
                this.context.lineWidth = this.options.thick;

                var lfs = this.options.size * 0.22,
                    llh = this.options.size;

                this.text.css({
                    display: 'inline-block',
                    fontWeight: 'normal',
                    width: '100%',
                    position: 'absolute',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: lfs + 'px',
                    lineHeight: llh + 'px'
                });

                this.unit.css({
                    textDecoration: 'none',
                    fontSize: '0.6em',
                    fontWeight: 200,
                    opacity: 0.8
                });

                var fs = this.options.labelOnly ? lfs * 0.8 : this.options.size / 13;
                var lh = this.options.labelOnly ? llh : (5 * fs) + parseInt(this.options.size);

                this.legend.css({
                    display: 'inline-block',
                    width: '100%',
                    position: 'absolute',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 'normal',
                    fontSize: fs + 'px',
                    lineHeight: lh + 'px'
                });
            },
            create: function (nv, ov) {

                var self = this,
                    type = this.getType(),
                    bounds = this.getBounds(type),
                    duration = this.getDuration(),
                    min = this.getMin(),
                    max = this.getMax(),
                    value = this.clamp(this.getValue(), min, max),
                    start = bounds.head,
                    unit = (bounds.tail - bounds.head) / (max - min),
                    displacement = unit * (value - min),
                    tail = bounds.tail,
                    color = this.getForegroundColorByRange(value),
                    requestID,
                    startTime;

                if (nv && ov) {
                    displacement = unit * nv - unit * ov;
                }

                function animate(timestamp) {
                    timestamp = timestamp || new Date().getTime();
                    var runtime = timestamp - startTime;
                    var progress = Math.min(runtime / duration, 1); // never exceed 100%
                    var previousProgress = ov ? (ov * unit) : 0;
                    var middle = start + previousProgress + displacement * progress;

                    self.drawShell(start, middle, tail, color);
                    if (runtime < duration) {
                        requestID = window.requestAnimationFrame(function (timestamp) {
                            animate(timestamp);
                        });
                    } else {
                        cancelAnimationFrame(requestID);
                    }
                }

                requestAnimationFrame(function (timestamp) {
                    startTime = timestamp || new Date().getTime();
                    animate(timestamp);
                });

            },

            getBounds: function (type) {
                var head, tail;
                if (type == 'semi') {
                    head = Math.PI;
                    tail = 2 * Math.PI;
                } else if (type == 'full') {
                    head = 1.5 * Math.PI;
                    tail = 3.5 * Math.PI;
                } else if (type === 'arch') {
                    head = 0.8 * Math.PI;
                    tail = 2.2 * Math.PI;
                }

                return {
                    head: head,
                    tail: tail
                };

            },

            drawShell: function (start, middle, tail, color) {
                var
                    context = this.context,
                    center = this.getCenter(),
                    radius = this.getRadius(),
                    foregroundColor = color,
                    backgroundColor = this.getBackgroundColor();

                this.clear();

                middle = Math.max(middle, start); // never below 0%
                middle = Math.min(middle, tail); // never exceed 100%


                context.beginPath();
                context.strokeStyle = backgroundColor;
                context.arc(center.x, center.y, radius, middle, tail, false);
                context.stroke();

                context.beginPath();
                context.strokeStyle = foregroundColor;
                context.arc(center.x, center.y, radius, start, middle, false);
                context.stroke();

            },

            clear: function () {
                this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
            },

            update: function (nv, ov) {
                this.create(nv, ov);
            },

            destroy: function () {
                this.clear();
            },

            getRadius: function () {
                var center = this.getCenter();
                return center.x - this.getThickness();
            },

            getCenter: function () {
                var x = this.getWidth() / 2,
                    y = this.getHeight() / 2;
                return {
                    x: x,
                    y: y
                };
            },

            getValue: function () {
                return this.options.value;
            },
            getMin: function () {
                return this.options.min;
            },
            getMax: function () {
                return this.options.max;
            },
            getWidth: function () {
                return this.context.canvas.width;
            },

            getHeight: function () {
                return this.context.canvas.height;
            },

            getThickness: function () {
                return this.options.thick;
            },

            getBackgroundColor: function () {
                return this.options.backgroundColor;
            },

            getForegroundColor: function () {
                return this.options.foregroundColor;
            },

            getForegroundColorByRange: function (value) {

                var isNumber = function (value) {
                    return value != undefined && !isNaN(parseFloat(value)) && !isNaN(Number(value));
                };

                var match = Object.keys(this.options.thresholds)
                    .filter(function (item) { return isNumber(item) && Number(item) <= value; })
                    .sort(function(a,b) {return Number(a) > Number(b);}).reverse()[0];

                return match !== undefined ? this.options.thresholds[match].color || this.getForegroundColor() : this.getForegroundColor();
            },

            getLineCap: function () {
                return this.options.cap;
            },

            getType: function () {
                return this.options.type;
            },

            getDuration: function () {
                return this.options.duration;
            },

            clamp: function (value, min, max) {
                return Math.max(min, Math.min(max, value));
            }

        };


        return {
            restrict: 'E',
            replace: true,
            template: tpl,
            scope: {
                append: '=?',
                backgroundColor: '=?',
                cap: '=?',
                foregroundColor: '=?',
                label: '=?',
                labelOnly: '=?',
                prepend: '=?',
                size: '=?',
                thick: '=?',
                type: '=?',
                duration: '=?',
                value: '=?',
                min: '=?',
                max: '=?',
                thresholds: '=?',
                fractionSize: '=?'

            },
            link: function (scope, element) {
                var defaults = ngGauge.getOptions(); // fetching default settings from provider
                scope.min = angular.isDefined(scope.min) ? scope.min : defaults.min;
                scope.max = angular.isDefined(scope.max) ? scope.max : defaults.max;
                scope.value = angular.isDefined(scope.value) ? scope.value : defaults.value;
                scope.size = angular.isDefined(scope.size) ? scope.size : defaults.size;
                scope.cap = angular.isDefined(scope.cap) ? scope.cap : defaults.cap;
                scope.thick = angular.isDefined(scope.thick) ? scope.thick : defaults.thick;
                scope.type = angular.isDefined(scope.type) ? scope.type : defaults.type;
                scope.duration = angular.isDefined(scope.duration) ? scope.duration : defaults.duration;
                scope.labelOnly = angular.isDefined(scope.labelOnly) ? scope.labelOnly : defaults.labelOnly;
                scope.foregroundColor = angular.isDefined(scope.foregroundColor) ? scope.foregroundColor : defaults.foregroundColor;
                scope.backgroundColor = angular.isDefined(scope.backgroundColor) ? scope.backgroundColor : defaults.backgroundColor;
                scope.thresholds = angular.isDefined(scope.thresholds) ? scope.thresholds : {};
                scope.fractionSize = angular.isDefined(scope.fractionSize) ? scope.fractionSize : defaults.fractionSize;

                var gauge = new Gauge(element, scope);

                scope.$watch('value', watchData, false);
                scope.$watch('min', watchData, false);
                scope.$watch('max', watchData, false);
                scope.$watch('cap', watchOther, false);
                scope.$watch('thick', watchOther, false);
                scope.$watch('type', watchOther, false);
                scope.$watch('size', watchOther, false);
                scope.$watch('duration', watchOther, false);
                scope.$watch('foregroundColor', watchOther, false);
                scope.$watch('backgroundColor', watchOther, false);
                scope.$watch('thresholds', watchOther, false);
                scope.$watch('fractionSize', watchData, false);

                scope.$on('$destroy', function () { });
                scope.$on('$resize', function () { });

                function watchData(nv, ov) {
                    if (!gauge) return;
                    if (!angular.isDefined(nv) || angular.equals(nv, ov)) return;
                    gauge.update(nv, ov);
                }

                function watchOther(nv, ov) {
                    if (!angular.isDefined(nv) || angular.equals(nv, ov)) return;
                    gauge.destroy();
                    gauge.init();
                }
            }
        };

    }
}(angular));
