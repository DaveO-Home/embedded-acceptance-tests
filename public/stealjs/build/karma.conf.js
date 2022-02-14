// Karma configuration
var bundler = "stealjs";
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
            "stealjs/appl/": "/base/stealjs/appl/",
            "can-map/": "/base/node_modules/can-map/",
            "/node_modules/dodex/dist/": "/base/node_modules/dodex/dist/",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "can-view-callbacks/": "/base/node_modules/can-view-callbacks/",
            "/images/": "/base/" + bundler + "/images/"
        },
        // list of files / patterns to load in the browser
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            {pattern: bundler + "/appl/jasmine/webcomponents-hi-sd-ce.js", watched: false},
            //Jasmine tests
            bundler + "/tests/unit_*.js",
            //Application and Acceptance specs.
            bundler + "/appl/testapp_karma.html",
            //Module loader - so we can run steal unit tests - see include-all-tests.js
            "node_modules/steal/steal.js",
            {pattern: "node_modules/steal/**/*.js", watched: false, included: false},
            {pattern: "node_modules/steal-css/css.js", watched: false, included: false},
            {pattern: "node_modules/**/*.map", watched: false, included: false, served: true},
            {pattern: "node_modules/bootstrap/**/*.js", watched: false, included: false},
            {pattern: "node_modules/@popperjs/core/dist/umd/*", watched: false, included: false},
            {pattern: "node_modules/can-*/**/*.js", watched: false, included: false},
            {pattern: bundler + "/appl/js/**/*.js", included: false},
            {pattern: bundler + "/appl/css/**/*.js", included: false},
            {pattern: "node_modules/steal-css/package.json", watched: false, included: false},
            {pattern: "node_modules/steal/package.json", watched: false, included: false},
            {pattern: "node_modules/can-component/package.json", watched: false, included: false},
            {pattern: "node_modules/can-map/package.json", watched: false, included: false},
            {pattern: "node_modules/lodash/package.json", watched: false, included: false},
            {pattern: "node_modules/bootstrap/package.json", watched: false, included: false},
            {pattern: "node_modules/tablesorter/package.json", watched: false, included: false},
            {pattern: "node_modules/can-route/package.json", watched: false, included: false},
            {pattern: "node_modules/can-stache/package.json", watched: false, included: false},
            {pattern: "node_modules/can-stache-bindings/package.json", watched: false, included: false},
            {pattern: "node_modules/moment/package.json", watched: false, included: false},
            {pattern: "node_modules/can-view-callbacks/package.json", watched: false, included: false},
            {pattern: "node_modules/jquery/package.json", watched: false, included: false},
            {pattern: "node_modules/**/package.json", watched: false, included: false},
            {pattern: "node_modules/jquery/dist/jquery.js", watched: false, served: true, included: false},            
            {pattern: "node_modules/tablesorter/dist/js/jquery.tablesorter.min.js", watched: false, served: true, included: false},
            {pattern: "node_modules/tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js", watched: false, served: true, included: false},
            {pattern: "node_modules/tablesorter/dist/js/jquery.tablesorter.widgets.min.js", watched: false, served: true, included: false},
            {pattern: "node_modules/jsoneditor/dist/jsoneditor.min.js", watched: false, served: true, included: false},
            {pattern: "node_modules/jsoneditor/dist/jsoneditor.min.css", watched: false, served: true, included: false},
            {pattern: "package.json", watched: false, included: false},
            {pattern: "node_modules/lodash/lodash.min.js", watched: false, included: false},
            {pattern: "node_modules/moment/moment.js", watched: false, included: false},
            {pattern: "node_modules/rxjs/dist/bundles/rxjs.umd.min.js", watched: false, included: false},
            {pattern: "node_modules/dodex/**/*", watched: false, included: false},
            {pattern: "node_modules/dodex-input/**/*", watched: false, included: false},
            {pattern: "node_modules/dodex-mess/*", watched: false, included: false},
            {pattern: "node_modules/dodex-mess/dist/*", watched: false, included: false},
            {pattern: bundler + "/appl/dodex/**/*", watched: false, included: false},
            {pattern: "node_modules/marked/marked.min.js", watched: false, included: false},
            {pattern: "README.md", included: false},
            {pattern: bundler + "/appl/**/*.html", included: false},
            {pattern: "dev-bundle.js", watched: false, included: false},
            //Test suites
            {pattern: bundler + "/tests/**/steal_unit_*.js", included: false},
            {pattern: bundler + "/appl/jasmine/**/*test.js", included: false},
            {pattern: bundler + "/tests/**/include-*.js", included: false},
            //end Test suites
            {pattern: bundler + "/images/*", included: false, watched: false},
            {pattern: "node_modules/bootstrap/dist/css/bootstrap.min.css", watched: false, included: false},
            {pattern: "node_modules/tablesorter/dist/css/theme.blue.min.css", watched: false, included: false},
            {pattern: "node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css", watched: false, included: false},
            {pattern: bundler + "/appl/templates/stache/*.stache", included: false},
            {pattern: bundler + "/appl/templates/*.json", included: false},
            {pattern: bundler + "/appl/views/prod/Test.pdf", included: false},
            {pattern: bundler + "/appl/css/**/*.css", included: false},
            {pattern: "node_modules/@fortawesome/fontawesome-free/js/all.js", watched: false, included: false},
            {pattern: "node_modules/@fortawesome/fontawesome-free/js/fontawesome.js", watched: false, included: false},
            // Jasmine/Steal tests and starts Karma
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
            ChromeCustom: {
                base: "ChromeHeadless",
                flags: ["--disable-web-security", "--disable-translate", "--disable-extensions"],
                debug: false
            },
            FirefoxHeadless: {
                base: "Firefox",
                flags: ["--headless"]
            }
        },
        browserNoActivityTimeout: 0,
        exclude: [
        ],
        // preprocessors: {
        //     '*/**/*.html': []
        // },
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
            clearContext: true
        },
        concurrency: 5, //Infinity
    });
};
