/*global testit:true*/
require("bootstrap/dist/css/bootstrap.min.css");
require('~/css/site.css');
require("font-awesome/css/font-awesome.css");
require("tablesorter/dist/css/jquery.tablesorter.pager.min.css");
require("tablesorter/dist/css/theme.blue.min.css");

// window.process = {env:{NODE_ENV: "'production'"}}

/* develblock:start */
if(typeof testit !== "undefined" && testit) {
    require("pager");
}
// window.process = {env:{NODE_ENV: "'development'"}}
/* develblock:end */
