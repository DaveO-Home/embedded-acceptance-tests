const Transformer = require("@parcel/plugin").Transformer;

const startComment = "develblock:start";
const endComment = "develblock:end";
const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

module.exports = (new Transformer({
  async transform({ asset }) {
    asset.type = "js";
    if (process.env.NODE_ENV !== "production" || asset.filePath.indexOf("parcel/appl") < 0) {
      return [asset];
    }

    let code = await asset.getCode();
    let code2 = code.replace(regexPattern, "");

    await asset.setCode(code2);
    
    return [asset];
  }
}));
