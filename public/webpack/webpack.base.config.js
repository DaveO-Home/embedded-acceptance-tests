const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

let isProduction = false;
const excludeUglify = isProduction ? /\.min\.js$/ : /\.js$/;
const devPublicPath = process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : "/dist_test/webpack/";
const version = Number(process.env.W_VERSION)

let pathsToClean = [
    isProduction ? "dist/webpack" : "dist_test/webpack"
]

let cleanOptions = {
    root: path.resolve(__dirname, "../"),
    verbose: false,
    dry: false
}

module.exports = (argv) => {
    isProduction = argv.mode === "production";
    return {
        mode: argv.mode,
        resolveLoader: {
            alias: {
                "strip-custom-loader": path.join(__dirname, "appl/js/utils/strip-custom-loader")
            }
        },
        resolve: {
            symlinks: false,
            cacheWithContext: false,
            alias: {
                awesomecss: "font-awesome/css/font-awesome.css",
                bootcss: "bootstrap/dist/css/bootstrap.min.css",
                pagercss: "tablesorter/dist/css/jquery.tablesorter.pager.min.css",
                sitecss: "css/site.css",
                sortercss: "tablesorter/dist/css/theme.blue.min.css",
                dodexcss: path.resolve(__dirname, "../node_modules/dodex/dist/dodex.min.css"),
                jsoneditcss: path.resolve(__dirname, "../node_modules/jsoneditor/dist/jsoneditor.min.css"),
                dodex: "dodex/dodex",
                app: resolve("./appl/js/app.js"),
                basecontrol: "js/utils/base.control",
                config: "js/config",
                default: "js/utils/default",
                helpers: "js/utils/helpers",
                menu: "js/utils/menu",
                pdf: "js/controller/pdf",
                router: "js/router",
                start: "js/controller/start",
                setup: "js/utils/setup",
                table: "js/controller/table",
                tablepager: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
                tablewidgets: "tablesorter/dist/js/jquery.tablesorter.widgets.min.js",
                apptests: path.resolve(__dirname, "tests/apptest"),
                contacttests: path.resolve(__dirname, "tests/contacttest"),
                domtests: path.resolve(__dirname, "tests/domtest"),
                logintests: path.resolve(__dirname, "tests/logintest"),
                routertests: path.resolve(__dirname, "tests/routertest"),
                toolstests: path.resolve(__dirname, "tests/toolstest"),
                dodextests: path.resolve(__dirname, "tests/dodextest"),
                inputtests: path.resolve(__dirname, "tests/inputtest"),
                awesall: "@fortawesome/fontawesome-free/js/all.js",
                awesfree: "@fortawesome/fontawesome-free/js/fontawesome.js"
            },
            modules: [
                path.resolve("./"),
                path.resolve("./../node_modules"),
                "node_modules",
                "appl"
            ]
        },
        context: path.resolve(__dirname, "./"),
        entry: {
            main: "./appl/index.js"
        },
        target: "web",
        output: {
            filename: isProduction ? "[name].[chunkhash].js" : "[name].bundle.js",
            chunkFilename: isProduction ? "chunk.[chunkhash].js" : "[name].chunk.js",
            path: path.resolve(__dirname, isProduction ? "./../dist/webpack" : "./../dist_test/webpack"),
            publicPath: isProduction ? "/dist/webpack/" : devPublicPath
        },
        module: {
            rules: [
                setJsRules(isProduction),
                setCanJsRules(isProduction),
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "sass-loader"
                        }
                    ],
                    type: "javascript/auto"
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    type: "asset"
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    generator: {
                        filename: "appl/fonts/[name][hash:7][ext]"
                    },
                    type: "asset"
                },
                {
                    test: /\.stache$/,
                    type: "asset/source"
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                },
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: isProduction ? '"production"' : '"development"',
                    PUBLIC_PATH: '""'
                }
            }),
            new CleanWebpackPlugin(cleanOptions),
            new MiniCssExtractPlugin({
                filename: !isProduction
                    ? "main.css" : "[name].[contenthash].css",
                chunkFilename: !isProduction
                    ? "[name].[id].css" : "[name].[id].[contenthash].css"
            }),
            new webpack.ProvidePlugin({
                createPopper: ["@popperjs/core", "createPopper"]
            }),
            new CopyWebpackPlugin(
                addPatterns()
            ),
        ],
        devtool: isProduction ? "cheap-module-source-map" : "inline-source-map",
    }
};

// setSideEffects(version)

function setJsRules(isProduction) {
    var rules = {
        test: /\.js$/,
        exclude: /(node_modules|unit_\test*\.js)/
    }

    if (isProduction) {
        rules.enforce = "pre";
        rules.use = [
            {
                loader: "webpack-strip-block",
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
    }

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

function addPatterns() {
    var patterns =
    {
        patterns: [
            { from: "./images/*", to: "" },
            { from: "../README.md", to: "../" },
            {
                from: "./appl/views/**/*",
                globOptions: {
                    dot: false
                },
                to: ""
            },
            {
                from: "./appl/templates/**/*",
                globOptions: {
                    dot: false
                },
                to: ""
            },
            {
                from: "./appl/dodex/**/*",
                globOptions: {
                    dot: false
                },
                to: ""
            }
        ]
    }
    if (!isProduction) {
        patterns.patterns.push({ from: "./appl/testapp_dev.html", to: "appl" });
        patterns.patterns.push({ from: "./appl/app_bootstrap.html", to: "appl" });
    }
    return patterns;
}

function resolve(dir) {
    return path.join(__dirname, ".", dir);
}

function setSideEffects(version) {
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
