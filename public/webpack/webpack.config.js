const path = require('path'),
        webpack = require('webpack'),
        CopyWebpackPlugin = require('copy-webpack-plugin'),
        HtmlWebpackPlugin = require('html-webpack-plugin'),
        ReloadPlugin = require('reload-html-webpack-plugin'),
        ExtractTextPlugin = require('extract-text-webpack-plugin');

var isProduction = process.env.NODE_ENV === 'production' || process.argv.slice(-1)[0] == '-p',
        excludeUglify = isProduction ? /\.min\.js$/ : /\.js$/,
        cssUse = ['style-loader', 'css-loader'],
        useHot = process.env.USE_HMR === 'true',
        isWatch = process.env.USE_WATCH === 'true',
        devPublicPath = process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : '/dist_test/webpack/';

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
    entry: [path.resolve(__dirname, './appl/index.js')],
    target: 'web',
    devServer: {
        host: "localhost",
        port: 3080
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, isProduction ? "./../dist/webpack" : './../dist_test/webpack'),
        publicPath: isProduction ? "/dist/webpack/" : devPublicPath,
        libraryTarget: "umd"
    },
    module: {
        rules: [
            setJsRules(isProduction),
            setCanJsRules(isProduction),
            {
                test: /.css$/,
                use: cssUse
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
                test: /\.json$/,
                use: "json-loader"
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
            disable: false,
            allChunks: true
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Popper: ['popper.js', 'default']
        }),
        new CopyWebpackPlugin([
            {from: './images/favicon.ico', to: 'images'},
            {from: isProduction ? './appl/testapp.html' : './appl/testapp_dev.html', to: 'appl'},
            {from: './../README.md', to: ''},
            {from: {
                    glob: './appl/views/**/*',
                    dot: false
                },
                to: ''},
            {from: {
                    glob: './appl/templates/**/*',
                    dot: false
                },
                to: ''}
        ])
    ],
    devtool: 'inline-source-map',
    watch: isWatch,
    watchOptions: {
        ignored: /node_modules/
    }
};

if (!isProduction && useHot) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new ReloadPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]);
}

if (isProduction) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            exclude: /\/node_modules/
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ]);
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
        test: /can.*\.js$/,
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