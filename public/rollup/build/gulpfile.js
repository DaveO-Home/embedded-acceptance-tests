/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */

const { series, parallel, task, src, dest } = require("gulp");
var fs = require("fs");
const karma = require("karma");
const path = require("path");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const copy = require("gulp-copy");
const removeCode = require("gulp-remove-code");
const stripCode = require("gulp-strip-code");
const chalk = require("chalk");
const uglify = require("gulp-uglify");
const noop = require("gulp-noop");
const log = require("fancy-log");

const rollup = require("rollup");
const livereload = require("rollup-plugin-livereload");
const serve = require("./serv")
const commonjs = require("@rollup/plugin-commonjs");
const alias = require("@rollup/plugin-alias");
const { nodeResolve } = require("@rollup/plugin-node-resolve");

const postcss = require("rollup-plugin-postcss");
const progress = require("rollup-plugin-progress");
const rename = require("gulp-rename");
const buble = require("rollup-plugin-buble");
const css = require("rollup-plugin-css-only");

const startComment = "steal-remove-start",
    endComment = "steal-remove-end",
    regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let lintCount = 0,
    isProduction = process.env.NODE_ENV === "production",
    browsers = process.env.USE_BROWSERS,
    testDist = "dist_test/rollup",
    prodDist = "dist/rollup",
    dist = isProduction ? prodDist : testDist;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
const buildDevelopment = async function (cb) {
    return await rollupBuild(cb);
};
/**
 * Production Rollup 
 */
const build = async function (cb) {
    return await rollupBuild(cb);
};
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
    dist = prodDist;
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
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    return exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/**
 * Remove previous prod build
 */
const clean = function (done) {
    isProduction = true;
    dist = prodDist;
    return import("del").then(del => {
         del.deleteSync([
                  "../../" + prodDist + "/**/*"
              ], { dryRun: false, force: true });
         done();
     });
};
/**
 * Remove previous test build
 */
const cleant = function (done) {
    isProduction = false;
    dist = testDist;
    return import("del").then(del => {
        del.deleteSync([
                 "../../" + testDist + "/**/*"
             ], { dryRun: false, force: true });
        done();
     });
};
/**
 * Resources and content copied to dist directory - for production
 */
const copyprod = function () {
    copyReadme();
    copyDodex();
    return copySrc();
};

const copyprod_images = function () {
    return copyImages();
};

const copyprod_node_css = function () {
    return copyNodeCss();
};

const copyprod_css = function () {
    return copyCss();
};

/**
 * Resources and content copied to dist_test directory - for development
 */
const copy_src = function () {
    copyReadme();
    copyDodex();
    return copySrc();
};

const copy_images = function () {
    return copyImages();
};

const copy_node_css = function () {
    return copyNodeCss();
};

const copy_css = function () {
    return copyCss();
};

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const r_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
};
/**
 * Continuous testing - test driven development.  
 */
const tdd_rollup = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    karmaServer(done, false, true);
};

const watch_rollup = async function () {
    const serv = await serve.srv
    watchOptions = {
        // allowRealFiles: true,
        input: "../appl/index.js",
        plugins: [
            alias(aliases()),
            nodeResolve({
                extensions: [".js", ".ts"]
            }),
            commonjs(),
            css({output: "bundle.css"}),
            progress({
                clearLine: true
            }),
            serv.default({
                open: false,
                verbose: true,
                contentBase: "../../",
                historyApiFallback: false,
                host: "localhost",
                port: 3080
            }),
            livereload({
                watch: "../../" + dist + "/bundle.js",
                verbose: true,
            })
        ],
        output: {
            name: "acceptance",
            file: "../../" + dist + "/bundle.js",
            format: "iife",
            sourcemap: true
        }
    };
    const watcher = rollup.watch(watchOptions);
    let starting = false;
    watcher.on("event", event => {
        switch (event.code) {
            case "START":
                log("Starting...");
                starting = true;
                break;
            case "BUNDLE_START":
                log(event.code, "\nInput=", event.input, "\nOutput=", event.output);
                break;
            case "BUNDLE_END":
                log("Waiting for code change. Build Time:", millisToMinutesAndSeconds(event.duration));
                break;
            case "END":
                if (!starting)
                    log("Watch Shutdown Normally");
                starting = false;
                break;
            case "ERROR":
                log("Unexpected Error", event);
                break;
            case "FATAL":
                log("Rollup Watch interrupted by Fatal Error", event);
                break;
            default:
                break;
        }
    });
};

const testCopy = series(cleant, parallel(copy_css, copy_node_css, copy_images, copy_src));
const testRun = series(testCopy, buildDevelopment, pat);
const lintRun = parallel(esLint, cssLint/*, bootLint*/);
const prodRun = series(testRun, lintRun, clean, parallel(copyprod_css, copyprod_node_css, copyprod_images, copyprod), build);
const tddRun = series(testCopy, buildDevelopment, tdd_rollup);

prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd = series(clean, parallel(copyprod_css, copyprod_node_css, copyprod_images, copyprod), build);
exports.test = testRun;
exports.acceptance = pat;
exports.rebuild = series(testCopy, buildDevelopment);
exports.tdd = tdd_rollup; // tddRun
exports.watch = watch_rollup;
exports.development = parallel(tdd_rollup, watch_rollup);
exports.tcopy = testCopy;
exports.lint = lintRun;

async function rollupBuild(cb) {
    await rollup.rollup({
        input: "../appl/index.js",
        treeshake: isProduction,
        plugins: [
            alias(aliases()),
            nodeResolve({
                extensions: [".js", ".ts"],
                browser: true
            }),
            css({output: "bundle.css"}),
            progress({
                clearLine: isProduction ? true : true
            }),
            commonjs({}),
            // buble(),
        ],
    }).then(async bundle => {
        await bundle.write({
            file: `../../${dist}/bundle_temp.js`,
            format: "iife",
            name: "bundle_temp",
            sourcemap: isProduction === false
        }).then(async () => {
            src([`../../${dist}/bundle_temp.js`])
                .pipe(removeCode({ production: isProduction }))
                .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
                .pipe(isProduction ? uglify() : noop())
                .pipe(rename("bundle.js"))
                .pipe(dest(`../../${dist}`))
                .on("error", log)
                .on("end", function () {
                    import("del").then(del => {
                         del.deleteSync([
                                  `../../${dist}/bundle_temp.js`
                              ], { dryRun: false, force: true });
                    });
                });
            });
    });
    return new Promise((resolve, reject) => {
            checkFile(resolve, reject);
        }).then(() => {
            cb();
        }).catch(rejected => {
            log(chalk.red.bold(`Failed: ${rejected}`));
            cb();
            process.exit(1);
        });
}
let count = 0;
function checkFile(resolve, reject) {
    try {
        if (fs.existsSync(`../../${dist}/bundle.js`)) {
            resolve("Found File");
            count = 0;
        } else {
            count++;
            if(count > 10) {
                reject("Bundle bundle.js Not found");
            } else {
                setTimeout(function() {checkFile(resolve, reject);}, 1000);
                if(count === 1) {
                    log(chalk.blue.bold("waiting..."));
                } 
            }
        }
    } catch(err) {
        console.error(err);
        reject("Bundle bundle.js Not found");
    }
}


function aliases() {
    return {
        entries: [
            {find: "bootstrap", replacement: "../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"},
            {find: "setglobal", replacement: "./js/utils/set.global"},
            {find: "app", replacement: "./app"},
            {find: "router", replacement: "../router"},
            {find: "config", replacement: "./config"},
            {find: "helpers", replacement: "./helpers"},
            {find: "setup", replacement: "./utils/setup"},
            {find: "menu", replacement: "./utils/menu"},
            {find: "default", replacement: "./utils/default"},
            {find: "basecontrol", replacement: "./utils/base.control"},
            {find: "start", replacement: "./controller/start"},
            {find: "pdf", replacement: "./controller/pdf"},
            {find: "table", replacement: "./controller/table"},
            {find: "pager", replacement: "./js/utils/pager.js"},
            {find: "apptest", replacement: "./jasmine/apptest.js"},
            {find: "contacttest", replacement: "./contacttest.js"},
            {find: "domtest", replacement: "./domtest.js"},
            {find: "logintest", replacement: "./logintest.js"},
            {find: "routertest", replacement: "./routertest.js"},
            {find: "toolstest", replacement: "./toolstest.js"},
            {find: "dodextest", replacement: "./dodextest.js"},
            {find: "inputtest", replacement: "./inputtest.js"}
        ]
    };
}

function copySrc() {
    return src(["../appl/views/**/*", "../appl/templates/**/*", isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyDodex() {
    return src(["../appl/dodex/**/*"])
            .pipe(dest("../../" + dist + "/appl/dodex"));
}

function copyImages() {
    return src(["../images/*",])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyReadme() {
    return src(["../../README.md"])
        .pipe(copy("../../" + dist + "/appl/data/data"));
}

function copyCss() {
    return src(["../appl/css/site.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyNodeCss() {
        return src(["../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg"])
            .pipe(dest("../../" + dist + "/img"));
}

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve("./karma.conf.js"),
        { port: 9876, singleRun: singleRun, watch: watch },
        { promiseConfig: true, throwErrors: true },
    ).then(
        (karmaConfig) => {
            if(!singleRun) {
                done();
            }
            new Server(karmaConfig, function doneCallback(exitCode) {
                console.warn("Karma has exited with " + exitCode);
                if(singleRun) {
                    done();
                }
                if(exitCode > 0) {
                    process.exit(exitCode);
                }
            }).start();
        },
        (rejectReason) => { console.error(rejectReason); }
    );
}
//per stackoverflow - Converting milliseconds to minutes and seconds with Javascript
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return ((seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds) + (minutes === 0 ? " seconds" : "minutes"));
}
/*
 * From Stack Overflow - Node (Gulp) process.stdout.write to file
 * @type type
 */
if (process.env.USE_LOGFILE == "true") {
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = "node_output.log",
        errfile = "node_error.log";

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
