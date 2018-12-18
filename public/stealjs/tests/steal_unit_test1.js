"use strict"

steal("setup", "@steal", function (setup, steel) {
    describe("Steal Loader - Suite 1", function () {
        it("Setup module loaded", function () {
            expect(setup).not.toBe(null);
        });
        
        it("Verify global Stache", function () {
            expect(typeof window.Stache === 'function').toBe(true);
        });
        
        it("In development mode", function () {
            expect(steel.isEnv("development")).toBe(true);
        });
    });
});
