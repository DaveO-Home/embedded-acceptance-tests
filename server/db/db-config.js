const config = {
	sqlite3: {
		client: "sqlite3",
		useNullAsDefault: true,
		debug: false,
		connection: {
			filename: "./dodex.sqlite3"
		},
		acquireConnectionTimeout: 10000
	},
	pg: {
		client: "pg",
		version: "7.2",
		connection: {
			host : "127.0.0.1",
			port: 5432,
			user : process.env.PG_USER || "admin",
			password : process.env.PG_PASSWORD || "admin",
			database : "dodex"
		},
		acquireConnectionTimeout: 4000,
		debug: false
	}
};

module.exports = (db) => {
	return config[db || process.argv[2] || "sqlite3"] || config.sqlite3;
};