/*
*   This removes 30 vulnerabilties
*/
/*eslint-env es6*/
const karma = require("karma");

class KarmaPlugint {
  constructor(config) {
    this.config = config && config.plugins && config.plugins.karmat;
  }

  onCompile() {
    if (this.config && !this.Server) {
      const parseConfig = karma.config.parseConfig;
      this.Server = karma.Server;
  
      parseConfig(
          null,
          this.config,
          { promiseConfig: true, throwErrors: true },
      ).then(
          (karmaConfig) => {
              new this.Server(karmaConfig, function doneCallback(exitCode) {
                  console.warn("Karma has exited with " + exitCode);
                  if(exitCode > 0) {
                      process.exit(exitCode);
                  }
              }).start();
          },
          (rejectReason) => { console.error(rejectReason); }
      );
    }
  }
}

KarmaPlugint.prototype.brunchPlugin = true;
KarmaPlugint.prototype.extension = "js";
KarmaPlugint.prototype.defaultEnv = "test";

module.exports = KarmaPlugint;