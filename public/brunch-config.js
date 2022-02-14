const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const deployDir = isProduction ? "dist/brunch" : "dist_test/brunch";
const singleRun = process.env.USE_HMR !== "true" && process.env.USE_TDD !== "true";
const htmlFile = isProduction ? "brunch/appl/testapp.html" : "brunch/appl/testapp_dev.html";

exports.paths = {
  public: deployDir,
  watched: ["brunch/appl", "brunch/jasmine"]
};

exports.files = {
  javascripts: {
    joinTo: {
      "vendor.js": /^(?!brunch\/appl)/,
      "acceptance.js": [/^brunch\/appl/, /^brunch\/jasmine/]
    }
  },
  templates: {
    joinTo: "acceptance.js"
  },
  stylesheets: {
    joinTo: "acceptance.css",
    order: {
      after: ["brunch/appl/css/site.css"]
    }
  }
};

const pluginsObject = {
  stripcode: {
    start: "develblock:start",
    end: "develblock:end"
  },
  babel: {
    presets: ["@babel/env"]
  },
  // See README.md for implementation
  //   eslint: {
  //     pattern: /^brunch\/appl\/.*\.js?$/,
  //     warnOnly: true,
  //     fix: true
  //   },
  copycat: {
    "appl/views": ["brunch/appl/views"],
    "appl/templates": ["brunch/appl/templates"],
    "./": ["README.md"],
    "images": ["brunch/images"],
    "appl/dodex": ["brunch/appl/dodex"],
    "appl": [htmlFile],
    "img": ["node_modules/jsoneditor/dist/img/jsoneditor-icons.svg"],
    verbose: false,
    onlyChanged: true
  }
};

exports.plugins = pluginsObject;

exports.npm = {
  enabled: true,
  globals: {
    jQuery: "jquery",
    $: "jquery",
    bootstrap: "bootstrap",
    Popper: "@popperjs/core"
  },
  styles: {
    bootstrap: ["dist/css/bootstrap.css"],
    "tablesorter": [
      "dist/css/jquery.tablesorter.pager.min.css",
      "dist/css/theme.blue.min.css"
    ],
    dodex: ["dist/dodex.min.css"],
    jsoneditor: ["dist/jsoneditor.min.css", "dist/img/jsonedior-icons.svg"]
  },
  aliases: {
    "handlebars": "handlebars/dist/handlebars.min.js",
    "pager": "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js"
  }
};

exports.server = {
  port: 3080,
  base: "/",
  stripSlashes: true
};

pluginsObject.karmat = require("./brunch/build/karma.conf");
pluginsObject.karmat.singleRun = singleRun;

exports.overrides = {
  production: {
    optimize: false,
    paths: {
      watched: ["brunch/appl"]
    },
    conventions: {
      ignored: ["brunch/jasmine"]
    },
    plugins: {
      off: ["karmat"],
    }
  }
};
