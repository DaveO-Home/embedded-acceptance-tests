
import Stache from "can-stache";
import "can-stache-bindings";
window.Stache = Stache;

module.exports = {
    init: function () {
        //Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
    }
};
