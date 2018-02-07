define("setup", ["can-stache", "can-stache-bindings"], function (stache) {

    window.Stache = stache;

    return {
        init: function () {
            
            // Show the page
            $("#top-nav").removeAttr("hidden");
            $("#side-nav").removeAttr("hidden");

        }
    };
});
