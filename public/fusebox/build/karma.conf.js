var bundler = "fusebox";
var startupHtml = "dist_test/" + bundler + "/appl/testapp_dev.html";
// Karma configuration
module.exports = function (config) {
    //whichBrowser to use from gulp task.
    if (!global.whichBrowser) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "../../",
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["jasmine-jquery"],
        proxies: {
            "/views/": "/base/" + bundler + "/appl/views/",
            "/templates": "/base/" + bundler + "/appl/templates",
            "/app_bootstrap.html": "/base/" + bundler + "/appl/app_bootstrap.html",
            "/README.md": "/base/README.md",
            // "../../../dodex/": "/base/dodex/",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "fusebox/appl/": "/base/" + bundler + "/appl/",
            "/resources/": "/base/dist_test/" + bundler + "/appl/resources/",
            "/styles/": "/base/dist_test/" + bundler + "/styles/",
            "/images/": "/base/dist_test/" + bundler + "/images/"
        },
        // list of files / patterns to load in the browser
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            {pattern: bundler + "/tests/webcomponents-hi-sd-ce.js", watched: false},
            //Application and Acceptance specs.
            startupHtml,
            //Jasmine tests
            bundler + "/tests/unit_tests*.js",
            //'node_modules/promise-polyfill/promise.js',
            {pattern: bundler + "/appl/**/*.*", included: false, watched: false},
            {pattern: "package.json", watched: false, included: false},
            {pattern: "README.md", included: false},
            //Looking for changes via HMR - tdd should run with Fusebox Hot Moudule Reload.
            //Looking for changes to the client bundle
            {pattern: "dist_test/" + bundler + "/*app.js", included: false, watched: true},
            {pattern: "dist_test/" + bundler + "/**/*", included: false, watched: false },
            //Jasmine/Loader tests and starts Karma
            bundler + "/build/karma.bootstrap.js"
        ],
        bowerPackages: [
        ],
        plugins: [
            "karma-*",
            "@metahub/karma-jasmine-jquery",
        ],
        /* Karma uses <link href="/base/appl/testapp_dev.html" rel="import"> -- you will need webcomponents polyfill to use browsers other than Chrome.
         * This test demo will work with Chrome/ChromeHeadless by default - Webcomponents included above, so FirefoxHeadless should work also. 
         * Other browsers may work with tdd.
         */
        browsers: global.whichBrowser,
        customLaunchers: {
            FirefoxHeadless: {
                base: "Firefox",
                flags: ["--headless"]
            }
        },
        browserNoActivityTimeout: 0,
        exclude: [
        ],
        preprocessors: {
            "*/**/*.html": []
        },
        reporters: ["mocha"],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        // Continuous Integration mode
        singleRun: false,
        loggers: [{
                type: "console"
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
