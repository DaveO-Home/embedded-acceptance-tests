/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint') -> 'boot' -> 'build'
 */

const gulp = require('gulp');
const Server = require('karma').Server;
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const log = require("fancy-log");
const env = require("gulp-env");
const copy = require('gulp-copy');
const chalk = require('chalk');

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
gulp.task('pat', ['accept'], function (done) { //, ['accept']
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
});
/*
 * javascript linter
 */
gulp.task('eslint', ['pat'], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
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
});
/*
 * css linter
 */
gulp.task('csslint', ['pat'], function () {
    var stream = gulp.src(['../appl/css/site.css'
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    });
});

/*
 * Build the application to run karma acceptance tests
 */
gulp.task('accept', function (cb) {
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
});

/*
 * Build the application to the production distribution 
 */
gulp.task('build', ['boot'], function (cb) { // ['boot'],
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
});

/*
 * Bootstrap html linter 
 */
gulp.task('boot', ['eslint', 'csslint'], function (cb) {
    exec('gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {

        log(stdout);
        log(stderr);

        cb(err);
    });
});
/*
 * Build the application to run karma acceptance tests with hmr
 */
gulp.task('fusebox-hmr', function (cb) {
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
});
/*
 * Build the application to run node express so font-awesome is resolved
 */
gulp.task('fusebox-rebuild', function (cb) {
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
});
/**
 * Run karma/jasmine tests once and exit
 */
gulp.task('fb-test', function (done) {
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
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task('fusebox-tdd', function (done) { //,['accept']
    initialTask = this.seq.slice(-1)[0];

    if (!browsers) {
        global.whichBrowser = ['Chrome', 'Firefox'];
    }

    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});

/**
 * Karma testing under Opera. -- needs configuation  
 */
gulp.task('tddo', function (done) {
    if (!browsers) {
        global.whichBrowser = ['Opera'];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});

/**
 * Resources and content copied to dist_test directory - for development
 */
gulp.task('copy', ['copy_images'], function () {
    return copySrc();
});
gulp.task('copy_images', function () {
    return copyImages();
});

gulp.task('default', ['pat', 'eslint', 'csslint', 'boot', 'build']);
gulp.task('prod', ['pat', 'eslint', 'csslint', 'boot', 'build']);
gulp.task('test', ['pat']);
gulp.task('tdd', ['fusebox-tdd']);
gulp.task('hmr', ['fusebox-hmr']);
gulp.task('rebuild', ['fusebox-rebuild']);   //remove karma config to run node express
gulp.task('acceptance', ['accept']);

function copySrc() {
    return gulp
            .src(['../appl/views/**/*', '../appl/templates/**/*', isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'])
            .pipe(copy('../../' + dist + '/appl'));
}

function copyImages() {
    return gulp
            .src(['../images/*', '../../README.md'])
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
