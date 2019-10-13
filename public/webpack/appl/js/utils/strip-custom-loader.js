/* jslint node:true */


var loaderUtils = require("loader-utils");

function StripCustomLoader (content) {
    var options = loaderUtils.getOptions(this) || {};
    var startComment = options.start || "steal-remove-start";
    var endComment = options.end || "steal-remove-end";

    //Per webpack-strip-block
    var regexPattern  = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
    
    content = content.replace(regexPattern, "");

    if (this.cacheable) {
        this.cacheable(true);
    }

    return content;
}

module.exports = StripCustomLoader;
