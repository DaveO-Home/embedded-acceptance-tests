
steal("can/view/stache", function (stache) {

    window.Stache = stache;

    return {
        init: function () {

            steal.done().then(function () {
                //Show the page
                $("#top-nav").removeAttr("hidden");
                $("#side-nav").removeAttr("hidden");
            });

        }
    };
});
