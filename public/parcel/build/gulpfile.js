/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */

const { series, parallel, task, src, dest } = require("gulp");
const path = require("path");
const Parcel = require("@parcel/core").default;
const karma = require("karma");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const copy = require("gulp-copy");
const del = require("del");
const log = require("fancy-log");
const flatten = require("gulp-flatten");
const chalk = require("chalk");
const browserSync = require("browser-sync");

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
task("build-development", function (cb) {
    return parcelBuild(false, cb); // setting watch = false
});
/**
 * Production Parcel 
 */
task("build", function (cb) {
    parcelBuild(false, cb).then(function () {
        cb();
    });
});
/**
 * Default: Production Acceptance Tests 
 */
task("pat", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    return karmaServer(done, true, false);
});
/*
 * javascript linter
 */
task("eslint", function (cb) {
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
});
/*
 * css linter
 */
task("csslint", function (cb) {
    var stream = src(["../appl/css/site.css"])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", () => {
        process.exit(1);
    });
    stream.on("end", () => {
        cb();
    });
});
/*
 * Bootstrap html linter 
 */
task("bootlint", function (cb) {
    exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/**
 * Remove previous build
 */
task("clean", function (done) {
    isProduction = true;
    dist = prodDist;
    return del([
        "../../" + prodDist + "/**/*"
    ], { dryRun: false, force: true }, done);
});

task("cleant", function (done) {
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
task("copyprod", function () {
    copyDodex();
    return copySrc();
});

task("copyprod-readme", function () {
    isProduction = true;
    dist = prodDist;
    return copyReadme();
});

/**
 * Resources and content copied to dist_test directory - for development
 */
task("copy", function () {
    copyDodex();
    return copySrc();
});

task("copy-readme", function () {
    isProduction = false;
    dist = testDist;
    return copyReadme();
});
/**
 * Continuous testing - test driven development.  
 */
task("tdd-parcel", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
});
/**
 * Karma testing under Opera. -- needs configuation  
 */
task("tddo", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    
    karmaServer(done, false, true);
});
/**
 * Using BrowserSync Middleware for HMR  
 */
task("sync", function () {
    const server = browserSync.create("devl");
    dist = testDist;
    server.init({ server: "../../", index: "index_p.html", port: 3080/*, browser: ['google-chrome']*/ });
    server.watch("../../" + dist + "/appl.*.*").on("change", server.reload);  //change any file in appl/ to reload app - triggered on watchify results
    return server;
});

task("watcher", function (done) {
    log(chalk.green("Watcher & BrowserSync Started - Waiting...."));
    return done();
});

task("watch-parcel", function (cb) {
    return parcelBuild(true, cb);
});

const watch_parcel = function (cb) {
    return parcelBuild(true, cb, false);
};

const serve_parcel = function (cb) {
    return parcelBuild(false, cb, true);
};

const delCache = function (cb) {
    return del([
        ".cache/**/*"
    ], { dryRun: false, force: true }, cb);
};

const testRun = series("cleant", parallel("copy-readme", "copy"), "build-development", "pat");
const copyRun = series("clean", parallel("copyprod-readme", "copyprod"));
const prodRun = series(testRun, parallel("eslint", "csslint"/*, "bootlint"*/), copyRun, "build");
const prdRun = series(parallel("eslint", "csslint"), copyRun, "build");
const acceptanceRun = series("pat");
const rebuildRun = series("cleant", parallel("copy-readme", "copy"), "build-development");
const watchRun = series(parallel("copy-readme", "copy"), "watch-parcel", "sync", "watcher");
const tddRun = series("cleant", parallel("copy-readme", "copy"), "build-development", "tdd-parcel");
const devRun = parallel(watchRun, "tdd-parcel");

prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd=prdRun;
exports.test = testRun;
exports.acceptance = acceptanceRun;
exports.rebuild = rebuildRun;
exports.watch = series("cleant", parallel("copy-readme", "copy"), watch_parcel); // watchRun;
exports.serve = series("cleant", parallel("copy-readme", "copy"), delCache, serve_parcel);
exports.tdd = tddRun;
exports.development = devRun;
exports.lint = parallel("csslint", "eslint");

function parcelBuild(watch, cb, serve = false) {
    if (bundleTest && bundleTest === "false") {
        return cb();
    }
    const file = isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html";
    const port = 3080;
    // Bundler options
    const options = {
        mode: isProduction? "production": "development",
        entryRoot: "../appl",
        entries: file,
        shouldDisableCache: !isProduction,
        shouldAutoInstall: true,
        shouldProfile: false,
        cacheDir: ".cache",
        shouldContentHash: isProduction,
        logLevel: "info", // 'none' | 'error' | 'warn' | 'info' | 'verbose'
        detailedReport: isProduction,
        defaultConfig: require.resolve("@parcel/config-default"),
        shouldPatchConsole: false,
        additionalReporters: [
           { packageName: "@parcel/reporter-cli", resolveFrom: __filename },
           // { packageName: "@parcel/reporter-dev-server", resolveFrom: __filename }
        ],
        defaultTargetOptions: {
            shouldOptimize: isProduction,
            shouldScopeHoist: false,
            sourceMaps: isProduction,
            publicUrl: "./",
            distDir: "../../" + dist + "/appl",
          },
    };

    return ( async () => {
        const parcel = new Parcel(options);
        if (serve || watch) {
            options.hmrOptions = {
                port: port,
                host: "localhost"
            };
            options.serveOptions = {
                host: "localhost",
                port: port,
                https: false
            };
            await parcel.watch(err => {
                if (err) throw err;
            });
            cb();
        } else {
        try {
                await parcel.run(err => {
                    console.error(err, err.diagnostics[0]? err.diagnostics[0].codeFrame: "");
                });
        } catch(e) { 
            console.error(e);
            process.exit(1);	
        }
            cb();
        }
    })();
}

function copySrc() {
    return src(["../appl/view*/**/*", "../appl/temp*/**/*"])
        .pipe(flatten({ includeParents: -2 })
            .pipe(dest("../../" + dist + "/appl")));
}

function copyDodex() {
    src(["../images/*"])
        .pipe(dest("../../" + dist + "/images"));
    return src(["../appl/dodex/**/*"])
        .pipe(dest("../../" + dist + "/appl/dodex"));
}

function copyReadme() {
    return src(["../../README.m*"])
        .pipe(copy("../../" + dist + "/appl/data/data"));
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
