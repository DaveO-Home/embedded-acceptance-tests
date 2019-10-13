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
const stripCode = require("gulp-strip-code");
const del = require("del");
const noop = require("gulp-noop");
const log = require("fancy-log");
const Bundler = require("parcel-bundler");
const flatten = require("gulp-flatten");
const chalk = require("chalk");
const browserSync = require("browser-sync");

const startComment = "steal-remove-start";
const endComment = "steal-remove-end";
const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
    startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
    endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
const isWindows = /^win/.test(process.platform);

let lintCount = 0;
let isProduction = global.isProduction = process.env.NODE_ENV === "production";
let browsers = process.env.USE_BROWSERS;
let bundleTest = process.env.USE_BUNDLER;
let testDist = "dist_test/parcel";
let prodDist = "dist/parcel";
let dist = isProduction ? prodDist : testDist;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
gulp.task("build-development", ["copy"], (cb) => {
    return parcelBuild(false, cb); // setting watch = false
});
/**
 * Production Parcel 
 */
gulp.task("build", ["copyprod"], (cb) => {
    // return parcelBuild(false, cb);
    parcelBuild(false, cb).then(function () {
        cb();
    });
});

/**
 * Default: Production Acceptance Tests 
 */
gulp.task("pat", ["build-development"], done => {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    return runKarma(done);
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

    stream.on("end", () => {
        log(chalk.cyan("# javascript files linted: " + lintCount));
    });

    stream.on("error", () => {
        process.exit(1);
    });

    return stream;
});
/*
 * css linter
 */
gulp.task("csslint", ["pat"], () => {
    var stream = gulp.src(["../appl/css/site.css"])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", () => {
        process.exit(1);
    });
});

/*
 * Bootstrap html linter 
 */
gulp.task("bootlint", ["eslint", "csslint"], cb => {
    exec("gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/**
 * Remove previous build
 */
gulp.task("clean", ["bootlint"], done => {
    isProduction = true;
    dist = prodDist;
    return del([
        "../../" + prodDist + "/**/*"
    ], { dryRun: false, force: true }, done);
});

gulp.task("cleant", done => {
    let dryRun = false;
    if (bundleTest && bundleTest === "false") {
        dryRun = true;
    }
    isProduction = false;
    dist = testDist;
    return del([
        "../../" + testDist + "/**/*"
    ], { dryRun: dryRun, force: true }, done);
});
/**
 * Resources and content copied to dist directory - for production
 */
gulp.task("copyprod", ["bootlint", "copyprod_images"], () => {
    return copySrc();
});
// gulp.task('copyprod_images', ['bootlint', 'copyprod_node_css'], () => {
gulp.task("copyprod_images", ["bootlint", "clean"], () => {
    isProduction = true;
    dist = prodDist;
    return copyImages();
});

/**
 * Resources and content copied to dist_test directory - for development
 */
gulp.task("copy", ["copy_images"], () => {
    return copySrc();
});
gulp.task("copy_images", ["cleant"], () => {
    isProduction = false;
    dist = testDist;
    return copyImages();
});

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("r-test", done => {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runKarma();
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task("tdd-parcel", ["build-development"], done => {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();
});
/**
 * Karma testing under Opera. -- needs configuation  
 */
gulp.task("tddo", done => {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();
});
/**
 * Using BrowserSync Middleware for HMR  
 */
gulp.task("sync", ["watch-parcel"], () => {
    const server = browserSync.create("devl");
    dist = testDist;
    server.init({ server: "../../", index: "index_p.html", port: 3080/*, browser: ['google-chrome']*/});
    server.watch("../../" + dist + "/appl.*.*").on("change", server.reload);  //change any file in appl/ to reload app - triggered on watchify results
    return server;
});

gulp.task("watcher", ["sync"], done => {
    log(chalk.green("Watcher & BrowserSync Started - Waiting...."));
    return done();
});

gulp.task("watch-parcel", ["copy"], cb => {
    return parcelBuild(true, cb);
});

gulp.task("default", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("prod", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("acceptance", ["r-test"]);
gulp.task("tdd", ["tdd-parcel"]);
gulp.task("test", ["pat"]);
gulp.task("watch", ["watcher"]);
gulp.task("rebuild", ["build-development"]);  //remove karma config for node express

function parcelBuild(watch, cb) {
    if (bundleTest && bundleTest === "false") {
        return cb();
    }
    const file = isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html";
    // Bundler options
    const options = {
        production: isProduction,
        outDir: "../../" + dist,
        outFile: isProduction ? "testapp.html" : "testapp_dev.html",
        publicUrl: "./",
        watch: watch,
        cache: !isProduction,
        cacheDir: ".cache",
        minify: isProduction,
        target: "browser",
        https: false,
        logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
        // hmrPort: 3080,
        sourceMaps: !isProduction,
        // hmrHostname: 'localhost',
        detailedReport: isProduction
    };

    // Initialises a bundler using the entrypoint location and options provided
    const bundler = new Bundler(file, options);
    let isBundled = false;

    bundler.on("bundled", () => {
        isBundled = true;
    });
    bundler.on("buildEnd", () => {
        if (isBundled) {
            log(chalk.green("Build Successful"));
        }
        else {
            log(chalk.red("Build Failed"));
            process.exit(1);
        }
    });
    // Run the bundler, this returns the main bundle
    return bundler.bundle();
}

function copySrc() {
    return gulp
        .src(["../appl/view*/**/*", "../appl/temp*/**/*"/*, isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'*/])
        .pipe(flatten({ includeParents: -2 })
            .pipe(gulp.dest("../../" + dist + "/")));
}

function copyImages() {
    return gulp
        .src(["../images/*", "../../README.m*"])
        .pipe(copy("../../" + dist + "/appl"));
}

function runKarma(done) {

    new Server({
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    }, result => {
        var exitCode = !result ? 0 : result;
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
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
