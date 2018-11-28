/**
 *         
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 *
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> ('eslint', 'csslint') -> 'boot' -> 'build'
 */
let version;
const { spawn } = require('child_process');
const webpackVersion = spawn('npm', ['list', '--depth=0', 'webpack']);

const gulp = require('gulp');
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

let lintCount = 0, dist = "dist_test";
let browsers = process.env.USE_BROWSERS;
let isWindows = /^win/.test(process.platform);
if (browsers) {
    global.whichBrowser = browsers.split(",");
}

/**
 * Default: Production Acceptance Tests 
 */
gulp.task('pat', ["acceptance-tests"], function (done) {
    done();
});

/*
 * javascript linter
 */
gulp.task('eslint', ['pat'], function (cb) {
    var stream = gulp.src(["../appl/js/**/*.js"])
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

    stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
    });

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    });

    return stream;
});

/*
 * css linter
 */
gulp.task('csslint', ['pat'], function () {
    var stream = gulp.src(['../appl/css/site.css'])
            .pipe(csslint())
            .pipe(csslint.formatter());

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    });
});

/*
 * Build the application to the production distribution 
 */
gulp.task('build', ['boot', 'setVersion'], function (cb) {
    dist = 'dist';
    let win="";
    if(isWindows) {
	win="win";
    }
    
    exec('export W_VERSION="' + version + '"; npm run webpackprod' + win, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);

        cb(err);
    });
});

/*
 * Bootstrap html linter 
 */
gulp.task('boot', ['eslint', 'csslint'], function (cb) {
    log("Starting Gulpboot.js")
    exec('gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {

        log(stdout);
        log(stderr);

        cb(err);
    });
});

/**
 * Run karma/jasmine tests once and exit
 * Set environment variable USE_BUILD=false to bypass the build
 */
gulp.task('acceptance-tests', ['test-build'], function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    new Server({

        configFile: __dirname + '/karma_conf.js',
        singleRun: true,
        watch: false

    }, function (result) {

        var exitCode = !result ? 0 : result;

        done();
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
});
/*
 * Build Test without Karma settings for npm Express server (npm start)
 */
gulp.task("webpack-rebuild", ["setVersion"], function () {
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

    return gulp.src("../appl/index.js")
            .pipe(envs)
            .pipe(webpackStream(require('../webpack.config.js')))
            .pipe(envs.reset)
            .pipe(gulp.dest("../../dist_test/webpack"));
});

/*
 * Build the test bundle
 */
gulp.task("test-build", ["setVersion"], function () {
    var useBuild = process.env.USE_BUILD == "false"? "false": "true";
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

        return gulp.src("../appl/index.js")
                .pipe(envs);
    };
    
    return gulp.src("../appl/index.js")
            .pipe(envs)
            .pipe(webpackStream(require('../webpack.config.js')))
            .pipe(envs.reset)
            .pipe(gulp.dest("../../dist_test/webpack"));
});

/*
 * Extract Current Webpack Version - Now defaults to Webpack 4
 */
gulp.task("setVersion", function () {
    // webpackVersion.stdout.on('data', (data) => {
    //     version='4.6.0'
    //     const list = `${data}`.split(' ')
    //     for(idx in list) {
    //         if(list[idx].indexOf('webpack@') > -1) {
    //             version = list[idx].substr(list[idx].indexOf('@')+1)
    //         }
    //     }
    // });
    return version = "4.26.0"
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task('webpack-tdd', ["test-build"], function (done) {
    if (!browsers) {
        global.whichBrowser = ['Chrome', 'Firefox'];
    }
    
    new Server({
        configFile: __dirname + '/karma_conf.js'
    }, done).start();
});

/*
 * Webpack recompile to 'dist_test' on code change
 * run watch in separate window. Used with karma tdd.
 */
gulp.task("webpack-watch", ["setVersion"], function () {

    env.set({
        W_VERSION: version,
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    var webpackConfig = require('../webpack.config.js');

    gulp.src("../appl/**/*")
            .pipe(webpackStream(webpackConfig))
            .pipe(gulp.dest("../../dist_test/webpack"));

});

gulp.task('set-watch-env', function () {

    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    return gulp.src("./appl/index.js")
            .pipe(envs);

});

/*
 * Webpack development server - use with normal development
 * Rebuilds bundles in dist_test on code change.
 * Run server in separate window - 
 * - watch for code changes 
 * - hot module recompile/replace
 * - reload served web page.
 */
gulp.task("webpack-server", ["setVersion"], function () {

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
        stats: {colors: true},
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

    if(Number(version.substring(0, version.lastIndexOf('.'))) < 4) {
        webpackConfig.plugins.concat([
            new ReloadPlugin()
        ])
    }

    WebpackDevServer.addDevServerEntrypoints(webpackConfig, options);

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, options);

    server.listen(3080, 'localhost', function (err) {
        log('[webpack-server]', 'http://localhost:3080/webpack/appl/testapp_dev.html');
        if (err) {
            log(err);
        }
    });

});

gulp.task('default', ['pat', 'eslint', 'csslint', 'boot', 'build']);
gulp.task('tdd', ['webpack-tdd']);
gulp.task('test', ['acceptance-tests']);
gulp.task('watch', ['webpack-watch']);
gulp.task('hmr', ['webpack-server']);
gulp.task('rebuild', ['webpack-rebuild']);   //removes karma config for node express.

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
