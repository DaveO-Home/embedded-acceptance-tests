
var statusReporter = {
    jasmineStarted: function (suiteInfo) {
        console.log("You should get " + suiteInfo.totalSpecsDefined + " successful specs.");
    },
    specDone: function (result) {
        if (result.failedExpectations.length > 0) {
            this.isInError = true;
        }
    },
    suiteDone: function (result) {
        if (result.failedExpectations.length > 0) {
            this.isInError = true;
        }
    },
    jasmineDone: function () {
        window.isInError = this.isInError;
        //download(this.isInError, 'isInError.txt', 'text/plain'); 

    },
    isInError: false
};

__karma__.loaded = function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    jasmine.getEnv().addReporter(statusReporter);
    const config = jasmine.getEnv().configuration()
    config.random = false;
    jasmine.getEnv().configure(config)
    // System.mainConfig = 'stealjs/appl/js/config';

    // steal.npmAlgorithm = 'flat';
    // steal.main = 'stealjs/tests/include-all-tests.js';
    addStealTests()
};

function addStealTests() {
    var tests = [];
    for (var file in window.__karma__.files) {
        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/base\/stealjs\/tests\/steal_unit.*\.js$/.test(file)) {
                tests.push(file.substr(6));
            }
        }
    }
    window.stealTests = tests
    tests[tests.length] = function () {
        window.__karma__.start();
    };

    window.tests = function () {
        steal.apply(null, tests, "");
    }
}