
const db = require("./db-definitions");
const utils = require("../js/utils.js");
const bookshelf = db.bookshelf;
const knex = bookshelf.knex;
const tables = db.tables;
const User = db.User;
const Message = db.Message;
const Undelivered = db.Undelivered;

const orm = {
	/**
	 * Using knex to create table.
	 * @tablename
	 */
	createTable(tableName) {
		const table = tableName.toLowerCase();
		return tableExists(table).then((exists) => {
			if (!exists) {
				tables["create" + tableName](table)
					.catch((err) => {
						utils.log("error", err.stack, __filename);
						throw err.message;
					});
			}
		});
	},
	/**
	 * Add new user
	 * @ws - connecting socket
	 * @data - all required data for User table.
	 */
	addUser(ws, data) {
		return addUser(ws, data);
	},
	/**
	 * Get current connection User
	 * @ws - connecting socket
	 * @data - user info {name:"", password:"", ip:""}
	 * return 0 for success, -1 for failure
	 */
	getUser(ws) {
		return getUser(ws);
	},
	/**
	 * Get all users except connecting User to display in private list.
	 * @ws - connecting socket
	 * @data - current user's password.
	 * return [{name:""}, ...]
	 */
	getUsers(ws) {
		return getUsers(ws);
	},
	/**
	 * Remove selected Model
	 * @ws - connecting socket
	 */
	deleteUser(ws) {
		return deleteUser(ws);
	},
	/**
	 * Return all undelivered messages for connecting user.
	 * @ws Socket
	 */
	getUserMessages(ws) {
		return User.where({ name: ws.handle, password: ws.id })
			.fetch({ withRelated: ["messages.users"] })
			.then((response) => {
				return response ? response.related("messages").toJSON() : null;
			}).catch((err) => {
				utils.log("error", err.stack, __filename);
			});
	},
	/**
	 * Add a private message
	 * @ws - Socket with user/id
	 * @data - selected users and message
	 * return promise
	 */
	addMessage(ws, data) {
		return addMessage(ws, data);
	},
	/**
	 * Add relationship between user and message.
	 * @ws - Socket with user/id(user sending the message)
	 * @disconnectedUsers - users who did not receive the private message
	 * @messageId - new message id 
	 */
	addUndelivered(ws, disconnectedUsers, messageId) {
		const disconnectedLength = disconnectedUsers.length;
		for (let i = 0; i < disconnectedLength; i++) {
			getUserByName(disconnectedUsers[i]).then((user) => {
				addUndelivered(ws, user.get("id"), messageId);
			});
		}
	},
	/**
	 * Once a user connects all undelivered messages are sent
	 * So remove the all relationships between user and message.
	 */
	deleteUndeliveredByUser(ws) {
		return deleteUndeliveredByUser(ws);
	}
};

const userErrorMessage = "ID out of sync, please redo handle.";
const undeliveredError = "Problem storing undelivered message";

module.exports = { knex: knex, orm: orm, bookshelf: bookshelf };

/**
 * Check for existing table
 * @tablename 
 */
async function tableExists(tableName) {
	if (typeof tableName === "undefined" || typeof knex === "undefined") {
		return false;
	}
	let doesExist = false;

	await knex.schema.hasTable(tableName).then(function (exists) {
		doesExist = exists;
	});

	return doesExist;
}

async function addUser(ws, data) {
	let status = 0;

	await bookshelf.transaction((trans) => {
		new User().save({
			name: data.name,
			password: data.password,
			ip: data.ip,
			"last_login": new Date()
		}, {
			transacting: trans,
			method: "insert",
			defaults: true,
			patch: false,
			require: true
		}).then((user) => {
			return trans.commit(user).then((/*data*/) => {
				return Promise.resolve(`Committed - ${user.get("name")}`);
			}).then((result) => {
				utils.log("info", `Result: ${result}`, __filename);
			})
				.catch((err) => {
					trans.rollback();
					ws.send(userErrorMessage);
					utils.log("error", err.stack, __filename);
					return -1;
				});
		})
			.catch((err) => {
				trans.rollback();
				ws.send(userErrorMessage);
				utils.log("error", err.stack, __filename);
				return -1;
			});
	}).catch((err) => {
		utils.log("error", err.stack, __filename);
		throw err.message;
	});

	return status;
}

function getUserByName(handle) {
	return new User({ name: handle })
		.fetch()
		.catch((err) => {
			utils.log("error", err.stack, __filename);
			throw err.message;
		});
}

function getUser(ws) {
	return new User({ name: ws.handle, password: ws.id })
		.fetch()
		.catch((err) => {
			if (err.message !== "EmptyResponse") {
				utils.log("error", err.stack, __filename);
				ws.send(userErrorMessage);
			}
		});
}

async function getUsers(ws) {
	let response = null;

	await new User()
		.query(function (query) {
			query.where("password", "<>", ws.id);
		})
		.fetchAll({ columns: "name" })
		.then((userNames) => {
			response = userNames.toJSON();
		})
		.catch(function (err) {
			utils.log("error", err.stack, __filename);
			ws.send(userErrorMessage);
		});

	return response;
}

async function deleteUser(ws) {
	const user = await getUser(ws);

	bookshelf.transaction((trans) => {
		if (user !== null) {
			user.destroy({ transacting: trans })
				.then(trans.commit)
				.catch(function (err) {
					utils.log("error", err.stack, __filename);
					trans.rollback();
					ws.send(userErrorMessage);
				});
		}
	});
}

function addMessage(ws, data) {
	return bookshelf.transaction((trans) => {
		new Message().save({
			message: data.message,
			"from_handle": ws.handle,
			"post_date": new Date()
		}, {
			transacting: trans,
			method: "insert",
			defaults: true,
			patch: false,
			require: true
		})
			.then((message) => {
				return trans.commit(message).then((/*data*/) => {
					utils.log("info", `Committed Message- ${message.get("id")}`, __filename);
				}).catch((err) => {
					ws.send(undeliveredError);
					utils.log("error", err.stack, __filename);
				});
			}).catch((err) => {
				ws.send(undeliveredError);
				utils.log("error", err.stack, __filename);
			});
	}).catch((err) => {
		utils.log("error", err.stack, __filename);
		throw err.message;
	});
}

function addUndelivered(ws, userId, messageId) {
	return bookshelf.transaction((trans) => {
		new Undelivered().save({
			"user_id": userId,
			"message_id": messageId
		}, {
			transacting: trans,
			method: "insert",
			defaults: false,
			patch: false,
			require: true
		}).then((undelivered) => {
			return trans.commit(undelivered).then((/*data*/) => {
				utils.log("info", `Committed Undelivered- ${undelivered.get("user_id")}`, __filename);
			})
				.catch((err) => {
					ws.send(undeliveredError);
					utils.log("error", err.stack, __filename);
				});
		})
			.catch((err) => {
				ws.send(undeliveredError);
				utils.log("error", err.stack, __filename);
			});
	}).catch((err) => {
		utils.log("error", err.stack, __filename);
		throw err.message;
	});
}

async function deleteUndeliveredByUser(ws) {
	const user = await getUser(ws);
	const messageIds = [];

	return new Undelivered().query().where({ "user_id": user.id })
		.then(async (undelivered) => {
			bookshelf.transaction(async (trans) => {
				const undeliveredLength = undelivered.length;
				for (let i = 0; i < undeliveredLength; i++) {
					const deliveredObject = undelivered[i];
					const delivered = await new Undelivered().where(deliveredObject);
					await delivered.destroy({ transacting: trans })
						.catch((err) => {
							utils.log("error", err.stack, __filename);
							throw err.message;
						});
					messageIds.push(deliveredObject.message_id);
				}
			}).then(() => {
				deleteMessages(messageIds);
			});
		}).catch((err) => {
			utils.log("error", err.stack, __filename);
			throw err.message;
		});
}
/**
 * Remove undelivered messages if delivered to desired users.
 * @messageIds - ids to check
 */
async function deleteMessages(messageIds) {
	const messageIdsLength = messageIds.length;
	for (let i = 0; i < messageIdsLength; i++) {
		await new Message().where({ "id": messageIds[i] })
			.fetch({ withRelated: ["undelivered"] })
			.then(async (message) => {
				if (message && message.related(["undelivered"]).toJSON().length === 0) {
					await message.destroy()
						.catch((err) => {
							utils.log("error", err.stack, __filename);
							throw err.message;
						});
				}
			});
	}
}
