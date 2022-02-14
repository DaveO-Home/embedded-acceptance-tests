const bundler = "esbuild";
const startupHtml = "dist_test/" + bundler + "/appl/testapp_dev.html";
// Karma configuration
module.exports = function (config) {
    // whichBrowser to use from gulp task.
    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "../../",
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["jasmine-jquery"],
        proxies: {
            "/README.md": "/base/README.md",
            "/views/": "/base/" + bundler + "/appl/views/",
            "/templates": "/base/" + bundler + "/appl/templates",
            "/app_bootstrap.html": "/base/" + bundler + "/appl/app_bootstrap.html",
            "esbuild/appl/": "/base/" + bundler + "/appl/",
            "/appl/assets": "/base/" + bundler + "/appl/assets",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "/images/": "/base/" + bundler + "/images/",
            "/base/esbuild/appl/views/prod/Test.pdf": "/base/dist_test/" + bundler + "/appl/views/prod/Test.pdf"
        },
        // list of files / patterns to load in the browser
        files: [
            // Webcomponents for Firefox - used for link tag with import attribute.
            {pattern: bundler + "/tests/webcomponents-hi-sd-ce.js", watched: false},
            // Application and Acceptance specs.
            startupHtml,
            // Jasmine tests
            bundler + "/tests/unit_tests*.js",
            // 'node_modules/promise-polyfill/promise.js',
            {pattern: bundler + "/appl/**/*.*", included: false, watched: false},
            {pattern: "package.json", watched: false, included: false},
            {pattern: "README.md", included: false},
            // Looking for changes via HMR - tdd should run with esbuild Hot Moudule Reload.
            // Looking for changes to the client bundle
            {pattern: "dist_test/" + bundler + "/index.js", included: false, watched: true, served: true},
            {pattern: "dist_test/" + bundler + "/index.css", included: false, watched: false, served: true},
            {pattern: "dist_test/" + bundler + "/appl/site.css", included: false, watched: true, served: true},
            {pattern: bundler + "/images/*", included: false, watched: false},
            // Jasmine/Loader tests and starts Karma
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
        browsers: global.whichBrowsers,
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
        },
        reporters: ["mocha"],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        autoWatchBatchDelay: 250,
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
        },
        // how many browser should be started simultaneous
        concurrency: 5 // Infinity
    });
};
