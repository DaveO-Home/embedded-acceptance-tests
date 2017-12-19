
/*eslint no-extra-semi: "warn"*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
    const customizedHMRPlugin = {
    hmrUpdate: ({ type, path, content }) => {
        
        if (type === "js") {

            FuseBox.flush();
            FuseBox.dynamic(path, content);
            if (FuseBox.mainFile) {
                FuseBox.import(FuseBox.mainFile)
            }
            return true;
        }
    }
}

//let alreadyRegistered = false;

if (!process.env.hmrRegistered) {
    process.env.hmrRegistered = false;
    FuseBox.addPlugin(customizedHMRPlugin);
    console.warn("Added Customized Plugin");
}


