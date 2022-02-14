
Object.defineProperty(exports, "__esModule", { value: true });
const copy = require("copy");
class CopyFsClass {
    constructor(options) {
        this.options = options;
        options.copy.forEach(function (fromTo) {
            copy(fromTo.from, fromTo.to, function (err, files) {
                if (err) {
                    console.error("Copy Failed on: ");
                    console.error(files);
                    throw err;
                }
            });
        });
    }
}
exports.CopyFsClass = CopyFsClass;
exports.CopyFs = (options) => {
    return new CopyFsClass(options);
};
