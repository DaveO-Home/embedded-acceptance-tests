/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */

const gulp = require("gulp");
const Server = require("karma").Server;
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const copy = require("gulp-copy");
const sourcemaps = require("gulp-sourcemaps");
const removeCode = require("gulp-remove-code");
const stripCode = require("gulp-strip-code");
const uglify = require("gulp-uglify");
const del = require("del");
const noop = require("gulp-noop");
const log = require("fancy-log");

const rollup = require("rollup");
const gulpRollup = require("gulp-rollup");
const livereload = require("rollup-plugin-livereload");
const serve = require("rollup-plugin-serve");
const commonjs = require("rollup-plugin-commonjs");
const alias = require("rollup-plugin-alias");
const resolve = require("rollup-plugin-node-resolve");
const postcss = require("rollup-plugin-postcss");
const rollupBabel = require("rollup-plugin-babel");
const progress = require("rollup-plugin-progress");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const buble = require("rollup-plugin-buble");
const externalHelpers = require("babel-plugin-external-helpers");
const replace = require("rollup-plugin-re");

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
        dist = isProduction ? prodDist : testDist,
        env = process.env.NODE_ENV;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
gulp.task("build-development", ["copy"], function () {
    //var initialTask = this.seq.slice(-1)[0];
    return rollupBuild();
});
/**
 * Production Rollup 
 */
gulp.task("build", ["copyprod"], function () {

    return rollupBuild();
});

/**
 * Default: Production Acceptance Tests 
 */
gulp.task("pat", ["build-development"], function (done) {
    if (!browsers) {
        global.whichBrowsers = [/*"ChromeHeadless",*/ "FirefoxHeadless"];
    }

    runKarma(done);
});
/*
 * javascript linter
 */
gulp.task("eslint", ["pat"], () => {
    dist = prodDist;
    var stream = gulp.src(["../appl/js/**/*.js"])
            .pipe(eslint({
                configFile: "eslintConf.json",
                quiet: 0
            }))
            .pipe(eslint.format())
            .pipe(eslint.result(result => {
                //Keeping track of # of javascript files linted.
                lintCount++;
            }))
            .pipe(eslint.failAfterError());

    stream.on("end", function () {
        log("# javascript files linted: " + lintCount);
    });

    stream.on("error", function () {
        process.exit(1);
    });

    return stream;
});
/*
 * css linter
 */
gulp.task("csslint", ["pat"], function () {
    var stream = gulp.src(["../appl/css/site.css"])
            .pipe(csslint())
            .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
});

/*
 * Bootstrap html linter 
 */
gulp.task("bootlint", ["eslint", "csslint"], function (cb) {

    exec("gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/**
 * Remove previous build
 */
gulp.task("clean", ["bootlint"], function (done) {

    isProduction = true;
    dist = prodDist;
    return del([
        "../../" + prodDist + "/**/*"
    ], {dryRun: false, force: true}, done);
});
/**
 * Resources and content copied to dist directory - for production
 */
gulp.task("copyprod", ["bootlint", "copyprod_images"], function () {
    return copySrc();
});
gulp.task("copyprod_images", ["bootlint", "copyprod_node_css"], function () {
    return copyImages();
});
gulp.task("copyprod_node_css", ["bootlint", "copyprod_css"], function () {
    return copyNodeCss();
});
gulp.task("copyprod_css", ["bootlint", "copyprod_fonts"], function () {
    return copyCss();
});
gulp.task("copyprod_fonts", ["bootlint", "clean"], function () {
    isProduction = true;
    dist = prodDist;
    return copyFonts();
});
/**
 * Resources and content copied to dist_test directory - for development
 */
gulp.task("copy", ["copy_images"], function () {
    return copySrc();
});
gulp.task("copy_images", ["copy_node_css"], function () {
    return copyImages();
});
gulp.task("copy_node_css", ["copy_css"], function () {
    return copyNodeCss();
});
gulp.task("copy_css", ["copy_fonts"], function () {
    return copyCss();
});
gulp.task("copy_fonts", function () {
    isProduction = false;
    dist = testDist;
    return copyFonts();
});

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("r-test", function (done) {
    if (!browsers) {
        global.whichBrowsers = [/*"ChromeHeadless",*/ "FirefoxHeadless"];
    }

    runKarma();
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task("tdd-rollup", ["build-development"], function (done) {

    if (!browsers) {
        global.whichBrowsers = [/*"Chrome",*/ "Firefox"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();

});
/**
 * Karma testing under Opera. -- needs configuation  
 */
gulp.task("tddo", function (done) {

    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();

});

gulp.task("rollup-watch", function () {
    const watchOptions = {
        allowRealFiles: true,
        input: "../appl/index.js",
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
            file: "../../" + dist + "/bundle.js",
            format: "iife",
            sourcemap: true
        }
    };
    watcher = rollup.watch(watchOptions);
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
});

gulp.task("default", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("prod", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("acceptance", ["r-test"]);
gulp.task("tdd", ["tdd-rollup"]);
gulp.task("test", ["pat"]);
gulp.task("watch", ["rollup-watch"]);
gulp.task("rebuild", ["build-development"]);  //remove karma config for node express

function rollupBuild() {
    return gulp.src(["../appl/index.js"])
            .pipe(removeCode({production: isProduction}))
            .pipe(isProduction ? stripCode({pattern: regexPattern}) : noop())
            .pipe(gulpRollup({
                allowRealFiles: true,
                input: "../appl/index.js",
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
                        presets: [["env", {/*targets: {"uglify":true},*/ modules: false}]],
                        plugins: ["external-helpers"]
                    })
                ],
            }))
            .on("error", log)
            .pipe(rename("bundle.js"))
            .pipe(isProduction ? uglify() : noop())
            // .pipe(sourcemaps.init({ loadMaps: !isProduction }))
            // .pipe(sourcemaps.write('../dist_test/rollup/maps'))
            .pipe(gulp.dest("../../" + dist));
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
    return gulp
            .src(["../appl/views/**/*", "../appl/templates/**/*", isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyImages() {
    return gulp
            .src(["../images/*", "../../README.md"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyCss() {
    return gulp
            .src(["../appl/css/site.css"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyNodeCss() {
    return gulp
            .src(["../../node_modules/bootstrap/dist/css/bootstrap.min.css", "../../node_modules/font-awesome/css/font-awesome.css",
                "../../node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css", "../../node_modules/tablesorter/dist/css/theme.blue.min.css"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyFonts() {

    return gulp
            .src(["../../node_modules/font-awesome/fonts/*"])
            .pipe(copy("../../" + dist + "/appl"));
}

function runKarma(done) {

    new Server({
        configFile: __dirname + "/karma.conf.js",
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
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
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
