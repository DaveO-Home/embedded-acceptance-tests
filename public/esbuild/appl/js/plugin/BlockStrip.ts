
import {File} from "../../node_modules/fuse-box/src/core/File";
import {Plugin} from "../../node_modules/fuse-box/src/core/WorkflowContext";
//let StripBlock = require("webpack-strip-block");  //Must be Customized

export interface BlockStripOptions {
    [key: string]: string;
}

export class BlockStripClass implements Plugin {

    //minimize file selection list by including only js files under a js directory, index.js and js under can
    public test: RegExp = /(\/js\/.*\.js|index(\.js|\.ts)|can.*\.js)/;
    
    private startComment;
    private endComment;
    
    /* Per require("webpack-strip-block"); plugin */
    //private regexPattern = new RegExp("[\\t ]*\\/\\* ?" + this.startComment + " ?\\*\\/[\\s\\S]*?\\/\\* ?" + this.endComment + " ?\\*\\/[\\t ]*\\n?", "g");
    private regexPattern;

    constructor(public options: BlockStripOptions = {}) {
        this.startComment =  options.options.start || 'develblock:start'; 
        this.endComment =  options.options.end || 'develblock:end';
        this.regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + this.startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + this.endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
    }
    
    transform(file: File) {
        file.loadContents();
        file.contents = file.contents.replace(this.regexPattern, '');
    }
}

export const BlockStrip = (options?: BlockStripOptions) => {
    return new BlockStripClass(options);
};
