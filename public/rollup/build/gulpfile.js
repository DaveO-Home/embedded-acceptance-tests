/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */

const { series, parallel, task, src, dest } = require('gulp');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const copy = require("gulp-copy");
const sourcemaps = require('gulp-sourcemaps');
const removeCode = require('gulp-remove-code');
const stripCode = require("gulp-strip-code");
const uglify = require('gulp-uglify');
const del = require('del');
const noop = require('gulp-noop');
const log = require('fancy-log');

const rollup = require('rollup');
const gulpRollup = require('gulp-rollup');
const livereload = require('rollup-plugin-livereload');
const serve = require('rollup-plugin-serve');
const commonjs = require('rollup-plugin-commonjs');
const alias = require('rollup-plugin-alias');
const resolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const rollupBabel = require('rollup-plugin-babel');
const progress = require('rollup-plugin-progress');
const rename = require('gulp-rename');
const buble = require('rollup-plugin-buble')

const startComment = "steal-remove-start",
    endComment = "steal-remove-end",
    regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let lintCount = 0,
    isProduction = process.env.NODE_ENV === 'production',
    browsers = process.env.USE_BROWSERS,
    testDist = "dist_test/rollup",
    prodDist = "dist/rollup",
    dist = isProduction ? prodDist : testDist,
    env = process.env.NODE_ENV;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
const buildDevelopment = function (cb) {
    return rollupBuild(cb);
};
/**
 * Production Rollup 
 */
const build = function (cb) {
    return rollupBuild(cb);
};
/**
 * Default: Production Acceptance Tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowsers = [/*"ChromeHeadless",*/ "FirefoxHeadless"];
    }
    runKarma(done);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    dist = prodDist;
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on('error', function () {
        process.exit(1);
    });

    return stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
        cb();
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    });
    return stream.on('end', function () {
        cb()
    })
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    return exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
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
    del.sync([
        '../../' + prodDist + '/**/*'
    ], { dryRun: false, force: true });
    done()
};
/**
 * Remove previous test build
 */
const cleant = function (done) {
    isProduction = false;
    dist = testDist;
    del.sync([
        '../../' + testDist + '/**/*'
    ], { dryRun: false, force: true });
    done()
};
/**
 * Resources and content copied to dist directory - for production
 */
const copyprod = function () {
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

const copyprod_fonts = function () {
    isProduction = true;
    dist = prodDist;
    return copyFonts();
};
/**
 * Resources and content copied to dist_test directory - for development
 */
const copy_src = function () {
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

copy_fonts = function () {
    isProduction = false;
    dist = testDist;
    return copyFonts();
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const r_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = [/*"ChromeHeadless",*/ "FirefoxHeadless"];
    }
    runKarma(done);
};
/**
 * Continuous testing - test driven development.  
 */
const tdd_rollup = function (done) {
    if (!browsers) {
        global.whichBrowsers = [/*"Chrome",*/ "Firefox"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();

};

const watch_rollup = function () {
    const watchOptions = {
        allowRealFiles: true,
        input: '../appl/index.js',
        plugins: [
            commonjs(),
            alias(aliases()),
            resolve(),
            postcss(),
            progress({
                clearLine: true
            }),
            //            rollupBabel({
            //                presets: [["env", {targets: {"uglify":false}, modules: false}]],
            //                plugins: ["external-helpers"]
            //            }),
            serve({
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
            file: '../../' + dist + '/bundle.js',
            format: "iife",
            sourcemap: true
        }
    };
    watcher = rollup.watch(watchOptions);
    let starting = false;
    watcher.on('event', event => {
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

const testCopy = series(cleant, parallel(copy_fonts, copy_css, copy_node_css, copy_images, copy_src))
const testRun = series(testCopy, buildDevelopment, pat);
const lintRun = parallel(esLint, cssLint, bootLint)
const prodRun = series(testRun, lintRun, clean, parallel(copyprod_fonts, copyprod_css, copyprod_node_css, copyprod_images, copyprod), build)
const tddRun = series(testCopy, buildDevelopment, tdd_rollup)

prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.test = testRun
exports.acceptance = pat
exports.rebuild = series(testCopy, buildDevelopment)
exports.tdd = tdd_rollup // tddRun
exports.watch = watch_rollup
exports.development = parallel(tdd_rollup, watch_rollup)

function rollupBuild(cb) {
    return src(['../appl/index.js'])
        .pipe(removeCode({ production: isProduction }))
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(gulpRollup({
            allowRealFiles: true,
            input: '../appl/index.js',
            output: {
                format: "iife",
                name: "acceptance",
                // intro: ""
            },
            plugins: [
                commonjs(),
                alias(aliases()),
                resolve(),
                postcss(),
                progress({
                    clearLine: isProduction ? false : true
                }),
                buble(),
                rollupBabel({
                    presets: [["env", {/*targets: {"uglify":true},*/ modules: false }]],
                    plugins: ["external-helpers"]
                })
            ],
        }))
        .pipe(rename('bundle.js'))
        .pipe(isProduction ? uglify() : noop())
        // .pipe(sourcemaps.init({ loadMaps: !isProduction }))
        // .pipe(sourcemaps.write('../dist_test/rollup/maps'))
        .pipe(dest('../../' + dist))
        .on('error', log)
        .on('end', function () {
            cb()
        });
}

function aliases() {
    return {
        "setglobal": "./js/utils/set.global",
        "app": "./app",
        "router": "../router",
        "config": "./config",
        "helpers": "./helpers",
        "setup": "./utils/setup",
        "menu": "./utils/menu",
        "default": "./utils/default",
        "basecontrol": "./utils/base.control",
        "start": "./controller/start",
        "pdf": "./controller/pdf",
        "table": "./controller/table",
        "pager": "./js/utils/pager.js",
        "apptest": "./jasmine/apptest.js",
        "contacttest": "./contacttest.js",
        "domtest": "./domtest.js",
        "logintest": "./logintest.js",
        "routertest": "./routertest.js",
        "toolstest": "./toolstest.js"
    };
}

function copySrc() {
    return src(['../appl/views/**/*', '../appl/templates/**/*', isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyImages() {
    return src(['../images/*', '../../README.md'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyCss() {
    return src(['../appl/css/site.css'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyNodeCss() {
    return src(['../../node_modules/bootstrap/dist/css/bootstrap.min.css', "../../node_modules/font-awesome/css/font-awesome.css",
        "../../node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css", "../../node_modules/tablesorter/dist/css/theme.blue.min.css"])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyFonts() {
    return src(['../../node_modules/font-awesome/fonts/*'])
        .pipe(copy('../../' + dist + '/appl'));
}

function runKarma(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
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
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = 'node_output.log',
        errfile = 'node_error.log';

    if (fs.exists(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.exists(errfile)) {
        fs.unlink(errfile);
    }

    process.stdout.write = function (chunk) {
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstderr.apply(this, arguments);
    };
}
