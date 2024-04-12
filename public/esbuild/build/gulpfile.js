
/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
 const esbuild = require("esbuild");
 const { src, dest, series, parallel, task } = require("gulp");
 const karma = require("karma");
 const eslint = require("gulp-eslint");
 const csslint = require("gulp-csslint");
 const exec = require("child_process").exec;
 const copy = require("gulp-copy");
 const log = require("fancy-log");
 const flatten = require("gulp-flatten");
 const chalk = require("chalk");
 const browserSync = require("browser-sync");
 const path = require("path");

 let lintCount = 0;
 let isProduction = process.env.NODE_ENV == "production";
 let browsers = process.env.USE_BROWSERS;
 let bundleTest = process.env.USE_BUNDLER;
 let testDist = "dist_test/esbuild";
 let prodDist = "dist/esbuild";
 let dist = isProduction ? prodDist : testDist;

 if (browsers) {
     global.whichBrowsers = browsers.split(",");
 }
 /**
  * Build Development bundle from package.json 
  */
 const build_development = function (cb) {
     return esbuildBuild(cb);
 };
 /**
  * Production Esbuild
  */
 const build = function (cb) {
     process.env.NODE_ENV = "production";
     isProduction = true;
     esbuildBuild(cb).then(function () {
         cb();
     });
 };
 /**
  * Default: Production Acceptance Tests 
  */
 const pat = function (done) {
     if (!browsers) {
         global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
     }
     return karmaServer(done, true, false);
 };
 /*
  * javascript linter
  */
 const esLint = function (cb) {
     dist = prodDist;
     var stream = src(["../appl/**/*.js"])
         .pipe(eslint({}))
         .pipe(eslint.format())
         .pipe(eslint.result(() => {
             // Keeping track of # of javascript files linted.
             lintCount++;
         }))
         .pipe(eslint.failAfterError());
 
     stream.on("error", () => {
         process.exit(1);
     });
 
     return stream.on("end", () => {
         log(chalk.cyan.bold("# javascript files linted: " + lintCount));
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
 
     stream.on("error", () => {
         process.exit(1);
     });
     return stream.on("end", () => {
         cb();
     });
 };
 /*
  * Bootstrap html linter 
  */
 const bootLint = function (cb) {
     return exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
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
     dist = prodDist;
     return import("del").then(del => {
         del.deleteSync([
                  "../../" + prodDist + "/**/*"
              ], { dryRun: false, force: true });
         done();
     });
 };
 
 const cleant = function (done) {
     let dryRun = false;
     if (bundleTest && bundleTest === "false") {
         dryRun = true;
     }
     isProduction = false;
     dist = testDist;
     return import("del").then(del => {
        del.deleteSync([
                 "../../" + testDist + "/**/*"
             ], { dryRun: dryRun, force: true });
        done();
     });
 };
 /**
  * Resources and content copied to dist directory - for production
  */
 const copyprod = function () {
     return copySrc();
 };
 
 const copyprod_images = function () {
     isProduction = true;
     dist = prodDist;
     return copyImages();
 };
 /**
  * Resources and content copied to dist_test directory - for development
  */
 const copy_test = function () {
     return copySrc();
 };
 
 const copy_images = function () {
     isProduction = false;
     dist = testDist;
     return copyImages();
 };
 /**
  * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
  */
 const e_test = function (done) {
     if (!browsers) {
         global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
     }
     karmaServer(done, true, false);
 };
 /**
  * Continuous testing - test driven development.  
  */
 const tdd_esbuild = function (done) {
     if (!browsers) {
         global.whichBrowsers = ["Chrome", "Firefox"];
     }
     karmaServer(done, false, true);
 };
 /**
  * Karma testing under Opera. -- needs configuation  
  */
 const tddo = function (done) {
     if (!browsers) {
         global.whichBrowsers = ["Opera"];
     }
     karmaServer(done, false, true);
 };
 /**
  * Using BrowserSync Middleware for HMR  
  */
 const sync = function () {
     const server = browserSync.create("devl");
     dist = testDist;
     const dir = path.join("../../", dist, "/");
 
     server.init({
         server: {
             baseDir: dir,
             index: "appl/testapp_dev.html",
         },
         serveStatic: [path.join(".", dir, "/appl")],
         port: 3080,
         // browser: ["google-chrome"] 
     });
 
     server.watch(path.join(dir, "**/*.*")).on("change", (file) => {
         log("Starting reload: " + file);
         server.reload();  // change any file in dist_test/esbuild/ to reload app - triggered on watchify results
     });
     return server;
 };
 
 const watch = function () {
     const server = browserSync.create("esbuild");
     dist = testDist;
 
     server.watch(["../appl/**/*.js", "../appl/**/*.jsx"]).on("change", (file) => {
         log("Building bundle with: " + file);
         build_development();
     });
     return server;
 };
 
 const runTestCopy = parallel(copy_test, copy_images);
 const runTest = series(cleant, runTestCopy, build_development);
 const runTestNoBuild = series(cleant, runTestCopy);
 const runProdCopy = parallel(copyprod, copyprod_images);
 const runProd = series(runTest, pat, esLint, parallel(cssLint /* , bootLint*/), clean, runProdCopy, build);
 runProd.displayName = "prod";
 
 exports.build = series(clean, runProdCopy, build);
 task(runProd);
 task("default", runProd);
 exports.prd = series(clean, runProdCopy, build);
 exports.test = series(runTest, pat);
 exports.tdd = series(runTest, tdd_esbuild);
 exports.hmr = series(runTestCopy, parallel(sync, watch));
 exports.acceptance = e_test;
 exports.rebuild = parallel(runTestNoBuild, build_development);
 exports.build = parallel(runTestCopy, build_development);
 exports.lint = parallel(esLint, cssLint /* , bootLint*/);
 exports.copy = runTestCopy;
 exports.tddo = tddo;
 exports.devlserver = devlServer;
 
 // this is basically worthless - use the hmr task
 async function devlServer() {
     runTestCopy();

     let ctx = await esbuild.context({
       entryPoints: ["../appl/index"],
       outdir: path.join("../../", dist, ""),
       bundle: true,
       define: {
            "process.env.NODE_ENV": isProduction ? "\"production\"" : "\"development\"",
       },
       loader: {
           ".png": "file",
           ".svg": "file",
           ".jpg": "file",
           ".eot": "dataurl",
           ".woff": "dataurl",
           ".woff2": "dataurl",
           ".tff": "dataurl",
           ".html": "file"
       },
       external: ["fsevents", "fs"],
     })

     await ctx.rebuild();
     await ctx.watch();

     let { host, port } = await ctx.serve({
       servedir: "../../" + dist,
     })

     console.log("Development Server On:", host+":"+port, "--",dist)
 }
 
 const startComment = "develblock:start",
     endComment = "develblock:end",
     regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
         startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
         endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
 
 let stripCodePlugin = {
     name: "strip",
     setup(build) {
         let fs = require("fs");
 
         build.onLoad({ filter: /^.*esbuild.*\.(js|jsx)$/ }, async (args) => {
             let module = await fs.promises.readFile(args.path, "utf8");
 
             return {
                 contents: module.replace(regexPattern, ""),
                 loader: "js"
             };
         });
     },
 };
 
 async function esbuildBuild(cb) {
     if (bundleTest && bundleTest === "false") {
         return cb();
     }
     dist = isProduction ? prodDist : testDist;
     const options = {
         entryPoints: ["../appl/index"],
         resolveExtensions: [".jsx", ".js", ".css", ".json"],
         bundle: true,
         outfile: path.join("../../", dist, "/index.js"),
         platform: "browser",
         format: "iife",
         splitting: false,
         loader: {
             ".png": "file",
             ".svg": "file",
             ".jpg": "file",
             ".eot": "dataurl",
             ".woff": "dataurl",
             ".woff2": "dataurl",
             ".ttf": "dataurl"
         },
         define: {
             "process.env.NODE_ENV": isProduction ? "\"production\"" : "\"development\"",
         },
         external: ["fsevents", "fs"],
         sourcemap: isProduction? true: false,
         minify: isProduction ? false : false, // this corrupts canjs??
     };
     if (isProduction) {
         options.plugins = [stripCodePlugin];
     }
 
     await esbuild.build(options)
         .catch((e) => console.error(e));
 
     if (typeof cb === "function") {
         cb();
     }
 }
 
 function copySrc() {
     return src(["../appl/view*/**/*",
         "../appl/temp*/**/*",
         "../appl/css/site.css",
         isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html"])
         .pipe(flatten({ includeParents: -2 })
         .pipe(dest("../../" + dist + "/appl")));
 }
 
 function copyImages() {
     if (!isProduction) {
         src(["../../README.md"])
             .pipe(copy("../../" + dist + "/appl", { prefix: 1 }));
     }
     src(["../images/*"])
         .pipe(copy("../../" + dist + "../"));
     return src(["../images/*", "../../README.m*",  "../appl/dodex/**/*"])
         .pipe(copy("../../" + dist + "/appl"));
 }
 
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
                 console.log("Karma has exited with " + exitCode);
                 if(singleRun) {
                     done();
                 }
                 if(exitCode > 0) {
                     process.exit(exitCode);
                 }
             }).start();
         },
         (rejectReason) => { console.err(rejectReason); }
     );
 }
 
 // From Stack Overflow - Node (Gulp) process.stdout.write to file
 if (process.env.USE_LOGFILE == "true") {
     var fs = require("fs");
     var util = require("util");
     var logFile = fs.createWriteStream("log.txt", { flags: "w" });
     // Or "w" to truncate the file every time the process starts.
     var logStdout = process.stdout;
     /* eslint no-console: 0 */
     console.log = function () {
         logFile.write(util.format.apply(null, arguments) + "\n");
         logStdout.write(util.format.apply(null, arguments) + "\n");
     };
     console.error = console.log;
 }
 
