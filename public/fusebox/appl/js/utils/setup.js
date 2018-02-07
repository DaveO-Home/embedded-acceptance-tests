/*global module:true*/

window.Stache = require("can-stache");
require("can-stache-bindings");

module.exports = {
    init: function () {

        //Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
 
    }
};
