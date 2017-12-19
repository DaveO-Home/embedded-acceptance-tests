import { File } from "../../node_modules/fuse-box/src/core/File";
import { Plugin } from "../../node_modules/fuse-box/src/core/WorkflowContext";
export interface BlockStripOptions {
    [key: string]: string;
}
export declare class BlockStripClass implements Plugin {
    options: BlockStripOptions;
    test: RegExp;
    private startComment;
    private endComment;
    private regexPattern;
    constructor(options?: BlockStripOptions);
    transform(file: File): void;
}
export declare const BlockStrip: (options?: BlockStripOptions) => BlockStripClass;
