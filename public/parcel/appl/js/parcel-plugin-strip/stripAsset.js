const JSAsset = require("parcel-bundler/src/assets/JSAsset");
const startComment = "develblock:start";
const endComment = "develblock:end";
const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

class StripAsset extends JSAsset {
    async load () {
        let code = await super.load();
        if (!this.options.production) {
            return code;
        }
        return code.replace(regexPattern, "");
    }
}

module.exports = StripAsset;
