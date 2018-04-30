'use strict'

class StripCode {
	constructor (config) {
		this.options = config.plugins.stripcode || {}
		this.startComment = this.options.start || 'develblock:start'
		this.endComment = this.options.end || 'develblock:end'
		/* Strips Webpack or CanJs development code */
		this.regexPattern = new RegExp('[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)' +
			this.startComment + ' ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)' +
			this.endComment + ' ?(\\*\\/)?[\\t ]*\\n?', 'g')
	}

	compile (file) {
		if (!file || !file.data) {
			return Promise.resolve(file)
		}

		file.data = file.data.replace(this.regexPattern, '')
		return Promise.resolve(file)
	}
}

StripCode.prototype.brunchPlugin = true
StripCode.prototype.type = 'javascript'
StripCode.prototype.pattern = /\.js?$/
StripCode.prototype.defaultEnv = 'production'

module.exports = StripCode
