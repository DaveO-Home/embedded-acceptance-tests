/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', bootlint) -> 'clean' -> 'build'
 */

const { task, series, parallel, src, /*dest*/ } = require("gulp");

const runFusebox = require("./fuse4.js");
const path = require("path");
const karma = require("karma");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const chalk = require("chalk");

let lintCount = 0;
let dist = "dist_test/fusebox";
let isProduction = false;

let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowser = browsers.split(",");
}
// var isWindows = /^win/.test(process.platform);
// var initialTask;
let useFtl = true;

let useBundler = process.env.USE_BUNDLER !== "false";
process.argv.forEach(function (val, index /*, array*/) {
    useFtl = val === "--noftl" && useFtl ? false : useFtl;
    if(index > 2) {
        process.argv[index] = "";
    }
});
/**
 * Default: Production Acceptance Tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
};
/*
 * javascript linter
 */
const esLint = function () {
    var stream = src(["../appl/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js",
            quiet: 0,
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(() => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function () {
        process.exit(1);
    });

    return stream.on("end", function () {
        log(chalk.blue.bold("# javascript files linted: " + lintCount));
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(["../appl/css/site.css"
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
    stream.on("end", function () {
        cb();
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
/*
 * Build the application to run karma acceptance tests
 */
const testBuild = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: true,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false,
        ftl: false
    };
    let mode = "test";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        log("Error", e);
    }
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    process.argv[2] = "";
    if(!useBundler) {
        return cb();
    }
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "production",
        useServer: false,
        ftl: false
    };
    let mode = "prod";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        log("Error", e);
    }
};
/*
 * Build the application to preview the production distribution 
 */
const preview = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "production",
        useServer: true,
        ftl: false
    };
    let mode = "preview";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        log("Error", e);
    }
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const fuseboxHmr = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: true,
        isWatch: true,
        env: "development",
        useServer: true,
        ftl: useFtl
    };
    let mode = "test";
    const debug = true;
    try {
        runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        log("Error", e);
    }
};
/*
const setNoftl = function (cb) {
    useFtl = false;
    cb();
};
*/
/*
 * Build the application to run node express so font-awesome is resolved
 */
const fuseboxRebuild = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false,
        ftl: false
    };
    let mode = "test";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        log("Error", e);
    }
};
/*
 * copy assets for development
 */
const copy = async function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false
    };
    let mode = "copy";
    const debug = true;
    try {
        runFusebox(mode, fuseboxConfig(mode, props), debug);
    } catch (e) {
        log("Error", e);
    }
    cb();
};
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = "../../dist/";
    return import("del").then(del => {
         del.deleteSync([
                  dist + "fusebox/**/*"
              ], { dryRun: false, force: true });
         done();
     });
//    return del([
//        dist + "fusebox/**/*",
//    ], { dryRun: false, force: true }, done);
};
/**
 * Remove previous build - only
 */
const cleanOnly = function (done) {
    isProduction = true;
    dist = "../../dist/";
    return import("del").then(del => {
         del.deleteSync([
                  dist + "fusebox/**/*"
              ], { dryRun: false, force: true });
         done();
     });
//    return del([
//        dist + "fusebox/**/*",
//    ], { dryRun: false, force: true }, done);
};

/**
 * Continuous testing - test driven development.  
 */
const fuseboxTdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};

/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Opera"];
    }
    karmaServer(done, false, true);
};

const testRun = series(testBuild, pat); // series(accept, pat);
const prodRun = series(testRun, parallel(esLint, cssLint/*, bootLint*/), clean, build);
const prdRun = series(parallel(esLint, cssLint), cleanOnly, build); // series(cleanOnly, buildOnly);
const tddRun = fuseboxTdd;
const hmrRun = fuseboxHmr;
const rebuildRun = fuseboxRebuild;
const acceptanceRun = pat;
const devRun = parallel(hmrRun, tddRun);

prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.test = testRun;
exports.prd = prdRun;
exports.tdd = tddRun;
exports.hmr = hmrRun;
exports.rebuild = rebuildRun;
exports.acceptance = acceptanceRun;
exports.development = devRun;
exports.lint = parallel(esLint, cssLint);
exports.copy = copy;
exports.preview = preview;
exports.tddo = tddo;

function fuseboxConfig(mode, props) {
    mode = mode || "test";
    // if(process.argv[2]) {
    //     mode = process.argv[2];
    // }
    if (typeof props === "undefined") {
        props = {};
    }
    let toDist = "";
    let isProduction = mode !== "test";
    let distDir = isProduction ? path.join(__dirname, "../../dist/fusebox") : path.join(__dirname, "../../dist_test/fusebox");
    let defaultServer = props.useServer;
    let devServe = {
        httpServer: {
            root: path.join(__dirname, "../.."),
            port: 3080,
            open: false
        },
    };
    const configure = {
        root: path.join(__dirname, "../.."),
        distRoot: path.join("/", `${distDir}${toDist}`),
        target: "browser",
        env: { NODE_ENV: isProduction ? "production" : "development" },
        entry: path.join(__dirname, "../appl/index.js"),
        dependencies: { serverIgnoreExternals: true },
        cache: {
            root: path.join(__dirname, ".cache"),
            enabled: !isProduction,
            FTL: typeof props.ftl === "undefined" ? true : props.ftl
        },
        sourceMap: !isProduction,
        webIndex: {
            distFileName: isProduction ? path.join(__dirname, "../../dist/fusebox/appl/testapp.html") : path.join(__dirname, "../../dist_test/fusebox/appl/testapp_dev.html"),
            publicPath: "../",
            template: isProduction ? path.join(__dirname, "../appl/testapp.html") : path.join(__dirname, "../appl/testapp_dev.html")
        },
        tsConfig: path.join(__dirname, "tsconfig.json"),
        watcher: props.isWatch && !isProduction,
        hmr: props.isHmr && !isProduction,
        devServer: defaultServer ? devServe : false,
        logging: { level: "succinct" },
        modules: ["node_modules"],
        turboMode: true,
        exclude: isProduction ? "**/*test.js" : "",
        resources: {
            resourceFolder: "./styles",
            resourcePublicRoot: isProduction ? "./" : "../styles"
        },
        codeSplitting: {
            useHash: isProduction ? true : false
        }
    };
    return configure;
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

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("log.txt", { flags: "w" });
    // Or "w" to truncate the file every time the process starts.
    var logStdout = process.stdout;

    // eslint-disable-next-line no-console
    console.log = function () {
        logFile.write(util.format.apply(null, arguments) + "\n");
        logStdout.write(util.format.apply(null, arguments) + "\n");
    };
    // eslint-disable-next-line no-console
    console.error = console.log;
}
