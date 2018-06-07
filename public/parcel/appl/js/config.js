/* global testit:true */

/* parcel has issues with bootstrap 4.1 - using CDN on test pages to solve - 
   another solution is to upgrade cssnano to @next under parcel-bundler 
*/
// require('bootstrap/dist/css/bootstrap.css');
require('../css/site.css');
require('font-awesome/css/font-awesome.css');
require('tablesorter/dist/css/jquery.tablesorter.pager.min.css');
require('tablesorter/dist/css/theme.blue.min.css');
/* develblock:start */
if (testit) {
    require('tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js');
}
/* develblock:end */
