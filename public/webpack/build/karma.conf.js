var bundler = "webpack";
//var webpackConfig = require('../webpack.config.js');

// Karma configuration
module.exports = function (config) {
    //whichBrowser to use from gulp task.
    if (!global.whichBrowser) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],
        proxies: {
            "/views/": "/base/" + bundler + "/appl/views/",
            "/templates": "/base/" + bundler + "/appl/templates",
            "/app_bootstrap.html": "/base/" + bundler + "/appl/app_bootstrap.html",
            "/README.md": "/base/README.md",
            "webpack/appl/": "/base/" + bundler + "/appl/",
            "/dodex/": "/base/dist_test/" + bundler + "/appl/dodex/",
            "/images/": "/base/dist_test/" + bundler + "/images/"
        },
        // list of files / patterns to load in the browser
        files: [
            //Webcomponents for Firefox - used for link tag with rel="import" attribute.
            {pattern: bundler + "/tests/webcomponents-hi-sd-ce.js", watched: false},
            //Application and Acceptance specs.
            bundler + '/appl/testapp_karma.html',
            //Jasmine tests
            bundler + '/tests/unit_tests*.js',
            {pattern: bundler + '/appl/**/*.*', included: false, watched: false},
            {pattern: 'package.json', watched: false, included: false},
            {pattern: 'README.md', included: false},
            {pattern: 'dist_test/webpack/**/*', included: false, watched: true},
            //Test suites
            {pattern: bundler + '/tests/**/*test.js', included: false, watched: false},
            //end Test suites
            //Jasmine/setup for tests and may start Karma
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
            'karma-mocha-reporter',
            'karma-webpack'
        ],
        /* Karma uses <link href="/base/appl/testapp_dev.html" rel="import"> -- you will need webcomponents polyfill to use browsers other than Chrome.
         * This test demo will work with Chrome/ChromeHeadless by default - Webcomponents included above, so FirefoxHeadless should work also. 
         * Other browsers may work with tdd.
         */
        browsers: global.whichBrowser,
        customLaunchers: {
            ChromeWithoutSecurity: {
                base: 'Chrome',
                flags: ['--disable-web-security']
            },
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security', '--disable-translate', '--disable-extensions'],
                debug: false
            },
            FirefoxHeadless: {
                base: 'Firefox',
                flags: ['--headless']
            }
        },
        browserNoActivityTimeout: 0,
        exclude: [
        ],
        preprocessors: {  //included for tdd             
//            './webpack/appl/index.js': ['webpack'], 
//            './webpack/tests/unit_tests*.js': ['webpack']
        },
        //webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: false,
            stats: 'errors-only'
        },
        autoWatchBatchDelay: 1000,
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        singleRun: false,
        loggers: [{
                type: 'console'
            }
        ],
        client: {
            captureConsole: true,
            karmaHTML: {
                source: [
                    {src: './appl/testapp_dev.html', tag: 'index'},
                ],
                auto: true
            },
            clearContext: false,
            runInParent: true,
            useIframe: true,
            jasmine: {
                random: false
            }
        },
        concurrency: 5
    })
}
