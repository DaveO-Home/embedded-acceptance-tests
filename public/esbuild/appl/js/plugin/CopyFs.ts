import {File} from "../../node_modules/fuse-box/src/core/File";
import {Plugin} from "../../node_modules/fuse-box/src/core/WorkflowContext";
const copy = require("copy");

export interface CopyFsOptions {
    copy: {from: string, to: string}[];
}

export class CopyFsClass implements Plugin {
    constructor(public options: CopyFsOptions) {
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

export const CopyFs = (options?: CopyFsOptions) => {
    return new CopyFsClass(options);
};
