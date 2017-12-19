var bundler = "fusebox";
var startupHtml = bundler + '/appl/testapp_karma.html';
// Karma configuration
module.exports = function (config) {
    //whichBrowser to use from gulp task.
    if (!global.whichBrowser) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],
        // list of files / patterns to load in the browser
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            {pattern: bundler + "/tests/webcomponents-hi-sd-ce.js", watched: false},
            //Application and Acceptance specs.
            startupHtml,
            //Jasmine tests
            bundler + '/tests/unit_tests*.js',
            //'node_modules/promise-polyfill/promise.js',
            {pattern: 'node_modules/fuse-box/dist/commonjs/**/*.js', watched: false, included: false}, //, served: false},
            {pattern: 'node_modules/**/*.map', watched: false, included: false, served: false},
            {pattern: 'node_modules/bootstrap/**/*.js', watched: false, included: false},
            {pattern: 'node_modules/popper.js/dist/umd/*', watched: false, included: false},
            {pattern: 'node_modules/can/**/*.js', watched: false, included: false},
            {pattern: 'node_modules/can-*/**/*.js', watched: false, included: false},
            {pattern: bundler + '/appl/index.js', included: false, watched: false},
            {pattern: bundler + '/appl/js/**/*.js', included: false, watched: false},
            {pattern: 'node_modules/**/package.json', watched: false, included: false},
            {pattern: 'node_modules/jquery/**/*.js', watched: false, served: true, included: false},
            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: false},
            {pattern: 'node_modules/tablesorter/**/*.js', watched: false, served: true, included: false},
            {pattern: 'package.json', watched: false, included: false},
            {pattern: 'node_modules/lodash/**/*js', watched: false, included: false},
            {pattern: 'node_modules/moment/**/*.js', watched: false, included: false},
            {pattern: bundler + '/appl/**/*.html', included: false, watched: false},
            {pattern: 'README.md', included: false},
            //Looking for changes via HMR - tdd should run with Fusebox Hot Moudule Reload.
            {pattern: 'dist_test/' + bundler + '/vendor.js', included: false, watched: false},
            //Looking for changes to the client bundle
            {pattern: 'dist_test/' + bundler + '/acceptance.js', included: false, watched: true, served: true},
            {pattern: 'dist_test/' + bundler + '/resources/*', included: false, watched: false},
//            {pattern: 'dist/' + bundler + '/**/*.*', included: false, watched: false},
            {pattern: bundler + '/images/favicon.ico', included: false, watched: false},
            {pattern: 'node_modules/bootstrap/dist/css/bootstrap.min.css', watched: false, included: false},
            {pattern: 'node_modules/tablesorter/dist/css/theme.blue.min.css', watched: false, included: false},
            {pattern: 'node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css', watched: false, included: false},
            {pattern: bundler + '/appl/templates/stache/*.stache', included: false, watched: false},
            {pattern: bundler + '/appl/templates/*.json', included: false, watched: false},
            {pattern: bundler + '/appl/views/prod/Test.pdf', included: false, watched: false},
            {pattern: bundler + '/appl/css/**/*.css', included: false, watched: false},
            {pattern: 'node_modules/font-awesome/css/font-awesome.css', watched: false, included: false},
            {pattern: 'node_modules/font-awesome/fonts/fontawesome-webfont.woff2', watched: false, included: false},
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
            '*/**/*.html': []
        },
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        // Continuous Integration mode
        singleRun: false,
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
    });
};
