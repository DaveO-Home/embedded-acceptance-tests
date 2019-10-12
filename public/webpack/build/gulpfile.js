/**
 *         
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 *
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'acceptance_tests' -> 'test_build' -> ('eslint', 'csslint', 'bootlint') -> 'boot' -> 'build'
 */

const { series, parallel, task, src, dest } = require('gulp');
const path = require('path');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const log = require("fancy-log");
const env = require("gulp-env");
const webpack = require('webpack');
const webpackStream = require("webpack-stream");
const WebpackDevServer = require('webpack-dev-server');
const ReloadPlugin = require('reload-html-webpack-plugin');
const chalk = require('chalk')
const packageDep = require('../../package.json')

const version = Number(/\d/.exec(packageDep.devDependencies.webpack)[0])
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
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(function (result) {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    });

    return stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
        cb()
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    });
    return stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
        cb()
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    dist = 'dist';
    let win = "";
    let set = "";
    if (isWindows) {
        win = "win";
        set = "set"
    }
    const cmd = set || "export";
    exec(cmd + ' W_VERSION="' + version + '"; npm run webpackprod' + win, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    log(chalk.cyan("Starting Gulpboot.js"))
    exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
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
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        watch: false
    }, function (result) {
        var exitCode = !result ? 0 : result;
        done();
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
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
        .pipe(webpackStream(require('../webpack.config.js')))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb()
    })
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

    if (process.env.USE_BUILD == 'false') {  //Let Webpack do the build if only doing unit-tests
        const stream = src("../appl/index.js")
            .pipe(envs);
        return stream.on("end", function () {
            cb();
        })
    };

    const stream = src("../appl/index.js")
        .pipe(envs)
        .pipe(webpackStream(require('../webpack.config.js')))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb();
    })
};
/**
 * Continuous testing - test driven development.  
 */
const webpack_tdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ['Chrome', 'Firefox'];
    }

    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
};
/*
 * Webpack recompile to 'dist_test' on code change
 * run watch in separate window. Used with karma tdd.
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

    const webpackConfig = require('../webpack.config.js');

    const stream = src("../appl/**/*")
        .pipe(webpackStream(webpackConfig))
        .pipe(dest("../../dist_test/webpack"));
    return stream.on("end", function () {
        cb()
    })
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
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "true"
    });

    const options = {
        contentBase: '../../',
        hot: true,
        host: 'localhost',
        publicPath: '/dist_test/webpack/',
        stats: { colors: true },
        watchOptions: {
            ignored: /node_modules/
        }
    };

    var webpackConfig = require('../webpack.config.js');
    webpackConfig.devtool = 'eval';
    webpackConfig.output.path = path.resolve('../../dist_test/webpack');
    webpackConfig.plugins.concat([
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]);

    if (version < 4) {
        webpackConfig.plugins.concat([
            new ReloadPlugin()
        ])
    }

    WebpackDevServer.addDevServerEntrypoints(webpackConfig, options);

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, options);
    const port = process.env.PORT ? Number(process.env.PORT) : 3080;
    const host = process.env.HOST || "localhost"
    return server.listen(port, host, function (err) {
        log(chalk.cyan('[webpack-server] http://localhost:' + port + '/webpack/appl/testapp_dev.html'));
        if (err) {
            log(err);
        }
    }).on("end", function () {
        cb();
    });
};

const runTest = series(test_build, acceptance_tests)
const runLint = parallel(esLint, cssLint, bootLint)

exports.default = series(runTest, runLint, build)
exports.prod = series(runTest, runLint, build)
exports.prd = series(build)
exports.test = runTest
exports.tdd = series(test_build, webpack_tdd)
exports.watch = webpack_watch
exports.hmr = webpack_server
exports.rebuild = webpack_rebuild
exports.development = parallel(webpack_server, webpack_watch, webpack_tdd)
exports.lint = runLint

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var proc = require('process');
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
