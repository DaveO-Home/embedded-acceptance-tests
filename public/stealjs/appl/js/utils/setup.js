// import stache from "can-stache"
// import "can-stache-bindings"
// import jQuery from "jquery"
// window.$ = window.jQuery = jQuery
steal("can-stache","can-stache-bindings", function (stache) {
    window.Stache = stache;

    return {
// export default {
        init: function () {
            steal.done().then(function () {
                //Show the page
                $("#top-nav").removeAttr("hidden");
                $("#side-nav").removeAttr("hidden");
            });

        }
    };
});
