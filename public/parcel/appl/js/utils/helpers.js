/*eslint no-undef: 'error'*/
/*eslint no-console: ['error', { allow: ['warn', 'error'] }] */

var moment = require('moment');
var callbacks = require('can-view-callbacks');

module.exports = {
    scrollTop: function () {
        $('html, body').animate({
            scrollTop: 0
        }, 'slow');
    },
    convertToBoolean: function (value) {

        if (!this.isNullOrEmpty(value)) {
            return false;
        }

        if (typeof value === 'string') {
            switch (value.toLowerCase()) {
                case 'true':
                case 'yes':
                case '1':
                    return true;
                case 'false':
                case 'no':
                case '0':
                    return false;
            }
        }

        return Boolean(value);
    },
    parseJson: function (json) {
        return (JSON && JSON.parse(json)) || $.parseJSON(json);
    },
    isNullOrEmpty: function (value) {
        return typeof value === 'undefined' || value === null || value.length === 0;
    },
    getValueOrDefault: function (value, defaultValue) {
        return !this.isNullOrEmpty(value) ? value : defaultValue;
    },
    /* eslint no-extend-native: 0 */
    endsWith: function (str, endswith) {
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function (suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }
        return str.endsWith(endswith);
    },
    getWeekKeys: function () {
        var nthWeek = moment().format('w');
        var year = moment().format('TYYYY');
        var weekKeys = [];

        for (var i = 1; i <= nthWeek; i++) {
            var week = ('0' + i).slice(-2);
            weekKeys.push(year + week);
        }
        return weekKeys;
    },
    setJobTypeSelector: function (Component, Map, osKeys, values, template) { 
        var current = osKeys[0];
        if (values) {
            current = values[0]; 
        }

        //Eliminate the warning that tag is already defined.
        if (!callbacks._tags['jobtype-selector']) {
            Component.extend({
                tag: 'jobtype-selector',
                view: Stache('<select  class="jobtype-selector" value:bind="selectedJobType">' +
                        this.getOptions(osKeys, values) +
                        '</select>'),
                ViewModel: function () {
                    var selectedJobType = { selectedJobType: current };
                    return new Map(selectedJobType);
                },
                events: {
                    '.jobtype-selector change': function () {
                        var selectedJobType = this.viewModel.selectedJobType;
                        if (!selectedJobType) {
                            return false;
                        }
                        var tbodyTemplate = template; 
                        var toolsUrl = 'templates/tools_';
/* develblock:start */                                  
                        if (testit) {
                            toolsUrl = 'base/' + window._bundler + '/appl/' + toolsUrl;
                        }
/* develblock:end */                                   
                        $.get(toolsUrl + selectedJobType + '.json', function (data) {
                            if (selectedJobType === 'ful') {
                                data.all = false;
                            }

                            var tbody = tbodyTemplate(data);
                            $('.tablesorter tbody').html(tbody).trigger('update');
                        }, 'json').fail(function (data, err) {
                            console.warn('Error fetching fixture data: ' + err);
                        });
                    }
                }
            });
        }
    },
    getOptions: function (keys, values) {

        if (!values || values.length !== keys.length) {
            values = keys;
        }

        var options = '<option value=""></option>';
        for (var i = 0; i < keys.length; i++) {
            options = options + '<option value="' + values[i] + '">' + keys[i] + '</option>';
        }

        return options;
    },
    //Insert loaded html into main_container or specified element
    renderer: function (controller, options) {
        var helper = this;

        return function (frag) {
            const selector = typeof options.selector !== 'undefined' ? options.selector : '#main_container';
            let el = $(selector);
            
            el = $(selector);
            el.empty();

            var fade = helper.getValueOrDefault(controller.options.fade, controller.options.fade);

            //If loading(long running load from backend) don't fade-in).
            if (fade && !controller.loading) {
                el.hide().html(frag).fadeIn(fade);
            } else {
                el.html(frag);
            }

            if (controller.options.fnLoad) {
                controller.options.fnLoad(el);
            }

            //listener on contact page
            if (options.contactListener) {
                options.contactListener(el);
            }

            controller.on();
            helper.scrollTop();
        };
    }
/* develblock:start */
    /* develblock:start */
    /* eslint comma-style: ['error', 'first', { 'exceptions': { 'ArrayExpression': true, 'ObjectExpression': true } }] */
    ,
    // Custom promise for async call for a resource.  
    // If the DOM (#main_container) is populated then the promise is complete.
    isResolved: function isResolved (resolve, reject, selectorId, counter, length) {
        var container = document.querySelector('#main_' + selectorId);
        if (!container) {
            resolve('loaded');
            return true;
        }

        if (container && container.children.length > length) {
            resolve('loaded - with counter/length: ' + counter + ' - ' + container.children.length);
        } else {
            counter++;
            if (counter > 175) {
                reject('failed');
            } else {
                var time = Math.random() * 100 + 100;

                setTimeout(function () {
                    isResolved(resolve, reject, selectorId, counter, length);
                }, time);
            }
        }
        return true;
    },
    getResource (selector, startCount, childrenLength) {
        return new Promise((resolve, reject) => {
            this.isResolved(resolve, reject, selector, startCount, childrenLength)
        }).catch(rejected => {
            fail(`The ${selector} Page did not load within limited time: ${rejected}`)
        }).then(resolved => {
            return resolved
        })
    },
    //Per Stack Overflow - Fire a click event in raw javascript
    /* global extend:true */
    fireEvent (...args) {
        let eventType = null
        let i
        let j
        let k
        let l
        let event

        const einstellungen = {
            'pointerX': 0,
            'pointerY': 0,
            'button': 0,
            'ctrlKey': false,
            'altKey': false,
            'shiftKey': false,
            'metaKey': false,
            'bubbles': true,
            'cancelable': true
        }
        const moeglicheEvents = [
            ['HTMLEvents', ['load', 'unload', 'abort', 'error', 'select', 'change', 'submit', 'reset', 'focus', 'blur', 'resize', 'scroll']],
            ['MouseEvents', ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout']]
        ];
        for (i = 0, j = moeglicheEvents.length; i < j; ++i) {
            for (k = 0, l = moeglicheEvents[i][1].length; k < l; ++k) {
                if (arguments[1] === moeglicheEvents[i][1][k]) {
                    eventType = moeglicheEvents[i][0];
                    i = j;
                    k = l;
                }
            }
        }

        if (arguments.length > 2) {
            if ((typeof arguments[2]) === 'object') {
                this.change(einstellungen, arguments[2]);
            }
        }

        if (eventType === null) {
            throw new SyntaxError('Event type "' + arguments[1] + '" is not implemented!');
        }

        if (document.createEvent) {
            event = document.createEvent(eventType);
            if (eventType === 'HTMLEvents') {
                event.initEvent(arguments[1], einstellungen.bubbles, einstellungen.cancalable);
            } else {
                event.initMouseEvent(arguments[1], einstellungen.bubbles, einstellungen.cancelable, document.defaultView,
                        einstellungen.button, einstellungen.pointerX, einstellungen.pointerY, einstellungen.pointerX, einstellungen.pointerY,
                        einstellungen.ctrlKey, einstellungen.altKey, einstellungen.shiftKey, einstellungen.metaKey, einstellungen.button, arguments[0]);
            }

            arguments[0].dispatchEvent(event);
        } else {
            einstellungen.clientX = einstellungen.pointerX;
            einstellungen.clientY = einstellungen.pointerY;
            event = document.createEventObject();
            event = extend(event, einstellungen);
            arguments[0].fireEvent('on' + arguments[1], event);
        }
    },
    change: function change () {
        var name;
        for (name in arguments[1]) {
            if ((typeof arguments[1][name]) === 'object') {
                if ((typeof arguments[0][name]) === 'undefined') {
                    arguments[0][name] = {};
                }

                change(arguments[0][name], arguments[1][name]);
            } else {
                arguments[0][name] = arguments[1][name];
            }
        }

        return arguments[0];
    }

/* develblock:end */
};
