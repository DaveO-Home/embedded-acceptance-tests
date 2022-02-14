const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.config");

const isProduction = false;
const useHot = process.env.USE_HMR === "true";
const isWatch = process.env.USE_WATCH === "true";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "3080";

const devWebpackConfig = merge(baseWebpackConfig({
    mode: "development",
    dist: path.resolve(__dirname, "../dist_test/webpack/"),
    watch: false
}), {
    watch: isWatch,
    watchOptions: {
        ignored: /node_modules/
    },
    devServer: {
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: path.join("/dist_test/webpack/", "index.html") }
            ]
        },
        compress: false,
        host: HOST,
        port: PORT,
        open: false,
        devMiddleware: {
            index: true,
            // mimeTypes: { "text/plain": ["md"] },
            publicPath: "/dist_test/webpack/",
            serverSideRender: false,
            writeToDisk: false,
        },
        client: {
            logging: "info",
            overlay: {
                errors: true,
                warnings: false,
            },
            overlay: true,
            progress: true,
        },
        static: {
            directory: path.resolve(__dirname, "../dist_test"),
            staticOptions: {},
            publicPath: ["/dist_test/"],
            // serveIndex: true,
            // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
            watch: true,
        },
        allowedHosts: "all",
        proxy: {},
    },
    performance: {
        hints: useHot ? false : "warning", // enum
        // hints: "error", // emit errors for perf hints
        // hints: false // turn off perf hints
    },
    stats: isProduction ? false : false, // minimal, none, normal, verbose, errors-only
    cache: isProduction ? true : false,
});

module.exports = devWebpackConfig;