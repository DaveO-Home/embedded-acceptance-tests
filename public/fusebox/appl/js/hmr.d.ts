declare const customizedHMRPlugin: {
    hmrUpdate: ({type, path, content}: {
        type: any;
        path: any;
        content: any;
    }) => boolean;
};
