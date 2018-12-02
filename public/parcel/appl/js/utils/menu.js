/*global module:true*/
var trimStart = require('lodash/trimStart');

module.exports = {
    //Bootstrap activation
    activate: function (selector) {
        var activated = false;
        //Ensure jquery
        var el = selector instanceof $ ? selector : $(selector);
        //Element is likely a list
        el.each(function () {
            var href = $('a', this).attr('href');
            var url = href ? trimStart(href, '#!') : 'none';
            var hash = trimStart(window.location.hash, '#!');

            if (hash === url) {
                window.location.hash = '';

                $(this).addClass('active').siblings().removeClass('active');

                window.location.hash = '#!' + hash;
                activated = true;

                return false;
            }
        });

        if (!activated) {
            el.removeClass('active');
        }
    }
};
