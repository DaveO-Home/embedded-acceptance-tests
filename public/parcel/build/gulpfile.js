/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */

const { series, parallel, task, src, dest } = require('gulp');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const copy = require("gulp-copy");
const del = require('del');
const log = require('fancy-log');
const Bundler = require('parcel-bundler')
const flatten = require('gulp-flatten')
const chalk = require('chalk');
const browserSync = require('browser-sync');

let lintCount = 0
let isProduction = global.isProduction = process.env.NODE_ENV === 'production'
let browsers = process.env.USE_BROWSERS
let bundleTest = process.env.USE_BUNDLER
let testDist = "dist_test/parcel"
let prodDist = "dist/parcel"
let dist = isProduction ? prodDist : testDist

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
task('build-development', function (cb) {
    return parcelBuild(false, cb); // setting watch = false
});
/**
 * Production Parcel 
 */
task('build', function (cb) {
    parcelBuild(false, cb).then(function () {
        cb()
    });
});
/**
 * Default: Production Acceptance Tests 
 */
task('pat', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    return runKarma(done);
});
/*
 * javascript linter
 */
task('eslint', function (cb) {
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
        log(chalk.cyan("# javascript files linted: " + lintCount));
        cb()
    });
});
/*
 * css linter
 */
task('csslint', function (cb) {
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', () => {
        process.exit(1);
    });
    stream.on("end", () => {
        cb()
    });
});
/*
 * Bootstrap html linter 
 */
task('bootlint', function (cb) {
    exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/**
 * Remove previous build
 */
task('clean', function (done) {
    isProduction = true;
    dist = prodDist;
    return del([
        '../../' + prodDist + '/**/*'
    ], { dryRun: false, force: true }, done);
});

task('cleant', function (done) {
    let dryRun = false
    if (bundleTest && bundleTest === "false") {
        dryRun = true
    }
    isProduction = false;
    dist = testDist;
    return del([
        '../../' + testDist + '/**/*'
    ], { dryRun: dryRun, force: true }, done);
});
/**
 * Resources and content copied to dist directory - for production
 */
task('copyprod', function () {
    copyDodex();
    return copySrc();
});

task('copyprod-readme', function () {
    isProduction = true;
    dist = prodDist;
    return copyReadme();
});

/**
 * Resources and content copied to dist_test directory - for development
 */
task('copy', function () {
    copyDodex();
    return copySrc();
});

task('copy-readme', function () {
    isProduction = false;
    dist = testDist;
    return copyReadme();
});
/**
 * Continuous testing - test driven development.  
 */
task('tdd-parcel', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});
/**
 * Karma testing under Opera. -- needs configuation  
 */
task('tddo', function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});
/**
 * Using BrowserSync Middleware for HMR  
 */
task('sync', function () {
    const server = browserSync.create('devl');
    dist = testDist;
    server.init({ server: '../../', index: 'index_p.html', port: 3080/*, browser: ['google-chrome']*/ });
    server.watch('../../' + dist + '/appl.*.*').on('change', server.reload);  //change any file in appl/ to reload app - triggered on watchify results
    return server;
});

task('watcher', function (done) {
    log(chalk.green("Watcher & BrowserSync Started - Waiting...."));
    return done()
});

task('watch-parcel', function (cb) {
    return parcelBuild(true, cb)
});

const testRun = series('cleant', parallel('copy-readme', 'copy'), 'build-development', 'pat');
const copyRun = series('clean', parallel('copyprod-readme', 'copyprod'))
const logSeperator = function(cb) { log("\n\n\n\n\n\n\n\n"); cb() }  // parcel clears too many lines
const prodRun = series(testRun, parallel('eslint', 'csslint', 'bootlint'), copyRun, logSeperator, 'build')
const acceptanceRun = series('pat')
const rebuildRun = series('cleant', parallel('copy-readme', 'copy'), 'build-development')
const watchRun = series(parallel('copy-readme', 'copy'), 'watch-parcel', 'sync', 'watcher')
const tddRun = series('cleant', parallel('copy-readme', 'copy'), 'build-development', 'tdd-parcel')
const devRun = parallel(watchRun, 'tdd-parcel')

prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.test = testRun
exports.acceptance = acceptanceRun
exports.rebuild = rebuildRun
exports.watch = watchRun
exports.tdd = tddRun
exports.development = devRun

function parcelBuild(watch, cb) {
    if (bundleTest && bundleTest === "false") {
        return cb()
    }
    const file = isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'
    // Bundler options
    const options = {
        production: isProduction,
        outDir: '../../' + dist,
        outFile: isProduction ? 'testapp.html' : 'testapp_dev.html',
        publicUrl: './',
        watch: watch,
        cache: !isProduction,
        cacheDir: '.cache',
        minify: isProduction,
        target: 'browser',
        https: false,
        logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
        // hmrPort: 3080,
        sourceMaps: !isProduction,
        // hmrHostname: 'localhost',
        detailedReport: isProduction
    };

    // Initialises a bundler using the entrypoint location and options provided
    const bundler = new Bundler(file, options);
    let isBundled = false

    bundler.on('bundled', () => {
        isBundled = true
    })
    bundler.on("buildEnd", () => {
        if (isBundled) {
            log(chalk.green("Build Successful"))
        }
        else {
            log(chalk.red("Build Failed"))
            process.exit(1)
        }
    })
    // Run the bundler, this returns the main bundle
    return bundler.bundle()
}

function copySrc() {
    return src(['../appl/view*/**/*', '../appl/temp*/**/*'])
        .pipe(flatten({ includeParents: -2 })
            .pipe(dest('../../' + dist + '/')))
}

function copyDodex() {
    return src(['../appl/dodex/**/*'])
            .pipe(dest('../../' + dist + '/dodex'))
}

function copyReadme() {
    return src([/*'../images/*',*/ '../../README.m*'])
        .pipe(copy('../../' + dist + '/appl/data'));
}

function runKarma(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
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
