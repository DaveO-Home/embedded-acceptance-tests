
const utils = require("../js/utils.js");
const db2 = require("./db-definitions-obj");
const tables = db2.tables;
const User2 = db2.User;
const Message2 = db2.Message;
const Undelivered2 = db2.Undelivered;
const knex = User2.knex();

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
		return addUser2(ws, data);
	},
	/**
	 * Get current connection User
	 * @ws - connecting socket
	 * @data - user info {name:"", password:"", ip:""}
	 * return 0 for success, -1 for failure
	 */
	getUser(ws) {
		return getUser2(ws);
	},
	/**
	 * Get all users except connecting User to display in private list.
	 * @ws - connecting socket
	 * @data - current user's password.
	 * return [{name:""}, ...]
	 */
	getUsers(ws) {
		return getUsers2(ws);
	},
	/**
	 * Remove selected Model
	 * @ws - connecting socket
	 */
	deleteUser(ws) {
		return deleteUser2(ws);
	},
	/**
	 * Return all undelivered messages for connecting user.
	 * @ws Socket
	 */
	getUserMessages(ws) {
		return User2.query().select("messages.*", "users.name", "users.id")
			.where({ name: ws.handle, password: ws.id })
			.joinRelated("messages")
			.catch((err) => {
				utils.log("error", err.stack, __filename);
			})
			.then((response) => {
				return response ? response : null;
			});
	},
	/**
	 * Add a private message
	 * @ws - Socket with user/id
	 * @data - selected users and message
	 * return promise
	 */
	addMessage(ws, data) {
		return addMessage2(ws, data);
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
			getUserByName2(disconnectedUsers[i]).then((user) => {
				addUndelivered2(ws, user[0].id, messageId);
			});
		}
	},
	/**
	 * Once a user connects all undelivered messages are sent
	 * So remove the all relationships between user and message.
	 */
	deleteUndeliveredByUser(ws) {
		return deleteUndeliveredByUser2(ws);
	}
};

const userErrorMessage = "ID out of sync, please redo handle.";
const undeliveredError = "Problem storing undelivered message";

module.exports = { knex: knex, orm: orm };

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

async function addUser2(ws, data) {
	let status = 0;
	data["last_login"] = new Date().getTime();

	const insertedGraph = await User2.transaction(async (trx) => {
		const insertedGraph = await User2.query(trx)
			.allowGraph('[undelivered, messages]')
			.insertGraph(data)
		return status
	}).catch((err) => {
		ws.send(userErrorMessage);
		utils.log("error", err.stack, __filename);
		return -1;
	});
}

async function getUser2(ws) {
	const query = User2.query();

	return await query.whereRaw("name = ?", [ws.handle]).andWhereRaw("password = ?", ws.id)
		.catch((err) => {
			if (err.message !== "EmptyResponse") {
				utils.log("error", err.stack, __filename);
				ws.send(userErrorMessage);
			}
		});
}

async function getUsers2(ws) {
	const query = User2.query();
	query.select("name").whereRaw("password <> ?", [ws.id]).orderBy("name");

	const otherUsers = await query;

	return otherUsers;
}

function getUserByName2(handle) {
	const query = User2.query();

	return query.where({ name: handle })
		.catch((err) => {
			utils.log("error", err.stack, __filename);
			throw err.message;
		});
}

async function deleteUser2(ws) {
	const user = await getUser2(ws);

	await User2.transaction(async (trx) => {
		if (user !== null && user.length > 0) {
			await User2.query(trx)
				.deleteById(user[0].id)
				.catch(function (err) {
					utils.log("error", err.stack, __filename);
					ws.send(userErrorMessage);
				});
		}
	});
}

async function addMessage2(ws, data) {
	const messageData = {};
	messageData["post_date"] = new Date().getTime();
	messageData["from_handle"] = ws.handle;
	messageData["message"] = data.message;

	return await Message2.transaction(async (trx) => {
		const message = await Message2.query(trx)
			.allowGraph("[undelivered, users]")
			.insertGraphAndFetch(messageData);

		utils.log("info", `Committed Message- ${message.id}`, __filename);
		return message;
	}).catch((err) => {
		ws.send(undeliveredError);
		utils.log("error", err.stack, __filename);
	});
}

async function addUndelivered2(ws, userId, messageId) {
	const undeliveredData = { "user_id": userId, "message_id": messageId }

	return await Message2.transaction(async (trx) => {
		const undelivered = await Undelivered2.query(trx)
			.allowGraph("[messages, users]")
			.insertGraph(undeliveredData);

		utils.log("info", `Committed Undelivered- ${userId}`, __filename);
		return undelivered;
	}).catch((err) => {
		ws.send(undeliveredError);
		utils.log("error", err.stack, __filename);
	});
}

async function deleteUndeliveredByUser2(ws) {
	const user = await getUser2(ws);
	const messageIds = [];

	return Undelivered2.query().where({ "user_id": user[0].id })
		.catch((err) => {
			utils.log("error", err.stack, __filename);
			throw err.message;
		})
		.then(async (undelivered) => {
			let trx;
			Undelivered2.transaction(async (trx) => {
				this.trx = trx;
				const undeliveredLength = undelivered.length;

				for (let i = 0; i < undeliveredLength; i++) {
					await Undelivered2.query(trx)
						.delete().where(undelivered[i])
						.catch((err) => {
							utils.log("error", err.stack, __filename);
							throw err.message;
						});
					messageIds.push(undelivered[i].message_id);
				}
			}).then(() => {
				deleteMessages2(messageIds, trx);
			}).catch((err) => {
				utils.log("error", err.stack, __filename);
				throw err.message;
			});
		});
}

/**
 * Remove undelivered messages if delivered to desired users.
 * @messageIds - ids to check
 */
async function deleteMessages2(messageIds, trx) {
	const messageIdsLength = messageIds.length;
	for (let i = 0; i < messageIdsLength; i++) {
		Message2.query().where({ "id": messageIds[i] })
			.joinRelated("message_undelivered")
			.then(async (message) => {
				if (message && message.length === 0) {
					Message2.query(trx).delete().where({ id: messageIds[i] })
						.catch((err) => {
							utils.log("error", err.stack, __filename);
							throw err.message;
						});
				}
			});
	}
}

