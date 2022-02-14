require("bootstrap/dist/css/bootstrap.min.css");
require("../css/site.css");
require("dodex/dist/dodex.min.css");
require("@fortawesome/fontawesome-free/js/all.js");
require("@fortawesome/fontawesome-free/js/fontawesome.js");
require("tablesorter/dist/css/jquery.tablesorter.pager.min.css");
require("tablesorter/dist/css/theme.blue.min.css");
require("jsoneditor/dist/jsoneditor.min.css");
window.process = {env: "production"};
/* develblock:start */
window.process = {env: "development"};
// if(typeof testit !== "undefined" && testit) {
//     require("tablepager");
// }
/* develblock:end */
