
describe("Suite for Unit Tests", function () {

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
            console.log("Promise support required, add polyfill to karma configuration.")
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
            console.log("Make sure a transpiler is used in the test(karma preprocess)/build process");
            expect(supportsES6).toBe(false);
        } else {
            expect(supportsES6).toBe(true);
        }
    });

    it("blockStrip to remove block of code", function () {
        var contents = "var prodVar='saved'; \
            /* develblock:start */ \
            console.log('Logging String'); \
            /* develblock:end */";
        var startComment = 'develblock:start';
        var endComment = 'develblock:end';
//        var regexPattern = new RegExp("[\\t ]*\\/\\* ?" + startComment + " ?\\*\\/[\\s\\S]*?\\/\\* ?" + endComment + " ?\\*\\/[\\t ]*\\n?", "g");
        var regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + 
                startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + 
                endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
        contents = contents.replace(regexPattern, '');
        expect(contents).toBe("var prodVar='saved';")
    });
    
    it("blockStrip to remove Canjs block of code", function () {
        var contents = "var prodVar='saved'; \
            //!steal-remove-start \
            console.log('Logging String'); \
            //!steal-remove-end";
        var startComment = 'steal-remove-start'; 
        var endComment = 'steal-remove-end';
        var regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + 
                startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + 
                endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
        contents = contents.replace(regexPattern, '');
        expect(contents).toBe("var prodVar='saved';")
    });

});


