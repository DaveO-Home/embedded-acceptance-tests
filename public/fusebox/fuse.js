var exec = require('child_process').exec;
var fs = require('fs');
const { FuseBox, QuantumPlugin, WebIndexPlugin, CSSPlugin, CSSResourcePlugin, UglifyESPlugin, EnvPlugin } = require("fuse-box"); //BabelPlugin, HMRPlugin
const BlockStripPlugin = require("./appl/js/plugin/BlockStrip").BlockStrip;
const CopyFsPlugin = require("./appl/js/plugin/CopyFs").CopyFs;
const aliases = {
    "apptest": "./jasmine/apptest.js",
    "contacttest": "./contacttest.js",
    "domtest": "./domtest.js",
    "logintest": "./logintest.js",
    "routertest": "./routertest.js",
    "toolstest": "./toolstest.js",
    "app": "~/js/app",
    "config": "~/js/config",
    "default": "~/js/utils/default",
    "helpers": "~/js/utils/helpers",
    "pager": "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
    "pdf": "~/js/controller/pdf",
    "router": "~/js/router",
    "setup": "~/js/utils/setup",
    "start": "~/js/controller/start",
    "table": "~/js/controller/table"
};
//let value = !process.env.NODE_ENV ? EnvPlugin({NODE_ENV: 'development', USE_KARMA: 'false'}) : null;
let isProduction = process.env.NODE_ENV === 'production';
let distDir = isProduction ? "../dist/fusebox" : "../dist_test/fusebox";
let isKarma = process.env.USE_KARMA === "true";
let useQuantum = false; // turned off Quantum for Canjs 5
let useHMR = process.env.USE_HMR === 'true';
let resources = (f) => (!isProduction && isKarma ? `/base/dist_test/fusebox/resources/${f}` : isProduction ? `../resources/${f}` : `/dist_test/fusebox/resources/${f}`);

var src = 'appl';
if (!isProduction && fs.existsSync('../.fusebox')) {
    exec('rm -r ../.fusebox');
}
const fuse = FuseBox.init({
    experimentalFeatures: false,
    useTypescriptCompiler: !isProduction,
    plugins: [
        WebIndexPlugin({
            template: isProduction ? "./appl/testapp.html" : "./appl/testapp_dev.html",
            target: isProduction ? "appl/testapp.html" : "appl/testapp_dev.html",
        }),
        isProduction && EnvPlugin({ NODE_ENV: "production" }),
        isProduction && useQuantum && QuantumPlugin({
            api: (core) => {
                core.solveComputed("moment/moment.js");
            },
            manifest: false
        }),
        ["node_modules/font-awesome/**.css",
            CSSResourcePlugin({
                dist: distDir + "/resources",
                resolve: resources
            }), CSSPlugin()],
        CSSPlugin(),
        CopyFsPlugin({
            copy: [{ from: "appl/views/**/*", to: distDir + "/appl/views" },
            { from: "appl/templates/**/*", to: distDir + "/appl/templates" },
            { from: "images/*", to: distDir + "/images" },
            { from: "../README.md", to: distDir }
            ]
        }),
        isProduction && !isKarma && UglifyESPlugin({
            compress: true,
            mangle: true
        })
    ],
    homeDir: src,
    output: distDir + "/$name.js",
    log: true,
    debug: true,
    cache: !isProduction,
    hash: false,
    sourceMaps: isProduction && !isKarma,
    alias: aliases,
    allowJs: true,
    tsConfig: "tsconfig.json",
    shim: {
        jquery: {
            source: "../node_modules/jquery/dist/jquery.js",
            exports: "$",
        }
    }
});

if (!isProduction) {
    if (useHMR === true) {
        fuse.dev({
            root: '../',
            port: 3080,
            open: false
        });
    }
    var vendor = fuse.bundle("vendor")
        .target("browser")
        .instructions(`~ index.js`);

    var acceptance = fuse.bundle("acceptance")
        .target("browser")
        .instructions(`> [index.js]`);

    if (useHMR === true) {
        acceptance.hmr({ reload: true })
            .watch();
    }
} else {
    fuse.bundle('vendor')
        .target('browser')
        .sourceMaps(true)
        .instructions(`~ index.js`)
        .plugin(BlockStripPlugin({
            options: {
                start: 'steal-remove-start',
                end: 'steal-remove-end'
            }
        }))

    fuse.bundle('acceptance')   //Using .js so that dev code will be stripped.
        .target('browser')
        .sourceMaps(false)
        .instructions(`!> [index.js]`)
        .alias(aliases)
        .plugin(BlockStripPlugin({
            options: {
                start: 'develblock:start',
                end: 'develblock:end'
            }
        }))
}

fuse.run(); //{chokidar : {ignored: /((^|[\/\\])\..|node_modules)/} });


