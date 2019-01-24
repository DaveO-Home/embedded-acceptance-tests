var bundler = "brunch";
var startupHtml = bundler + '/appl/testapp_karma.html';
// Karma configuration
//whichBrowser to use from gulp task.
const browsers = process.env.USE_BROWSERS
const tdd = process.env.USE_TDD
if (browsers) {
    global.whichBrowser = browsers.split(",");
} else {
    global.whichBrowser = []
}
if (global.whichBrowser.length === 0 && tdd !== "true") {
    global.whichBrowser = ['ChromeHeadless', 'FirefoxHeadless']
} else if (global.whichBrowser.length === 0 && tdd === "true") {
    global.whichBrowser = ['Chrome', 'Firefox']
}

module.exports = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine'],
    proxies: {
        "/base/dist_test/fonts/": "/base/dist_test/" + bundler + "/fonts/",
    },
    // list of files / patterns to load in the browser
    files: [
        //Webcomponents for Firefox - used for link tag with import attribute.
        { pattern: bundler + "/tests/webcomponents-hi-sd-ce.js", watched: false },
        //Application and Acceptance specs.
        startupHtml,
        //Jasmine tests
        bundler + '/tests/unit_tests*.js',
        //'node_modules/promise-polyfill/promise.js',
        { pattern: bundler + '/appl/**/*.*', included: false, watched: false },
        { pattern: 'package.json', watched: false, included: false },
        { pattern: 'README.md', included: false },
        //Looking for changes via HMR - tdd should run with Brunch Hot Moudule Reload.
        { pattern: 'dist_test/' + bundler + '/vendor.js', included: false, watched: false },
        //Looking for changes to the client bundle
        { pattern: 'dist_test/' + bundler + '/acceptance.js', included: false, watched: true, served: true },
        { pattern: 'dist_test/' + bundler + '/*.css', included: false, watched: false },
        { pattern: 'dist_test/' + bundler + '/*.map', included: false, watched: false },
        { pattern: 'dist_test/' + bundler + '/*.map', included: false, watched: false },
        { pattern: 'dist_test/' + bundler + '/fonts/*', included: false, watched: false },
        { pattern: bundler + '/images/favicon.ico', included: false, watched: false },
        //Jasmine/Loader tests and starts Karma
        bundler + '/build/karma.bootstrap.js'
    ],
    bowerPackages: [
    ],
    plugins: [
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-opera-launcher',
        'karma-jasmine',
        'karma-jasmine-jquery',
        'karma-mocha-reporter'
    ],
    /* Karma uses <link href="/base/appl/testapp_dev.html" rel="import"> -- you will need webcomponents polyfill to use browsers other than Chrome.
     * This test demo will work with Chrome/ChromeHeadless by default - Webcomponents included above, so FirefoxHeadless should work also. 
     * Other browsers may work with tdd.
     */
    browsers: global.whichBrowser,
    customLaunchers: {
        FirefoxHeadless: {
            base: 'Firefox',
            flags: ['--headless']
        }
    },
    browserNoActivityTimeout: 0,
    exclude: [
    ],
    preprocessors: {
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: 'ERROR',
    autoWatch: true,
    // Continuous Integration mode
    singleRun: true,
    loggers: [{
        type: 'console'
    }
    ],
    client: {
        captureConsole: true,
        clearContext: false,
        runInParent: true,
        useIframe: true,
        jasmine: {
            random: false
        }
    },
    // how many browser should be started simultaneous
    concurrency: 5 //Infinity
};
