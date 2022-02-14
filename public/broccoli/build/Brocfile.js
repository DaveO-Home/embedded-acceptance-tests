const mergeTrees = require("broccoli-merge-trees");
const funnel = require("broccoli-funnel");
const concat = require("broccoli-concat");
//const env = require('broccoli-env').getEnv();
const uglify = require("broccoli-uglify-sourcemap");
const WebpackWriter = require("broccoli-webpack");

const isProduction = process.env.NODE_ENV === "production";
const isWatch = process.env.USE_WATCH === "true";
const isHMR = process.env.USE_HMR === "true";

let srcDir = ".";
let scriptTree;
const lib = "broccoli/appl";

scriptTree = new WebpackWriter([srcDir],
    require("./webpack.config")
);

const assets = funnel("../", {
    files: [isProduction ? "./appl/testapp.html" : "./appl/testapp_dev.html",
        "./appl/css", "./appl/views", "./appl/templates", "./images", "../README.md", "./appl/dodex"],
    destDir: "/"
});

const vendorCss = concat("../..", {
    inputFiles: [
        "node_modules/bootstrap/dist/css/bootstrap.min.css",
        "node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css",
        "node_modules/tablesorter/dist/css/theme.blue.min.css",
        "node_modules/jsoneditor/dist/jsoneditor.min.css",
        "node_modules/dodex/dist/dodex.min.css"],
    outputFile: "appl/css/vendor.css"
});

scriptTree = isProduction ? uglify(scriptTree, {
    exclude: ["node_modules/**/*min*.js"], // array of globs, to not minify
    uglify: {
        mangle: isProduction, // defaults to true
        compress: false, // defaults to true
        sourceMap: !isProduction, // defaults to true
    },
    async: true, // run uglify in parallel, defaults to false
    concurrency: 3 // number of parallel workers, defaults to number of CPUs - 1
}) : scriptTree;

const mergedTrees = mergeTrees([assets, scriptTree, vendorCss]);

module.exports = mergedTrees;
