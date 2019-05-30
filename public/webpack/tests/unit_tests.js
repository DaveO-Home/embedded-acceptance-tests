
describe("Unit Tests - Suite 1", function () {
    //Application Tests use Promises
    it("Verify that browser supports Promises", function () {
        var isNativePromise = false,
                isPolyfillPromise = false;
        if (typeof Promise !== "undefined" && Promise !== null && Promise.toString().indexOf("[native code]") !== -1) {
            isNativePromise = true;
        } else {
            if (typeof Promise !== "undefined" && Promise !== null) {
                isPolyfillPromise = true;
            }
        }
        if (isNativePromise === isPolyfillPromise) {
            console.warn("Promise support required, add polyfill to karma configuration.")
        }
        expect(isNativePromise !== isPolyfillPromise).toBeTruthy();
    });
    //per https://www.bram.us/2016/10/31/checking-if-a-browser-supports-es6/
    var spec = "ES6 Support", no = "";
    var supportsES6 = function () {
        try {
            new Function("(a = 0) => a");
            return true;
        } catch (err) {
            no = "No ";
            return false;
        }
    }();

    it(no + spec, function () {

        if (!supportsES6) {
            console.warn("Make sure a transpiler is used in the test(karma preprocess)/build process");
            expect(supportsES6).toBe(false);
        } else {
            expect(supportsES6).toBe(true);
        }
    });

});


