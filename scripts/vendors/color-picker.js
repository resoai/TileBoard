/*
 * Color Picker Angular directive
 * https://github.com/Alberplz/angular-colorpicker-directive
 *
 * Alberto Pujante
 * 
 * @licence: http://opensource.org/licenses/MIT
 */
/* With updates specific for tileboard
 * https://github.com/danhounshell/angular-colorpicker-directive/tree/tileboard-mods
 */
'use strict';
var colorPicker = angular.module('colorpicker', [])
        .factory('ColorHelper', function () {

            return{
                hsla2hsva: function (hsla) {
                    var h = Math.min(hsla.h, 1), s = Math.min(hsla.s, 1), l = Math.min(hsla.l, 1), a = Math.min(hsla.a, 1);
                    if (l === 0) {
                        return {h: h, s: 0, v: 0, a: a};
                    } else {
                        var v = l + s * (1 - Math.abs(2 * l - 1)) / 2;
                        return {h: h, s: 2 * (v - l) / v, v: v, a: a};
                    }
                },
                hsva2hsla: function (hsva) {
                    var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
                    if (v === 0) {
                        return {h: h, s: 0, l: 0, a: a};
                    } else if (s === 0 && v === 1) {
                        return {h: h, s: 1, l: 1, a: a};
                    } else {
                        var l = v * (2 - s) / 2;
                        return {h: h, s: v * s / (1 - Math.abs(2 * l - 1)), l: l, a: a};
                    }
                },
                rgbaToHsva: function (rgba) {
                    var r = Math.min(rgba.r, 1), g = Math.min(rgba.g, 1), b = Math.min(rgba.b, 1), a = Math.min(rgba.a, 1);
                    var max = Math.max(r, g, b), min = Math.min(r, g, b);
                    var h, s, v = max;
                    var d = max - min;

                    s = max === 0 ? 0 : d / max;
                    if (max === min) {
                        h = 0; // achromatic
                    } else {
                        switch (max) {
                            case r:
                                h = (g - b) / d + (g < b ? 6 : 0);
                                break;
                            case g:
                                h = (b - r) / d + 2;
                                break;
                            case b:
                                h = (r - g) / d + 4;
                                break;
                        }
                        h /= 6;
                    }
                    return {h: h, s: s, v: v, a: a};
                },
                hsvaToRgba: function (hsva) {
                    var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
                    var r, g, b;
                    var i = Math.floor(h * 6);
                    var f = h * 6 - i;
                    var p = v * (1 - s);
                    var q = v * (1 - f * s);
                    var t = v * (1 - (1 - f) * s);

                    switch (i % 6) {
                        case 0:
                            r = v, g = t, b = p;
                            break;
                        case 1:
                            r = q, g = v, b = p;
                            break;
                        case 2:
                            r = p, g = v, b = t;
                            break;
                        case 3:
                            r = p, g = q, b = v;
                            break;
                        case 4:
                            r = t, g = p, b = v;
                            break;
                        case 5:
                            r = v, g = p, b = q;
                            break;
                    }
                    return {r: r, g: g, b: b, a: a};
                },
                stringToHsva: function (string) {
                    //reg expressions https://github.com/jquery/jquery-color/
                    var stringParsers = [
                        {
                            re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                            parse: function (execResult) {
                                return [
                                    'rgb',
                                    parseInt(execResult[2]),
                                    parseInt(execResult[3]),
                                    parseInt(execResult[4]),
                                    isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5])
                                ];
                            }
                        },
                        {
                            re: /(hsl)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                            parse: function (execResult) {
                                return [
                                    'hsl',
                                    parseInt(execResult[2]),
                                    parseInt(execResult[3]),
                                    parseInt(execResult[4]),
                                    isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5])
                                ];
                            }
                        },
                        {
                            re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
                            parse: function (execResult) {
                                return [
                                    'hex',
                                    parseInt(execResult[1], 16),
                                    parseInt(execResult[2], 16),
                                    parseInt(execResult[3], 16),
                                    1
                                ];
                            }
                        }
                        , {
                            re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
                            parse: function (execResult) {
                                return [
                                    'hex',
                                    parseInt(execResult[1] + execResult[1], 16),
                                    parseInt(execResult[2] + execResult[2], 16),
                                    parseInt(execResult[3] + execResult[3], 16),
                                    1
                                ];
                            }
                        }
                    ];
                    string = ( typeof string === "string" ) ? string.toLowerCase() : string;
                    var hsva = null;
                    for (var key in stringParsers) {
                        if (stringParsers.hasOwnProperty(key)) {
                            var parser = stringParsers[key];
                            var match = parser.re.exec(string), values = match && parser.parse(match);
                            if (values) {
                                if (values[0] === 'hex' || values[0] === 'rgb') {
                                    hsva = this.rgbaToHsva({r: values[1] / 255, g: values[2] / 255, b: values[3] / 255, a: values[4]});
                                } else {
                                    hsva = this.hsla2hsva({h: values[1] / 360, s: values[2] / 100, l: values[3] / 100, a: values[4]});
                                }
                                return hsva;
                            }
                        }
                    }
                    return hsva;
                }
            };
        });
colorPicker.directive('colorPicker', ['$document', '$compile', 'ColorHelper', function ($document, $compile, ColorHelper) {
        return {
            restrict: 'A',
            scope: {colorPickerModel: '=', colorPickerOutputFormat: '=', colorPickerItem: '='},
            controller: ['$scope', function ($scope) {
                    $scope.show = false;
                    $scope.sAndLMax = {};
                    $scope.hueMax = {};
                    $scope.alphaMax = {};
                    $scope.type = 0;
                    $scope.hsva = {h: 0.5, s: 1, v: 1, a: 1};
                    $scope.hueSlider = {left: 0};
                    $scope.sAndLSlider = {left: 0, top: 0};
                    $scope.alphaSlider = {left: 0};
                    $scope.rbgaSteps = {r: 1, g: 1, b: 1, a: 0.1};
                    $scope.hslaSteps = {h: 1, s: 1, l: 1, a: 0.1};
                    $scope.cancelButtonClass = '';
                    $scope.showCancelButton = false;
                    $scope.extraLargeClass = '';
                    
                    if ($scope.colorPickerOutputFormat === 'rgba') {
                        $scope.type = 1;
                    } else if ($scope.colorPickerOutputFormat === 'hsla') {
                        $scope.type = 2;
                    }

                    $scope.setSaturation = function (v, rg) {
                        var hsla = ColorHelper.hsva2hsla($scope.hsva);
                        hsla.s = v / rg;
                        $scope.hsva = ColorHelper.hsla2hsva(hsla);
                    };

                    $scope.setLightness = function (v, rg) {
                        var hsla = ColorHelper.hsva2hsla($scope.hsva);
                        hsla.l = v / rg;
                        $scope.hsva = ColorHelper.hsla2hsva(hsla);
                    };

                    $scope.setHue = function (v, rg) {
                        $scope.hsva.h = v / rg;
                    };

                    $scope.setAlpha = function (v, rg) {
                        $scope.hsva.a = v / rg;
                    };

                    $scope.setR = function (v, rg) {
                        var rgba = ColorHelper.hsvaToRgba($scope.hsva);
                        rgba.r = v / rg;
                        $scope.hsva = ColorHelper.rgbaToHsva(rgba);
                    };

                    $scope.setG = function (v, rg) {
                        var rgba = ColorHelper.hsvaToRgba($scope.hsva);
                        rgba.g = v / rg;
                        $scope.hsva = ColorHelper.rgbaToHsva(rgba);
                    };

                    $scope.setB = function (v, rg) {
                        var rgba = ColorHelper.hsvaToRgba($scope.hsva);
                        rgba.b = v / rg;
                        $scope.hsva = ColorHelper.rgbaToHsva(rgba);
                    };

                    $scope.setSaturationAndBrightness = function (s, v, rgX, rgY) {
                        $scope.hsva.s = s / rgX;
                        $scope.hsva.v = v / rgY;
                    };

                    $scope.update = function () {
                        var hsla = ColorHelper.hsva2hsla($scope.hsva);
                        $scope.hslaText = {h: Math.round((hsla.h) * 360), s: Math.round(hsla.s * 100), l: Math.round(hsla.l * 100), a: Math.round(hsla.a * 100) / 100};

                        var rgba = denormalizeRGBA(ColorHelper.hsvaToRgba($scope.hsva));
                        var hueRgba = denormalizeRGBA(ColorHelper.hsvaToRgba({h: $scope.hsva.h, s: 1, v: 1, a: 1}));

                        $scope.rgbaText = {r: rgba.r, g: rgba.g, b: rgba.b, a: Math.round(rgba.a * 100) / 100};
                        $scope.hexText = '#' + ((1 << 24) | (parseInt(rgba.r, 10) << 16) | (parseInt(rgba.g, 10) << 8) | parseInt(rgba.b, 10)).toString(16).substr(1);

                        if ($scope.hexText[1] === $scope.hexText[2] && $scope.hexText[3] === $scope.hexText[4] && $scope.hexText[5] === $scope.hexText[6]) {
                            $scope.hexText = '#' + $scope.hexText[1] + $scope.hexText[3] + $scope.hexText[5];
                        }

                        $scope.alphaSliderColor = 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';
                        $scope.hueSliderColor = 'rgb(' + hueRgba.r + ',' + hueRgba.g + ',' + hueRgba.b + ')';

                        if ($scope.type === 0 && $scope.hsva.a < 1) {
                            $scope.type++;
                        }

                        //var outputFormat = 'rgba';
                        if ($scope.hsva.a < 1) {
                            switch ($scope.colorPickerOutputFormat) {
                                case 'hsla':
                                    $scope.outputColor = 'hsla(' + $scope.hslaText.h + ',' + $scope.hslaText.s + '%,' + $scope.hslaText.l + '%,' + $scope.hslaText.a + ')';
                                    break;
                                default:
                                    $scope.outputColor = 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + Math.round(rgba.a * 100) / 100 + ')';
                                    break;
                            }
                        } else {
                            switch ($scope.colorPickerOutputFormat) {
                                case 'hsla':
                                    $scope.outputColor = 'hsl(' + $scope.hslaText.h + ',' + $scope.hslaText.s + '%,' + $scope.hslaText.l + '%)';
                                    break;
                                case 'rgba':
                                    $scope.outputColor = $scope.alphaSliderColor;
                                    break;
                                default:
                                    $scope.outputColor = $scope.hexText;
                                    break;
                            }
                        }

                        $scope.sAndLSlider = {left: $scope.hsva.s * $scope.sAndLMax.x - 8 + 'px', top: (1 - $scope.hsva.v) * $scope.sAndLMax.y - 8 + 'px'};
                        $scope.hueSlider.left = ($scope.hsva.h) * $scope.hueMax.x - 8 + 'px';
                        $scope.alphaSlider.left = $scope.hsva.a * $scope.alphaMax.x - 8 + 'px';
                        $scope.alphaInvalidClass = '';
                    };

                    $scope.setColorFromHex = function (string) {
                        var hsva = ColorHelper.stringToHsva(string);
                        if (hsva !== null) {
                            $scope.hsva = hsva;
                        }
                        return hsva;
                    };

                    $scope.typePolicy = function () {
                        $scope.type = ($scope.type + 1) % 3;
                        if ($scope.type === 0 && $scope.hsva.a < 1) {
                            $scope.type++;
                        }
                        return $scope.type;
                    };

                    function denormalizeRGBA(rgba) {
                        return {r: Math.round(rgba.r * 255), g: Math.round(rgba.g * 255), b: Math.round(rgba.b * 255), a: rgba.a};
                    }

                }],
            link: function (scope, element, attr) {
                var template, close = false, initialValue = '';

                if (scope.colorPickerModel === undefined) {
                    scope.colorPickerModel = '#008fff';
                    element.val('');
                }
                if (attr.colorPickerShowValue === undefined) {
                    attr.colorPickerShowValue = 'true';
                }
                if (attr.colorPickerPosition === undefined) {
                    attr.colorPickerPosition = 'right';
                }
                if (attr.colorPickerShowInputSpinner === undefined) {
                    attr.colorPickerShowInputSpinner = 'false';
                }
                if (attr.colorPickerShowCancelButton === undefined) {
                    attr.colorPickerShowCancelButton = 'false';
                }
                if (attr.colorPickerShowCancelButton === 'true') {
                    scope.showCancelButton = true;
                    scope.extraLargeClass = 'color-picker-extra-large';
                }
                if (attr.colorPickerCancelButtonClass !== undefined) {
                    scope.cancelButtonClass = attr.colorPickerCancelButtonClass;                    
                }

                if (attr.colorPickerSpinnerRgbaSteps !== undefined && attr.colorPickerSpinnerRgbaSteps.match(/^\d+;\d+;\d+;[0-9]+([\.][0-9]{1,2})?$/) !== null) {
                    var steps = attr.colorPickerSpinnerRgbaSteps.split(';');
                    scope.rbgaSteps = {r: steps[0], g: steps[1], b: steps[2], a: steps[3]};

                }
                if (attr.colorPickerSpinnerHslaSteps !== undefined && attr.colorPickerSpinnerHslaSteps.match(/^\d+;\d+;\d+;[0-9]+([\.][0-9]{1,2})?$/) !== null) {
                    var steps = attr.colorPickerSpinnerHslaSteps.split(';');
                    scope.hslaSteps = {h: steps[0], s: steps[1], l: steps[2], a: steps[3]};
                }

                updateFromString(scope.colorPickerModel);
                if (attr.colorPickerShowValue === 'true') {
                    element.val(scope.outputColor);
                }

                template = angular.element('<div ng-show="show" class="color-picker {{extraLargeClass}}">' +
                        '   <div class="arrow arrow-' + attr.colorPickerPosition + '"></div>' +
                        '   <div slider rg-x=1 rg-y=1 action="setSaturationAndBrightness(s, v, rgX, rgY)" class="saturation-lightness" ng-style="{\'background-color\':hueSliderColor}">' +
                        '       <div class="cursor-sv" ng-style="{\'top\':sAndLSlider.top, \'left\':sAndLSlider.left}"></div>' +
                        '   </div>' +
                        '   <div slider rg-x=1 action="setHue(v, rg)" class="hue" style="top: 160px">' +
                        '       <div class="cursor" ng-style="{\'left\':hueSlider.left}"></div>' +
                        '   </div>' +
                        //'   <div slider rg-x=1 action="setAlpha(v, rg)" class="alpha" ng-style="{\'background-color\':alphaSliderColor}">' +
                        //'       <div class="cursor" ng-style="{\'left\':alphaSlider.left}"></div>' +
                        //'   </div>' +
                        '   <div class="selected-color-background"></div>' +
                        '   <div class="selected-color" ng-style="{\'background-color\':outputColor}"></div>' +
                        //'   <div ng-show="type==2" class="hsla-text">' +
                        //'       <input text type="number" pattern="[0-9]*" min="0" max="360" step="' + scope.hslaSteps.h + '" rg=360 action="setHue(v, rg)" ng-model="hslaText.h" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        //'       <input text type="number" pattern="[0-9]*" min="0" max="100" step="' + scope.hslaSteps.s + '" rg=100 action="setSaturation(v, rg)" ng-model="hslaText.s" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        //'       <input text type="number" pattern="[0-9]*" min="0" max="100" step="' + scope.hslaSteps.l + '" rg=100 action="setLightness(v, rg)" ng-model="hslaText.l" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        //'       <input text type="number" pattern="[0-9]+([\.,][0-9]{1,2})?" min="0" max="1" step="' + scope.hslaSteps.a + '" rg=1 action="setAlpha(v, rg)" ng-model="hslaText.a" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        //'       <div>H</div><div>S</div><div>L</div><div>A</div>' +
                        //'   </div>' +
                        '   <div ng-show="type==1" class="rgba-text" style="left: 40px; top: 210px">' +
                        '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.r + '" rg=255 action="setR(v, rg)" ng-model="rgbaText.r" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.g + '" rg=255 action="setG(v, rg)" ng-model="rgbaText.g" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.b + '" rg=255 action="setB(v, rg)" ng-model="rgbaText.b" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        //'       <input text type="number" pattern="[0-9]+([\.,][0-9]{1,2})?" min="0" max="1" step="' + scope.rbgaSteps.a + '" rg=1 action="setAlpha(v, rg)" ng-model="rgbaText.a" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
                        '       <br /><div>R</div><div>G</div><div>B</div><!--div>A</div-->' +
                        '   </div>' +
                        //'   <div class="hex-text" ng-show="type==0">' +
                        //'       <input text type="text" action="setColorFromHex(string)" ng-model="hexText"/>' +
                        //'       <div>HEX</div>' +
                        //'   </div>' +
                        // '   <div ng-click="typePolicy()" class="type-policy"></div>' +
                        '   <button type="button" class="{{cancelButtonClass}}" ng-show="showCancelButton" ng-click="cancelColor()">Cancel</button>' +
                        '</div>');

                document.getElementsByTagName("body")[0].appendChild(template[0]);
                $compile(template)(scope);

                function updateFromString(string) {
                    var hsva = ColorHelper.stringToHsva(string);
                    if (hsva !== null) {
                        scope.hsva = hsva;
                        scope.update();
                    }
                }

                element.on('paste', delayedUpdate);
                function delayedUpdate() {
                    setTimeout(function () {
                        keyup();
                    }, 5);
                }

                element.on('keyup', keyup);
                function keyup() {
                    scope.$apply(function () {
                        attr.colorPickerShowValue = 'true';
                        updateFromString(element.val());
                        scope.colorPickerModel = element.val();
                    });
                }

                scope.$on('color-changed', function (event) {
                    scope.$apply(function () {
                        scope.update();
                        // scope.colorPickerModel = scope.outputColor;
                        if (attr.colorPickerShowValue === 'true') {
                            element.val(scope.outputColor);
                        }
                    });
                });

                scope.cancelColor = function () {
                    scope.colorPickerModel = initialValue;
                    scope.show = false;
                    updateFromString(scope.colorPickerModel);
                    $document.off('mousedown', mousedown);
                    angular.element(window).off('resize', resize);
                };

                element.on('click', open);
                function open(event) {        
                    initialValue = scope.colorPickerModel;
                    scope.$apply(function () {
                        scope.show = true;
                    });                    
                    scope.$apply(function () {
                        scope.sAndLMax = {x: template[0].getElementsByClassName("saturation-lightness")[0].offsetWidth, y: template[0].getElementsByClassName("saturation-lightness")[0].offsetHeight};
                        scope.hueMax = {x: template[0].getElementsByClassName("hue")[0].offsetWidth};
                        // scope.alphaMax = {x: template[0].getElementsByClassName("alpha")[0].offsetWidth};
                        scope.update();
                    });
                    setDialogPosition();
                    $document.on('mousedown', mousedown);
                    angular.element(window).on('resize', resize);
                }
                
                function resize(){    
                    setDialogPosition();
                }
                
                function setDialogPosition() {
                    var box;
                    if (attr.colorPickerFixedPosition === 'true') {
                        box = createBox(element[0], false);
                        template[0].style.position = "fixed";
                    } else {
                        box = createBox(element[0], true);
                    }
                    if (attr.colorPickerPosition === "left") {
                        template[0].style.top = box.top + 'px';
                        template[0].style.left = (box.left - 252) + 'px';
                    } else if (attr.colorPickerPosition === "top") {
                        template[0].style.top = (box.top - box.height - 284) + 'px';
                        template[0].style.left = (box.left) + 'px';
                    } else if (attr.colorPickerPosition === "bottom") {
                        template[0].style.top = (box.top + box.height + 10) + 'px';
                        template[0].style.left = (box.left) + 'px';
                    }
                    else {
                        template[0].style.top = box.top + 'px';
                        template[0].style.left = (box.left + box.width) + 'px';
                    }
                }                                

                element.on('$destroy', function () {
                    element.off('click', open);
                    element.off('keyup', keyup);
                    element.off('paste', delayedUpdate);
                });

                scope.notifyColorChanged = function() {
                    scope.$emit( 'colorpicker-colorupdated', 
                        { 
                            item: scope.colorPickerItem, 
                            color: scope.outputColor 
                        } 
                    );                    
                }

                function mousedown(event) {
                    if (event.target !== element[0] && template[0] !== event.target && !isDescendant(template[0], event.target)) {
                        scope.$apply(function () {
                            scope.notifyColorChanged();
                            scope.show = false;
                        });
                        $document.off('mousedown', mousedown);
                        angular.element(window).off('resize', resize);
                    }
                }

                function isDescendant(parent, child) {
                    var node = child.parentNode;
                    while (node !== null) {
                        if (node === parent) {
                            return true;
                        }
                        node = node.parentNode;
                    }
                    return false;
                }

                function createBox(element, offset) {
                    return {
                        top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
                        left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
                        width: element.offsetWidth,
                        height: element.offsetHeight
                    };
                }
            }};
    }]);
colorPicker.directive('text', [function () {
        return {
            restrict: 'A',
            scope: {
                action: '&'
            },
            link: function (scope, element, attr) {
                element.on('paste', delayedUpdate);
                element.on('keyup', update);
                element.on('change', update);
                element.on('focus', showSpinner);
                element.on('blur', hideSpinner);
                element.on('mouseover', showSpinner);
                element.on('mouseout', hideSpinner);
                element.addClass('color-picker-input-spinner');

                function showSpinner(event) {
                    if (attr.spinner === "true") {
                        element.removeClass('color-picker-input-spinner');
                    }
                }

                function hideSpinner(event) {
                    element.addClass('color-picker-input-spinner');
                }

                function delayedUpdate(event) {
                    setTimeout(function () {
                        update(event);
                    }, 5);
                }

                function update(event) {
                    if (attr.rg === undefined) {
                        if (scope.action({string: element.val()})) {
                            scope.$emit('color-changed');
                        }
                    } else {
                        var value = parseFloat(element.val());
                        if (!isNaN(value)) {
                            value = Math.abs(Math.min(parseFloat(element.val()), attr.rg));
                            scope.action({v: value, rg: attr.rg});
                            scope.$emit('color-changed');
                            scope.$emit('alpha-valid');
                        } else {
                            scope.$emit('alpha-invalid');
                        }
                    }
                }
                element.on('$destroy', function () {
                    element.off('paste', delayedUpdate);
                    element.off('keyup', update);
                    element.off('change', update);
                    element.off('focus', showSpinner);
                    element.off('blur', hideSpinner);
                    element.off('mouseover', showSpinner);
                    element.off('mouseout', hideSpinner);
                });
            }
        }
    }]);
colorPicker.directive('slider', ['$document', '$window', function ($document, $window) {
        return {
            restrict: 'A',
            scope: {
                action: '&'
            },
            link: function (scope, element, attr) {
                element.on('mousedown touchstart', mousedown);
                function mousedown(event) {
                    setCursor(event);
                    $document.on('mousemove touchmove', mousemove);
                }
                $document.on('mouseup touchend', function () {
                    $document.off('mousemove touchmove', mousemove);
                });
                function mousemove(event) {
                    event.preventDefault();
                    setCursor(event);
                }

                function setCursor(event) {
                    var maxTop = element[0].offsetHeight;
                    var maxLeft = element[0].offsetWidth;
                    var x = Math.max(0, Math.min(getX(event, element[0]), maxLeft));
                    var y = Math.max(0, Math.min(getY(event, element[0]), maxTop));
                    if (attr.rgX !== undefined && attr.rgY !== undefined) {
                        scope.action({s: x / maxLeft, v: (1 - y / maxTop), rgX: attr.rgX, rgY: attr.rgY});
                    } /*else if (attr.rgX === undefined && attr.rgY !== undefined) {
                     scope.action({v: y / maxTop, rg: attr.rgY});
                     }*/ else {
                        scope.action({v: x / maxLeft, rg: attr.rgX});
                    }
                    scope.$emit('color-changed');
                }

                function getX(event, element) {
                    return (event.pageX !== undefined ? event.pageX : event.touches[0].pageX) - element.getBoundingClientRect().left - $window.pageXOffset;
                }
                function getY(event, element) {
                    return (event.pageY !== undefined ? event.pageY : event.touches[0].pageY) - element.getBoundingClientRect().top - $window.pageYOffset;
                }
                element.on('$destroy', function () {
                    element.off('mousedown touchend', mousedown);
                });
            }};
    }]);