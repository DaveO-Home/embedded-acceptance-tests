import { Plugin } from "../../node_modules/fuse-box/src/core/WorkflowContext";
export interface CopyFsOptions {
    copy: {
        from: string;
        to: string;
    }[];
}
export declare class CopyFsClass implements Plugin {
    options: CopyFsOptions;
    constructor(options: CopyFsOptions);
}
export declare const CopyFs: (options?: CopyFsOptions) => CopyFsClass;
