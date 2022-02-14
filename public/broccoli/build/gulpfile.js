/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'rebuild test' -> acceptance-tests -> ('eslint', 'csslint') -> 'boot' -> 'build'
 */
const packageDep = require("./package.json");
let version = Number(/\d/.exec(packageDep.devDependencies.webpack)[0]);

const { series, parallel, task, src, dest } = require("gulp");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const karma = require("karma");
const path = require("path");
const chalk = require("chalk");

const isWindows = /^win/.test(process.platform);
let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowser = browsers.split(",");
}

var fs = require("fs");
if (!fs.existsSync("./node_modules")) {
    log(chalk.cyan("Make sure you run 'npm install' in build directory before running tests"));
    process.exit(1);
}

/*
 * javascript linter
 */
const esLint = function (done) {
    var stream = src(["../appl/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js",
            quiet: 1,
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function () {
        process.exit(1);
    });
    return stream.on("end", function () {
        log(chalk.blue.bold("# javascript files linted: " + lintCount));
        done();
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
        cb();
        process.exit(1);
    });
    return stream.on("end", function () {
        cb();
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    var osCommands = "export W_VERSION=\"" + version + "\"; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ";

    if (isWindows) {
        osCommands = "set W_VERSION=\"" + version + "\" &  set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ";
    }
    log(chalk.cyan("Building Production - please wait......"));
    let cmd = exec(osCommands + "npm run brocp");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0) {
            log(data);
        }
    });
    return cmd.on("exit", (code) => {
        cb();
        if (code > 0) {
            log(chalk.red("Production build failed:" + code));
        } else {
            copySvg("dist");
            log(chalk.green("Production build a success"));
        }
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    return exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green("Bootstrap linting a success"));
        }
        cb();
    });
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const broc_watch = function (cb) {
    var osCommands = "export W_VERSION=\"" + version + "\"; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ";

    if (isWindows) {
        osCommands = "set W_VERSION=\"" + version + "\" & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ";
    }
    log(chalk.cyan("Re-building Development - please wait......"));
    let cmd = exec(osCommands + "npm run brocw");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        copySvg("dist_test");
        cb();
        log(chalk.cyan(`Test build exited with code ${code}`));
    });
};
/*
 * Build the application to run node express so font-awesome is resolved
 */
const broc_rebuild = function (cb) {
    
    var osCommands = "export W_VERSION=\"" + version + "\"; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ";

    if (isWindows) {
        osCommands = "set W_VERSION=\"" + version + "\" & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ";
    }
    log(chalk.cyan("Re-building Development - please wait......"));
    let cmd = exec(osCommands + "npm run broct");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        copySvg("dist_test");
        cb();
        log(chalk.cyan(`Test build exited with code ${code}`));
    });
};
/**
 * Continuous testing - test driven development.  
 */
const broc_tdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const broc_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
};

const prodRun = series(broc_rebuild, broc_test, parallel(esLint, cssLint/*, bootLint*/), build);
prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.test = series(broc_rebuild, broc_test);
exports.tdd = series(broc_rebuild, broc_tdd);
exports.watch = broc_watch;
exports.rebuild = broc_rebuild;
exports.acceptance = broc_rebuild;
exports.development = parallel(broc_watch, broc_tdd);
exports.lint = parallel(cssLint,/* bootLint,*/ esLint);

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve(__dirname + "/karma.conf.js"),
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

function copySvg(dist) {
    return src(["../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg"])
        .pipe(dest("../../" +  dist + "/broccoli/appl/css/img"));
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
