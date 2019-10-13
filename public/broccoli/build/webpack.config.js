const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const packageDep = require("./package.json");

const isProduction = process.env.NODE_ENV === "production" || process.argv.slice(-1)[0] == "-p";
const useHot = process.env.USE_HMR === "true";
const isWatch = process.env.USE_WATCH === "true";
const devPublicPath = process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : "/dist_test/webpack/";
let version = Number(/\d/.exec(packageDep.devDependencies.webpack)[0]);

if(process.env.W_VERSION) {
     version = Number(process.env.W_VERSION.substring(0, process.env.W_VERSION.lastIndexOf(".")));
}

let pathsToClean = [
    isProduction ? "dist/broccoli" : "dist_test/broccoli"
];
// the clean options to use
let cleanOptions = {
    root: path.resolve(__dirname, "../.."),
    verbose: true,
    dry: false
};

let webpackConfig = {
    node: {
        fs: "empty"
    },
    resolveLoader: {
        alias: {
            "strip-custom-loader": path.join(__dirname, "../appl/js/utils/strip-custom-loader")
        }
    },
    resolve: {
        symlinks: false,
        cacheWithContext: false,
        modules: [
            path.resolve("./"),
            path.resolve("./node_modules"),
            "./node_modules",
            "../appl"
        ]
    },
    context: path.resolve(__dirname, "../"),
    entry: {
        main: "../appl/index.js"
    },
    target: "web",
    output: {
        filename: "app.js",
        chunkFilename: "[name].chunk.js",
        path: path.resolve(__dirname, isProduction ? "./dist/broccoli" : "./dist_test/broccoli"),
        publicPath: isProduction ? "/dist/broccoli/" : devPublicPath
    },
    module: {
        rules: [
            setJsRules(isProduction),
            setCanJsRules(isProduction),
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            setJsonLoader(version)
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            Popper: ["popper.js", "default"]
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: isProduction ? "\"production\"" : "\"development\""
            }
        })
    ],
    devtool: isProduction ? "" : "inline-source-map",
    watch: isWatch,
    watchOptions: {
        ignored: /node_modules/
    }
};

if(!isWatch) {
    webpackConfig.plugins.push(new CleanWebpackPlugin(pathsToClean, cleanOptions));
}

module.exports = webpackConfig;

function setJsRules(isProduction) {
    var rules = {
        test: /\.js$/,
        exclude: /(node_modules|unit_\test*\.js)/
    };

    if (isProduction) {
        rules.enforce = "pre";
        rules.use = [
            {
                loader: "strip-custom-loader", //'webpack-strip-block',
                options: {
                    start: "develblock:start",
                    end: "develblock:end"
                }
            }
        ];
    }
    return rules;
}

function setCanJsRules(isProduction) {
    var rules = {
        test: /can.*\.js$/
    };

    if (isProduction) {
        rules.enforce = "pre";
        rules.use = [
            {
                loader: "strip-custom-loader",
                options: {
                    start: "steal-remove-start",
                    end: "steal-remove-end"
                }
            }
        ];
    }
    return rules;
}

function setJsonLoader(version) {
    let rules = {};

    if (version < 4) {
        rules = {
            test: /\.json$/,
            use: "json-loader"
        };
    }
    return rules;
}

function setSideEffects(version) {
    if (version >= 4) {
        module.exports.module.rules.push(
                {
                    include: /node_modules/,
                    sideEffects: true
                });
        module.exports.module.rules.push(
                {
                    include: /appl\/css/,
                    sideEffects: true
                });
    }
}
