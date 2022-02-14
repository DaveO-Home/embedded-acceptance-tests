
const utils = {
	/**
	 * Winston logger - logger.js
	 * includes filename emitting message
	 */
	log (level, message, filename, logger) {
		global.currentFilename = filename;
		if(typeof logger ==="undefined") {
			logger = global.logger;
		}
		if(typeof message === "undefined" || message === null) {
			message = "unknown";
		}
		else if(typeof message !== "string") {
			message = message.toString();
		}
		return logger[level](message);
	}
};

module.exports = utils;
