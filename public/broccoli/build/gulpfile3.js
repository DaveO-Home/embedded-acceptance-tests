/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'rebuild test' -> acceptance-tests -> ('eslint', 'csslint') -> 'boot' -> 'build'
 */
const packageDep = require("./package.json");
let version = Number(/\d/.exec(packageDep.devDependencies.webpack)[0]);
//const { spawn } = require('child_process');

const csslint = require("gulp-csslint");
const env = require("gulp-env");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const gulp = require("gulp");
const log = require("fancy-log");
const Server = require("karma").Server;
const chalk = require("chalk");

const isWindows = /^win/.test(process.platform);
let lintCount = 0;
let isProduction = false;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowser = browsers.split(",");
}
/**
 * Default: Production Acceptance Tests 
 */
gulp.task("pat", ["broc-test"], function (done) {
    done();
});
/*
 * javascript linter
 */
gulp.task("eslint", ["pat"], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
            .pipe(eslint({
                configFile: "eslintConf.json",
                quiet: 1,
            }))
            .pipe(eslint.format())
            .pipe(eslint.result(result => {
                //Keeping track of # of javascript files linted.
                lintCount++;
            }))
            .pipe(eslint.failAfterError());

    stream.on("end", function () {
        log(chalk.cyan("# javascript files linted: " + lintCount));
    });
    stream.on("error", function () {
        process.exit(1);
    });
    return stream;
});
/*
 * css linter
 */
gulp.task("csslint", ["pat"], function () {
    var stream = gulp.src(["../appl/css/site.css"
    ])
            .pipe(csslint())
            .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
});
/*
 * Build the application to the production distribution 
 */
gulp.task("build", ["boot", "setVersion"], function (cb) { // ['boot'],
    var osCommands = "cd ../..; export W_VERSION=\"" + version + "\"; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ";

    if (isWindows) {
        osCommands = "cd ..\\..\\ & set W_VERSION=\"" + version + "\" &  set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ";
    }
    log(chalk.cyan("Building Production - please wait......"));
    let cmd = exec(osCommands + "npm run brocp");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0) {
            console.log(data);
        }
    });
    return cmd.on("exit", (code) => {
        cb();
        if (code > 0) {
            log(chalk.red("Production build failed:" + code));
        } else {
            log(chalk.green("Production build a success"));
        }
    });
});
/*
 * Bootstrap html linter 
 */
gulp.task("boot", ["eslint", "csslint"], function (cb) {
    return exec("gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green("Bootstrap linting a success"));
        }
        cb();
    });
});
/*
 * Build the application to run karma acceptance tests with hmr
 */
gulp.task("broc-watch", function (cb) {
    cb();
    return log(chalk.cyan("Please cd to the public directory and execute; npm run brocw"));
});
/*
 * Build the application to run node express so font-awesome is resolved
 */
gulp.task("broc-rebuild", ["setVersion"], function (cb) {
    // var osCommands = 'cd ../..; export W_VERSION="' + version + '"; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ';
    var osCommands = "export W_VERSION=\"" + version + "\"; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ";

    if (isWindows) {
        // osCommands = 'cd ..\\..\\ & set W_VERSION="' + version + '" & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ';
        osCommands = "set W_VERSION=\"" + version + "\" & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ";
    }
    log(chalk.cyan("Re-building Development - please wait......"));
    let cmd = exec(osCommands + "npm run broct");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            console.log(data.trim());
    });
    return cmd.on("exit", (code) => {
        cb();
        log(chalk.cyan(`Test build exited with code ${code}`));
    });
});
/**
 * Continuous testing - test driven development.  
 */
gulp.task("broc-tdd", ["broc-rebuild"], function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }
    runKarma("continuous", done);
});
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("broc-test", ["broc-rebuild"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runKarma("single", done);
});
/*
 * Extract Current Webpack Version
 */
gulp.task("setVersion", function () {
    return version; 
});

gulp.task("default", ["pat", "eslint", "csslint", "boot", "build"]);
gulp.task("test", ["broc-test"]);
gulp.task("tdd", ["broc-tdd"]);
gulp.task("watch", ["broc-watch"]);
gulp.task("rebuild", ["broc-rebuild"]);
gulp.task("acceptance", ["pat"]);

function runKarma(single, done) {
    new Server({
        configFile: __dirname + "/karma_conf.js",
        singleRun: single === "single"
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
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
