/**
 *         
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 *
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'acceptance_tests' -> 'test_build' -> ('eslint', 'csslint', 'bootlint') -> 'boot' -> 'build'
 */

const { series, parallel, task, src, dest } = require("gulp");
const path = require("path");
const karma = require("karma");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const env = require("gulp-env");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const WebpackDevServer = require("webpack-dev-server");
const chalk = require("chalk");
const packageDep = require("../../package.json");
const devConfig = require("../webpack.dev.config");
const version = Number(/\d/.exec(packageDep.devDependencies.webpack)[0]);
let lintCount = 0, dist = "dist_test";
let browsers = process.env.USE_BROWSERS;
let isWindows = /^win/.test(process.platform);
if (browsers) {
    global.whichBrowser = browsers.split(",");
}

/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/**/*.js", "../tests/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js",
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(function (result) {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function (err) {
        log(err);
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

    stream.on("error", function (err) {
        log(err);
        process.exit(1);
    });
    return stream.on("end", function () {
        log(chalk.blue.bold("# css files linted: " + lintCount));
        cb();
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    const prodWebpackConfig = require("../webpack.prod.config");

    const envs = env.set({
        NODE_ENV: "production",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "",
        USE_TEST: "false",
        USE_BUILD: "false",
        W_VERSION: version
    });
    const stream =  src("../appl/index.js")
        .pipe(envs)
        .pipe(webpackStream(prodWebpackConfig, webpack))
        .pipe(envs.reset)
        .pipe(dest("../../dist/webpack"))
        .on("error", function (err) {
            log(err);
            cb();
        })
        return stream.on("end", function () {
            cb();
            log(chalk.cyan("  Build complete.\n"));
        });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    log(chalk.cyan("Starting Gulpboot.js"));
    exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/**
 * Run karma/jasmine tests once and exit
 * Set environment variable USE_BUILD=false to bypass the build
 */
const acceptance_tests = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
};
/*
 * Build Test without Karma settings for npm Express server (npm start)
 */
const webpack_rebuild = function (cb) {
    var envs = env.set({
        W_VERSION: version,
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "",
        USE_TEST: "true",
        USE_BUILD: "false"
    });

    const stream = src("../appl/index.js")
        .pipe(envs)
        .pipe(webpackStream(devConfig))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb();
    });
};
/*
 * Build the test bundle
 */
const test_build = function (cb) {
    var useBuild = process.env.USE_BUILD == "false" ? "false" : "true";
    var envs = env.set({
        W_VERSION: version,
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "true",
        USE_HMR: "false",
        USE_BUILD: useBuild,
        PUBLIC_PATH: "/base/dist_test/webpack/"   //This sets config to run under Karma
    });

    if (process.env.USE_BUILD == "false") {  //Let Webpack do the build if only doing unit-tests
        const stream = src("../appl/index.js")
            .pipe(envs);
        return stream.on("end", function () {
            cb();
        });
    }

    const stream = src("../appl/index.js")
        .pipe(envs)
        .pipe(webpackStream(require("../webpack.dev.config")))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb();
    });
};
/**
 * Continuous testing - test driven development.  
 */
const webpack_tdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }

    karmaServer(done, false, true);
};
/*
 * Webpack recompile to 'dist_test' on code change
 * run watch in separate window. Used with karma tdd.
 * This is obsolete; dev-server now does everything in memory.
 * run "bm webpack rebuild" to restart tdd
 */
const webpack_watch = function (cb) {
    env.set({
        W_VERSION: version,
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    devConfig.watch = true;
    const stream = src("../appl/**/*")
        .pipe(webpackStream(devConfig))
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb();
    });
};

/*
 * Webpack development server - use with normal development
 * Rebuilds bundles in dist_test on code change.
 * Run server in separate window - 
 * - watch for code changes 
 * - hot module recompile/replace
 * - reload served web page.
 */
const webpack_server = function (cb) {
    env.set({
        W_VERSION: version,
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "true"
    });

    const options = {
        contentBase: "../../",
        hot: true,
        host: "localhost",
        publicPath: "/dist_test/webpack/",
        stats: { colors: true },
        watchOptions: {
            ignored: /node_modules/
        }
    };

    devConfig.devtool = "eval";
    devConfig.output.path = path.resolve("../../dist_test/webpack");
    devConfig.plugins.concat([
        new webpack.HotModuleReplacementPlugin()
    ]);
    devConfig.performance.hints = false;
    devConfig.entry = getEntry();
    const port = process.env.PORT ? Number(process.env.PORT) : 3080;
    const host = process.env.HOST || "localhost";
    const compiler = webpack(devConfig);
    const devServerOptions = { ...devConfig.devServer, open: false};
    const server = new WebpackDevServer(devServerOptions, compiler);
    // webpack_rebuild(cb);
    server.startCallback(() => {
        log(chalk.cyan("[webpack-server] http://localhost:" + port + "/dist_test/webpack/appl/testapp_dev.html"));
        cb();
      });
};

const runTest = series(test_build, acceptance_tests);
const runLint = parallel(esLint, cssLint/*, bootLint*/);

exports.default = series(runTest, runLint, build);
exports.prod = series(runTest, runLint, build);
exports.prd = series(build);
exports.test = runTest;
exports.tdd = series(test_build, webpack_tdd);
exports.watch = webpack_watch;
exports.hmr = webpack_server;
exports.rebuild = webpack_rebuild;
exports.development = parallel(webpack_server, webpack_watch, webpack_tdd);
exports.lint = runLint;

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
    var proc = require("process");
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

function getEntry() {
    return [
        // Runtime code for hot module replacement
        "webpack/hot/dev-server.js",
        // Dev server client for web socket transport, hot and live reload logic
        "webpack-dev-server/client/index.js?hot=true&live-reload=true",
        // Your entry
        "/appl/index",
    ];
}
