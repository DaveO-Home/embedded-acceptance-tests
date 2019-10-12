/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', bootlint) -> 'clean' -> 'build'
 */

const { task, series, parallel, src, dest } = require('gulp');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const log = require("fancy-log");
const env = require("gulp-env");
const copy = require('gulp-copy');
const chalk = require('chalk');
const del = require('del')

var lintCount = 0,
    dist = "dist_test/fusebox",
    isProduction = false;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowser = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);
var initialTask;
/**
 * Default: Production Acceptance Tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function (result) {
        var exitCode = !result ? 0 : result;
        done();

        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
};
/*
 * javascript linter
 */
const esLint = function () {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 0,
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
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css'
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    });
    stream.on('end', function () {
        cb();
    });
};

/*
 * Build the application to run karma acceptance tests
 */
const accept = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ';
    }

    log(chalk.cyan('E2E Testing - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};

/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Building production - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/*
    Build production without doing tests first
*/
const buildOnly = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Building production - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = '../../dist/';
    return del([
        dist + 'fusebox/**/*',
    ], { dryRun: false, force: true }, done);
};
/**
 * Remove previous build - only
 */
const cleanOnly = function (done) {
    isProduction = true;
    dist = '../../dist/';
    return del([
        dist + 'fusebox/**/*',
    ], { dryRun: false, force: true }, done);
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const fuseboxHmr = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ';
    }

    log(chalk.cyan('Configuring HMR - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/*
 * Build the application to run node express so font-awesome is resolved
 */
const fuseboxRebuild = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Rebuilding test - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/**
 * Continuous testing - test driven development.  
 */
const fuseboxTdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ['Chrome', 'Firefox'];
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
        global.whichBrowser = ['Opera'];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
};
/**
 * Resources and content copied to dist_test directory - for development
 */
const fuseboxSrc = function () {
    return copySrc();
};
const fuseboxImages = function () {
    return copyImages();
};

const testRun = series(accept, pat);
const prodRun = series(testRun, parallel(esLint, cssLint, bootLint), clean, build)
const prdRun = series(cleanOnly, buildOnly)
const tddRun = fuseboxTdd
const hmrRun = fuseboxHmr
const rebuildRun = fuseboxRebuild
const acceptanceRun = pat
const devRun = parallel(hmrRun, tddRun)

prodRun.displayName = "prod"

task(prodRun)
exports.default = prodRun
exports.test = testRun
exports.prd = prdRun
exports.tdd = tddRun
exports.hmr = hmrRun
exports.rebuild = rebuildRun
exports.acceptance = acceptanceRun
exports.development = devRun
exports.lint = parallel(esLint, cssLint, bootLint)

function copySrc() {
    return src(['../appl/dodex/data/**/*', '../appl/views/**/*', '../appl/templates/**/*', isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyImages() {
    return src(['../images/*', '../../README.md'])
        .pipe(copy('../../' + dist + '/appl'));
}

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
