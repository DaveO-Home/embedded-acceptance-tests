"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const copy = require("copy");
/*eslint no-extra-semi: "warn"*/
/*global exports:true*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
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
    ;
}
exports.CopyFsClass = CopyFsClass;
exports.CopyFs = (options) => {
    return new CopyFsClass(options);
};
