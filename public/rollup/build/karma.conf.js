let startupHtml = "/appl/testapp_karma.html";
let bundler = "rollup";

// Karma configuration
module.exports = function (config) {

    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless, FirefoxHeadless"];
    }

    config.set({
        basePath: "../../",
        frameworks: ["jasmine-jquery"],
        proxies: {
            "/views/": "/base/" + bundler + "/appl/views/",
            "/templates": "/base/" + bundler + "/appl/templates",
            "/app_bootstrap.html": "/base/" + bundler + "/appl/app_bootstrap.html",
            "/README.md": "/base/README.md",
            "rollup/appl/": "/base/" + bundler + "/appl/",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "/node_modules/": "/base/dist_test/" + bundler + "/appl/node_modules/",
            "/images/": "/base/dist_test/" + bundler + "/images/",
        },
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            {pattern: bundler + "/appl/jasmine/webcomponents-hi-sd-ce.js", watched: false},
            //Jasmine tests
            bundler + "/tests/unit_test*.js",
            //Application and Acceptance specs.
            bundler + startupHtml,
            {pattern: bundler + "/appl/**/*.*", included: false, watched: false},
            {pattern: "package.json", watched: false, included: false},
            {pattern: "README.md", included: false},
            {pattern: "dist_test/" + bundler + "/bundle.js", included: false, watched: true, served: true},  //watching bundle to get changes during tdd/test
            {pattern: "dist_test/" + bundler + "/**/*.*", included: false, watched: false},
            //Karma/Jasmine/Loader
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
                flags: ["--headless", " --safe-mode"]
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
        concurrency: 5
    });
};
