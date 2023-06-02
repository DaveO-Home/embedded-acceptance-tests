/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> ('eslint', 'csslint', bootlint) -> 'boot' -> 'clean' -> 'build'
 */

const { series, parallel, task, src, dest } = require("gulp");
const stealTools = require("steal-tools");
const stealStream = require("steal-tools").streams;
const karma = require("karma");
const path = require("path");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const chalk = require("chalk");

var lintCount = 0;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);
/**
 * Default: Production Acceptance Tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js",
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function () {
        process.exit(1);
    });

    return stream.on("end", function () {
        log(chalk.blue.bold("# javascript files linted: " + lintCount));
        cb();
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(["../appl/css/site.css"])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
    return stream.on("end", function () {
        cb();
    });
};
/*
 *  Build the application to the production distribution using Steal/Steal-Tools v2
 */
const build = function (cb) {
    const distDir = "../../dist/bundles/stealjs/appl/js/";
    stealTools.build({
        configMain: "stealjs/appl/js/config",
        main: "stealjs/appl/js/index",
        baseURL: "../../",
    }, {
        ignore: ["bootstrap"],
        sourceMaps: false,
        bundleAssets: {
            infer: true,
            glob: [
                "../images/**/*",
                "../appl/testapp.html",
                "../appl/views/**/*",
                "../appl/templates/**/*",
                "../../README.md",
                "../appl/dodex/**/*"
            ]
        },
        bundleSteal: false,
        dest: "dist",
        removeDevelopmentCode: true,
        envify: true,
        minify: false,
        maxBundleRequests: 5,
        maxMainRequests: 5
    }).then(result => {
        // patch for "SyntaxError: missing ] after element list" exception
        const shell = require('shelljs');
        shell.sed("-i", "\\[object Object\\]\\.\\[object Object\\]", "'[object Object].[object Object]'", distDir + "index.js");
        const uglifyes = require("uglify-es");
        const composer = require("gulp-uglify/composer");
        const buffer = require("vinyl-buffer");
        const rename = require("gulp-rename");
        minify = composer(uglifyes, console);
        log("Minifying bundle");
        stream = src([distDir + "index.js"])
            .pipe(rename("bundle.js"))
            .pipe(buffer())
            .pipe(minify())
            .pipe(dest(distDir))
            .on("error", log)
            .on("end", function () {
                shell.mv(distDir + "bundle.js", distDir + "index.js");
                log("Finished minifying");
                cb();
            });
    });
};
/*
 * Tools Streams example - not used
 */
const buildS = function () {
    const graphStream = stealStream.graph({
        configMain: "stealjs/appl/js/config",
        main: "stealjs/appl/js/index",
        baseURL: "../../"
    }, {
        // sourceMaps: false,
        // bundleAssets: {
        //     infer: true,
        //     glob: [
        //         '../images/favicon.ico',
        //         '../appl/testapp.html',
        //         '../appl/views/**/*',
        //         '../appl/templates/**/*',
        //         '../../README.md'
        //     ]
        // },
        bundleSteal: false,
        dest: "dist",
        removeDevelopmentCode: true,
        minify: false,
        maxBundleRequests: 5,
        maxMainRequests: 5
    });

    return graphStream
        .pipe(stealStream.transpile())
        .pipe(stealStream.minify())
        .pipe(stealStream.bundle())
        .pipe(stealStream.concat())
        .pipe(stealStream.write());
};
/*
 *  Build the application to the production distribution using Steal/Steal-Tools v2
 */
const build_only = function () {
    return stealTools.build({
        configMain: "stealjs/appl/js/config",
        main: "stealjs/appl/js/index",
        baseURL: "../../"
    }, {
        sourceMaps: false,
        bundleAssets: {
            infer: true,
            glob: [
                "../images/*",
                "../appl/testapp.html",
                "../appl/views/**/*",
                "../appl/templates/**/*",
                "../../README.md",
                "../appl/dodex/**/*"
            ]
        },
        bundleSteal: false,
        dest: "dist",
        removeDevelopmentCode: true,
        minify: false,
        maxBundleRequests: 5,
        maxMainRequests: 5
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/**
 * Remove previous production build
 */
const clean = function (done) {
    const isProduction = true;
    const dist = "../../dist/";
    import("del").then(del => {
         del.deleteSync([
              dist + "stealjs/**/*",
              dist + "bundles/**/*",
              dist + "../../dist/steal.production.js"
          ], { dryRun: false, force: true });
         done();
     });
};
/**
 * Run karma/jasmine tests using FirefoxHeadless 
 */
const steal_firefox = function (done) {
    global.whichBrowsers = ["FirefoxHeadless"];
    karmaServer(done, true, false);
};
/**
 * Run karma/jasmine tests using ChromeHeadless 
 */
const steal_chrome = function (done) {
    global.whichBrowsers = ["ChromeHeadless"];
    karmaServer(done, true, false);
};
/**
 * Run karma/jasmine tests once and exit
 */
const steal_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, false, true);
};
/**
 * Continuous testing - test driven development.  
 */
const steal_tdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Firefox", "Chrome"];
    }
    karmaServer(done, false, true);
};
/*
 * Startup live reload monitor. 
 */
const live_reload = function (cb) {
    var osCommands = "cd ../..; node_modules/.bin/steal-tools live-reload";
    if (isWindows) {
        osCommands = "cd ..\\.. & .\\node_modules\\.bin\\steal-tools live-reload";
    }
    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Build a vendor bundle from package.json
 */
const vendor = function (cb) {
    let vendorBuild = process.env.USE_VENDOR_BUILD;

    if (vendorBuild && vendorBuild == "false") {
        cb();
        return;
    }

    stealTools.bundle({
        configMain: "stealjs/appl/js/config",
        main: "stealjs/appl/js/index",
        baseURL: "../../",
    }, {
        filter: ["node_modules/**/*", "package.json"],
        //dest: __dirname + "/../dist_test"
    }).then(() => {
        // patch for "SyntaxError: missing ] after element list" exception
        const shell = require('shelljs');
        shell.sed("-i", "\\[object Object\\]\\.\\[object Object\\]", "'[object Object].[object Object]'", "../../dev-bundle.js")
        cb();
    });
};
/*
 * Startup live reload monitor. 
 */
const web_server = function (cb) {
    var osCommand = "cd ../../..; ";
    if (isWindows) {
        osCommand = "cd ..\\..\\.. & ";
    }
    const port = process.env.PORT || "3080";
    log(chalk.cyan(`Use: localhost:${port}/public/stealjs/appl/testapp_dev.html`));
    exec(osCommand + "npm start", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};

const prodRun = series(pat, clean, parallel(esLint, cssLint/*, bootLint*/), build);

exports.default = prodRun;
exports.prod = prodRun;
exports.prd = series(clean, build);
exports.test = pat;
exports.tdd = steal_tdd;
exports.firefox = steal_firefox;
exports.chrome = steal_chrome;
exports.hmr = series(vendor, live_reload);
exports.server = web_server;
exports.development = parallel(series(vendor, live_reload), web_server);
exports.lint = parallel(cssLint, esLint);

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve("./karma.conf.js"),
        { port: 9876, singleRun: singleRun, watch: watch },
        { promiseConfig: true, throwErrors: true },
    ).then(
        (karmaConfig) => {
            if (!singleRun) {
                done();
            }
            new Server(karmaConfig, function doneCallback(exitCode) {
                console.warn("Karma has exited with " + exitCode);
                if (singleRun) {
                    done();
                }
                if (exitCode > 0) {
                    process.exit(exitCode);
                }
            }).start();
        },
        (rejectReason) => { console.error(rejectReason); }
    );
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    var proc = require("process");
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = "production_build.log",
        errfile = "production_error.log";

    if (fs.exists(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.exists(errfile)) {
        fs.unlink(errfile);
    }

    process.stdout.write = function (chunk) {
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstderr.apply(this, arguments);
    };
}
