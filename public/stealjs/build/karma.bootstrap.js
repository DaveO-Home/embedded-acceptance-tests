 
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
window.__karma__.loaded = function () {
    
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    jasmine.getEnv().addReporter(statusReporter);
    jasmine.getEnv().randomizeTests(false);
    //System.mainConfig = 'stealjs/appl/js/config';
    
    System.npmAlgorithm = 'flat';
    System.main = 'stealjs/tests/include-all-tests';
};
