
steal("can-stache","can-stache-bindings", function (stache) {
    window.Stache = stache;

    return {
        init: function () {
            steal.done().then(function () {
                //Show the page
                setTimeout(function() {
                    $("#top-nav").removeAttr("hidden");
                    $("#side-nav").removeAttr("hidden");
                }, 250)
            });
        }
    };
});
