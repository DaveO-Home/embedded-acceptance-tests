/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint') -> 'boot' -> 'build'
 */
const csslint = require('gulp-csslint');
const env = require("gulp-env");
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const gulp = require('gulp');
const log = require("fancy-log");
const Server = require('karma').Server;
const chalk = require('chalk');

let lintCount = 0
let dist = "dist_test/brunch"
let isProduction = false
let browsers = process.env.USE_BROWSERS
if (browsers) {
    global.whichBrowser = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);
var initialTask;
/**
 * Default: Production Acceptance Tests 
 */
gulp.task('pat', function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }

    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ';
    }
    log(chalk.cyan('E2E Testing - please wait......'))

    let cmd = exec(osCommands + 'npm run bt');
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
        done()
        console.log(`Child exited with code ${code}`);
    });
});
/*
 * javascript linter
 */
gulp.task('eslint', ['pat'], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
            .pipe(eslint({
                configFile: 'eslintConf.json',
                quiet: 1,
            }))
            .pipe(eslint.format())
            .pipe(eslint.result(result => {
                //Keeping track of # of javascript files linted.
                lintCount++;
            }))
            .pipe(eslint.failAfterError());

    stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
    });
    stream.on('error', function () {
        process.exit(1);
    });
    return stream;
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
 * Build the application to the production distribution 
 */
gulp.task('build', ['boot'], function (cb) { // ['boot'],
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }
    log(chalk.cyan('Building Production - please wait......'))
    let cmd = exec(osCommands + 'npm run bp');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        log(chalk.red('Production build failed'))
        if (data && data.length > 0)
            console.log(data.trim())
        process.exit(1);
    });
    return cmd.on('exit', (code) => {
        cb()
        log(chalk.green('Production build a success: ' + code))
    });
});

/*
 * Bootstrap html linter 
 */
gulp.task('boot', ['eslint', 'csslint'], function (cb) {
    return exec('gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout)
        log(stderr)
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green('Bootstrap linting a success'))
        }
        cb()
    });
});
/*
 * Build the application to run karma acceptance tests with hmr
 */
gulp.task('brunch-watch', function (cb) {
    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ';
    }
    log(chalk.cyan('Watching for code changes....\n'));
    let cmd = exec(osCommands + 'npm run bw');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Watch exited with code ${code}`));
        cb()
    });
});
/*
 * Build the application to run node express so font-awesome is resolved
 */
gulp.task('brunch-rebuild', function (cb) {
    var osCommands = 'cd ../..; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ';
    }
    log(chalk.cyan('Re-building Development - please wait......'))
    let cmd = exec(osCommands + 'brunch build');
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
        cb()
        console.log(`Watch exited with code ${code}`);
    });
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task('brunch-tdd', function (done) { //,['accept']
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }

    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_TDD=true; export USE_KARMA=true; export USE_HMR=false; ';
    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_TDD=true; set USE_KARMA=true & set USE_HMR=false & ';
    }

    log(chalk.cyan('Test Driven Development - please wait......'))
    let cmd = exec(osCommands + 'npm run bt');
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
        done()
        console.log(`Test Driven Development exited with code ${code}`);
    });
});

gulp.task('default', ['pat', 'eslint', 'csslint', 'boot', 'build']);
gulp.task('test', ['pat']);
gulp.task('tdd', ['brunch-tdd']);
gulp.task('watch', ['brunch-watch']);
gulp.task('rebuild', ['brunch-rebuild']);
gulp.task('acceptance', ['pat']);

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
