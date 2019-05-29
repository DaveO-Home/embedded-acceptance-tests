/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'('build-development' -> run acceptance tests) -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */

const { series, parallel, task, src, dest } = require('gulp');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const noop = require("gulp-noop");
const log = require("fancy-log");
const browserify = require('browserify');
const copy = require("gulp-copy");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
// const assign = require('lodash.assign');
const watchify = require('watchify');
const removeCode = require('gulp-remove-code');
const stripCode = require("gulp-strip-code");
const browserSync = require('browser-sync').create("devl");
const del = require('del');
const chalk = require('chalk');

const startComment = "steal-remove-start",
    endComment = "steal-remove-end",
    regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let lintCount = 0;
// let vendors = [];
let browserifyInited;
let isProduction = process.env.NODE_ENV == 'production';
let isWatchify = process.env.USE_WATCH == 'true';
let browsers = process.env.USE_BROWSERS;
let testDist = "dist_test/browserify";
let prodDist = "dist/browserify";
let dist = isProduction ? prodDist : testDist;
let isSplitBundle = true;
let minify;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
/**
 * Build bundle from package.json - task functions follow 
 */
function vendorBuild() {
    isWatchify = false;
    return browserifyBuild()
}
/**
 * Build Development bundle from package.json 
 */
function vendorDevelopment() {
    isProduction = testRun.flags.node_env ? testRun.flags["node_env"] === "production" : false;
    dist = testDist;
    return isSplitBundle ? browserifyBuild() : noop();
}
/**
 * Development Browserify - optional watchify and reload 
 */
function applicationDevelopment() {
    const cmd = this.process.title.split(" ")[1];
    isWatchify = cmd === "hmr" && hmrRun.flags.isWatchify ? hmrRun.flags.isWatchify === "true" : isWatchify;
    isWatchify = cmd === "tdd" && tddRun.flags.isWatchify ? tddRun.flags.isWatchify === "true" : isWatchify;
    isWatchify = cmd === "development" && tddRun.flags.isWatchify ? tddRun.flags.isWatchify === "true" : isWatchify;

    return applicationBuild();
}

function applicationExit(cb) {
    cb();
    process.exit(0);
}
/**
 * Default: Production Acceptance Tests 
 */
function pat(done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return runKarma(done);
}
/**
 * Default: Production Acceptance Tests 
 */
function patProd() {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runKarma();
}
/*
 * javascript linter
 */
function esLint(cb) {
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

    stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
        cb()
    });

    stream.on('error', function () {
        process.exit(1);
    });

    return stream;
}

/*
 * css linter
 */
function cssLint(cb) {
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('end', function () {
        cb();
    });

    stream.on('error', function () {
        process.exit(1);
    });
}
/*
 * Bootstrap html linter 
 */
function bootLint(cb) {
    exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
}
/**
 * Remove previous build
 */
function clean() {
    isWatchify = false;
    isProduction = true;
    dist = prodDist;
    return del([
        '../../' + prodDist + '/**/*'
    ], { dryRun: false, force: true });
};
/**
 * Resources and content copied to dist directory - for production
 */
function copyProd() {
    copyImages()
    copyFonts();
    return copySrc();
}
/**
 * Resources and content copied to dist_test directory - for development
 */
function copyTest() {
    isProduction = false;
    dist = testDist;
    copyImages()
    copyFonts();
    return copySrc();
}
/*
 * Setup development with reload of app on code change
 */
function browserifyWatch() {
    dist = testDist;
    browserSync.init({ server: "../../", index: "index_b.html", port: 3080, browser: ["google-chrome"] });
    browserSync.watch('../../' + dist + '/index.js').on('change', browserSync.reload);  //change any file in appl/ to reload app - triggered on watchify results

    return browserSync;
}

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
function browserifyTest(cb) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    return runKarma(cb);
}
/**
 * Run watch(HMR)
 */
function browserifyHmr(cb) {
    // task(runHmr)
    log(chalk.cyan("Watching, will rebuild bundle on code change.\n"));
    return cb();
}
/**
 * Continuous testing - test driven development.  
 */
function browserifyTdd(cb) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    const serve = new Server({
        configFile: __dirname + '/karma.conf.js',
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if (typeof cb === "function") {
            cb();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
        else {
            process.exit(0);
        }
    }).start();
}
/**
 * Karma testing under Opera. -- needs configuation  
 */
function tddo(done) {

    global.whichBrowsers = ["Opera"];

    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
}

const testRun = series(vendorDevelopment, applicationDevelopment, copyTest, pat);
const prodRun = series(testRun, parallel(esLint, cssLint, bootLint), clean, applicationBuild, vendorBuild, copyProd, applicationExit);
const hmrRun = series(vendorDevelopment, applicationDevelopment, browserifyHmr);
const tddRun = series(/*vendorDevelopment, applicationDevelopment,*/ browserifyTdd);
const rebuildRun = series(vendorDevelopment, applicationDevelopment, applicationExit);

testRun.displayName = "testRun"
testRun.flags = { node_env: "development" };

prodRun.displayName = "prod"
prodRun.flags = { node_env: "production" }

hmrRun.displayName = 'hmr'
hmrRun.flags = { "isWatchify": "true" }

tddRun.displayName = 'tdd'
tddRun.flags = { "isWatchify": "true" }

tddRun.displayName = 'rebuild'

task(prodRun) // prod task
exports.default = prodRun
exports.test = series(testRun, applicationExit)
exports.hmr = hmrRun
exports.tdd = tddRun
exports.server = browserifyWatch
exports.rebuild = rebuildRun
exports.acceptance = browserifyTest
exports.development = parallel(browserifyWatch, hmrRun, tddRun)
exports.tddo = tddo

/*
    Build functions follow
*/
function browserifyBuild() {
    browserifyInited = browserify({
        debug: !isProduction,
        bundleExternal: true
    });

    var mods = getNPMPackageIds();
    for (var id in mods) {
        if (mods[id] !== 'font-awesome' && !mods[id].startsWith("can")) {
            browserifyInited.require(require('resolve').sync(mods[id]), { expose: mods[id] });
        }
    };

    if (isProduction) {
        const uglifyes = require('uglify-es');
        const composer = require('gulp-uglify/composer');
        const pump = require('pump');

        minify = composer(uglifyes, console);
    }

    var stream = browserifyInited.bundle()
        .pipe(source('vendor.js'))
        .pipe(buffer())
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(isProduction ? minify() : noop());

    stream = stream.pipe(sourcemaps.init({ loadMaps: !isProduction }))
        .pipe(sourcemaps.write('../../' + dist + '/maps', { addComment: !isProduction }));

    return stream.pipe(dest('../../' + dist));
}

function getNPMPackageIds() {
    var ids = JSON.parse('{' +
        '"aw": "font-awesome",' +
        '"bo": "bootstrap",' +
        '"cn": "can",' +
        '"dx": "dodex",' +
        '"jq": "jquery",' +
        '"lo": "lodash",' +
        '"md": "marked",' +
        '"mo": "moment",' +
        '"pd": "pdfjs-dist",' +
        '"po": "popper.js",' +
        '"tb": "tablesorter"}');
    return ids;
}

function applicationBuild() {
    browserifyInited = browserify({
        entries: ['../appl/index.js'],
        debug: !isProduction,
        transform: ["browserify-css"],
        insertGlobals: true,
        noParse: ['jquery'],
        cache: {},
        packageCache: {}
    });

    let modules = [];
    var mods = getNPMPackageIds();
    for (var id in modules) {
        if (mods[id] !== 'font-awesome' && !mods[id].startsWith("can")) {
            modules.push(mods[id]);
        }
    };

    if (isSplitBundle) {
        browserifyInited.external(modules);
    }
    enableWatchify();

    return browserifyApp();
}

/*
 * Build application bundle for production or development
 */
function browserifyApp() {
    if (isProduction && !minify) {
        const uglifyes = require('uglify-es');
        const composer = require('gulp-uglify/composer');
        const pump = require('pump');

        minify = composer(uglifyes, console);
    }
    var stream = browserifyInited
        .bundle()
        .pipe(source('index.js'))
        .pipe(removeCode({ production: isProduction }))
        .pipe(buffer())
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())  //Strip out Canjs warnings if production.
        .pipe(isProduction ? minify().on('error', log) : noop());

    stream = stream.pipe(sourcemaps.init({ loadMaps: !isProduction }))
        .pipe(sourcemaps.write('../../' + dist + '/maps', { addComment: !isProduction }));
        
    return stream.pipe(dest('../../' + dist));
}

function enableWatchify() {
    if (isWatchify) {
        browserifyInited.plugin(watchify);
        browserifyInited.on('update', applicationBuild);
        browserifyInited.on('log', log);
    }
}

function copySrc() {
    return src(['../appl/views/**/*', '../appl/templates/**/*', '../appl/dodex/data/**/*', isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'])
        .pipe(copy('../../' + dist + '/appl'));
}

function copyImages() {
    return src(['../images/*', '../../README.md'])
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
        else {
            return 
            // process.exit(0);
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
