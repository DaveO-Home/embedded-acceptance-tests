const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const baseWebpackConfig = require("./webpack.base.config");
const isProduction = true;

const prodWebpackConfig = merge(baseWebpackConfig({
    mode: "production",
    dist: path.resolve(__dirname, "../dist_test/webpack/"),
    watch: false
}), {
    performance: {
        hints: "warning", // enum
        // hints: "error", // emit errors for perf hints
        // hints: false // turn off perf hints
    },
    stats: isProduction ? false : false, // minimal, none, normal, verbose, errors-only
    cache: isProduction ? true : false,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: "some",
                parallel: true,
            }),
        ],
        moduleIds: "deterministic",
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: "single",
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, "./../dist/webpack/appl/testapp.html"),
            template: "appl/testapp.html",
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false,
                removeAttributeQuotes: true
            },
            chunksSortMode: "auto" // "dependency"
        }),
        // new webpack.optimize.ModuleConcatenationPlugin(),
    ]
});

module.exports = prodWebpackConfig;