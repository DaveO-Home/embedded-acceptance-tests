/*global testit:true*/
require("bootstrap/dist/css/bootstrap.min.css");
require('~/css/site.css');
require("dodex/dist/dodex.min.css");
require("font-awesome/css/font-awesome.css");
require("tablesorter/dist/css/jquery.tablesorter.pager.min.css");
require("tablesorter/dist/css/theme.blue.min.css");
window.process = {env: "production"}
/* develblock:start */
window.process = {env: "development"}
if(typeof testit !== "undefined" && testit) {
    require("pager");
}
/* develblock:end */
