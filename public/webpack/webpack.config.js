const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReloadPlugin = require('reload-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.slice(-1)[0] == '-p';
const excludeUglify = isProduction ? /\.min\.js$/ : /\.js$/;
const useHot = process.env.USE_HMR === 'true';
const isWatch = process.env.USE_WATCH === 'true';
const devPublicPath = process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : '/dist_test/webpack/';
const version = Number(process.env.W_VERSION)

let pathsToClean = [
    isProduction ? 'dist/webpack' : 'dist_test/webpack'
]

// the clean options to use
let cleanOptions = {
    root: path.resolve(__dirname, '../'),
    verbose: true,
    dry: false
}

module.exports = {
    node: {
        fs: "empty"
    },
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
            app: "js/app.js",
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
            toolstests: path.resolve(__dirname, "tests/toolstest")
        },
        modules: [
            path.resolve('./'),
            path.resolve("./../node_modules"),
            "node_modules",
            "appl"
        ]
    },
    context: path.resolve(__dirname, "./"),
    entry: {
        main: './appl/index.js'
    },
    target: 'web',
    devServer: {
        host: "localhost",
        port: 3080,
        //        noInfo: true,
        //        https: false,
        //        hot: true,
        //        historyApiFallback: true,
        //        compress: false,
        //        contentBase: '../'
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        path: path.resolve(__dirname, isProduction ? "./../dist/webpack" : './../dist_test/webpack'),
        publicPath: isProduction ? "/dist/webpack/" : devPublicPath
    },
    module: {
        rules: [
            setJsRules(isProduction),
            setCanJsRules(isProduction),
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: 'url?limit=10000&name=images/[name].[ext]'
            },
            {
                test: /\.(html|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.stache$/,
                use: "raw-loader"
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            setJsonLoader(version)
        ]
    },
    plugins: [
        new CleanWebpackPlugin(pathsToClean, cleanOptions),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            Popper: ['popper.js', 'default']
        }),
        new CopyWebpackPlugin([
            { from: './images/favicon.ico', to: 'images' },
            { from: isProduction ? './appl/testapp.html' : './appl/testapp_dev.html', to: 'appl' },
            { from: isProduction ? './appl/testapp.html' : './appl/app_bootstrap.html', to: 'appl' },
            { from: '../README.md', to: '../' },
            {
                from: {
                    glob: './appl/views/**/*',
                    dot: false
                },
                to: ''
            },
            {
                from: {
                    glob: './appl/templates/**/*',
                    dot: false
                },
                to: ''
            }
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isProduction ? '"production"' : '"development"'
            }
        })
    ],
    devtool: isProduction ? '' : 'inline-source-map',
    watch: isWatch,
    watchOptions: {
        ignored: /node_modules/
    }
};

if (version >= 4) {
    module.exports.performance = {
        hints: "warning", // enum
        // hints: "error", // emit errors for perf hints
        // hints: false // turn off perf hints
    }
    module.exports.stats = isProduction ? "normal" : false // minimal, none, normal, verbose, errors-only
    module.exports.mode = isProduction ? 'production' : 'development'
    module.cache = isProduction ? true : false
    //    setSideEffects(version)
} else {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
            disable: false,
            allChunks: true
        })
    ]);
}

if (!isProduction && useHot) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]);
    if (version < 4) {
        module.exports.plugins = (module.exports.plugins || []).concat([
            new ReloadPlugin()
        ]);
    }
}

if (isProduction) {
    if (version >= 4) {
        module.exports.plugins = (module.exports.plugins || []).concat([
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
                maxInitialRequests: 5,
                maxAsyncRequests: 7,
            })
        ]);
    } else {
        module.exports.plugins = (module.exports.plugins || []).concat([
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: false,
                uglifyOptions: {
                    compress: {
                        warnings: false
                    }
                },
                exclude: /\/node_modules/
            })
        ]);
    }
}

function setJsRules(isProduction) {
    var rules = {
        test: /\.js$/,
        exclude: /(node_modules|unit_\test*\.js)/
    }

    if (isProduction) {
        rules.enforce = 'pre';
        rules.use = [
            {
                loader: "strip-custom-loader", //'webpack-strip-block',
                options: {
                    start: 'develblock:start',
                    end: 'develblock:end'
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
        rules.enforce = 'pre';
        rules.use = [
            {
                loader: "strip-custom-loader",
                options: {
                    start: 'steal-remove-start',
                    end: 'steal-remove-end'
                }
            }
        ];
    }

    return rules;
}

function setJsonLoader(version) {
    let rules = {}

    if (version < 4) {
        rules = {
            test: /\.json$/,
            use: "json-loader"
        }
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
