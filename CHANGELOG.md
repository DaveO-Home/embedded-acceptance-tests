# Changelog

## [v2.0.0](https://github.com/DaveO-Home/embedded-acceptance-tests/tree/v2.0.0) (2022-02-15)

[Full Changelog](https://github.com/DaveO-Home/embedded-acceptance-tests/compare/v1.0.0...v2.0.0)

* Upgraded dependencies
* Upgraded modules
    *   Parcel 1 -> 2
    *   Webpack 4 -> 5 - enhanced configuration
    *   Webpack Dev Server 3 -> 4
    *   Karma 5 -> 6
    *   Fontawesome 4 -> 6
    *   Bootstrap 4 -> 5
* Added "bm" utility to build/run/test from public directory; e.g. `bm webpack test`
* Added "esbuild" bundler
* Added dodex-input - jsoneditor
* Converted default Express server to a Koa node server
* Added dodex-mess to work out-of-the-box with the default koa node server
* Upgrated knex for koa server - new sqlite3 from @vsnode/sqlite3
* Stealjs Dev Url now changed to: `localhost:3080/public/stealjs/appl/testapp_dev.html`
* Added plugin to rollup to generate a css bundle
* Changed Brunch Url to mimic the other bundlers ..dist/brunch/appl/testapp.html
* Added custom kamrat-brunch plugin to remove 30 vulnerabilities and use upgraded karma
* Discovered steal-tools causes exception with `can-route`. `SyntaxError: missing ] after element list` error in `define('can-observable-mixin@1.0.10#src/mixin-proxy'` caused by: 
`let inst = Reflect.construct(Base, arguments, [object Object].[object Object]);` Scrubbed this to make it compile.
* StealJs Prod - using `bootstap` CDN - `steal-tools` does not transpile `rest params`(...)
