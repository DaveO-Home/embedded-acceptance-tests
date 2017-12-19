"use strict"
steal("@steal", function (steel) {

    describe("Steal Loader - Suite 2", function () {

        it("load using local steal module", function () {

            steel.config({
                paths: {"webcomponents": "stealjs/appl/jasmine/webcomponents-hi-sd-ce.js"}
            });
            steel.import("webcomponents").then(function (webcomponents) {
                expect(typeof webcomponents === "object").toBe(true);
            })
        });

    });
}
);
