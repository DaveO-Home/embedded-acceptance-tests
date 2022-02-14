/**
 * This is the websocket route. Does all messaging and database calls.
 */
const database = require("../db/database");
const orm = database.orm;
const Router = require("koa-router");
const Url = require("url").URL;
const utils = require("../js/utils.js");
const WebSocket = require("ws");

const userErrorMessage = "ID out of sync, please redo handle.";

/**
 * Create tables if missing; see db-config.js
 * For most db's there should be a tablespace/database created first.
 * Sqlite3 is the default db - will work without further configuration.
 * @tablename (camelCase) - will be converted to lowercase table names.
 */
orm.createTable("Users").then(() => {
  orm.createTable("Messages").then(() => {
    orm.createTable("Undelivered")
      .catch((err) => {
        utils.log("error", err.stack, __filename);
        throw err;
      });
  }).catch((err) => {
    utils.log("error", err.stack, __filename);
    throw err;
  });
}).catch((err) => {
  utils.log("error", err.stack, __filename);
  throw err;
});
/**
 * WebSocket url
 */
const router = new Router({ prefix: "/dodex" }, (ctx/*, next*/) => {
  utils.log("info", `Session Cookie: ${ctx.req.headers}`, __filename);
});

function socketServer(server) {
  const wss = new WebSocket.Server({
    verifyClient: function (info, done) {
      done(true);
    },
    server
  });

  /**
   * Using "websockets/ws" client/server
   * The koa server defaults to port 3087
   * Url - ws://" + this.server + "/dodex?handle=" + handle + "&id=" + encodeURIComponent(keys.id)
   *  where id = one way password generated from UUID and converted to base64 - used for uniqueness.
   *        handle is client input plus a random emoji.
   *        server defaults to localhost - server:port can be changed in the dodex config. 
   */
  wss.on("connection", async (ws, request) => {
    const parameters = new Url(request.headers.origin + request.url).searchParams;
    const handle = parameters.get("handle");
    const id = parameters.get("id");
    const ip = request.socket.remoteAddress;
    let users = null;

    // write to access log file
    utils.log("info", `Socket Connection: ${handle} - ${ip}`, __filename/*, accessLogger*/);

    const user = {
      name: handle,
      password: id,
      ip: ip
    };

    ws.id = id;
    ws.handle = handle;

    await orm.getUser(ws).then(async (record) => {
      if (typeof record === "undefined" || record === null) {
        await orm.addUser(ws, user)
          .catch((err) => {
            utils.log("error", err.stack, __filename);
            const errorMessage = "Server Error - notify administrator";
            ws.send(errorMessage);
            throw err.message;
          });
      }
      else if (record.get("password") !== id) {
        ws.send(userErrorMessage);
        throw `ID does not match - ${id} for ${handle}`;
      }
    }).catch((err) => {
      utils.log("error", err.stack, __filename);
      ws.send(userErrorMessage);
      throw err.message;
    });
    /**
     * Return all registered users to client on connection for private messaging.
     * Returns all undelivered message
     * Cleans-up messages for this user
     */
    await orm.getUsers(ws).then((response) => {
      users = JSON.stringify(response);
      // note "connected:" is a command telling dodex client of all registered users for private messaging
      ws.send("connected:" + users);
      orm.getUserMessages(ws)
        .then(async (data) => {
          /**
           * Resend undelivered messages.
           */
          for (let i in data) {
            const postDate = data[i].post_date;
            const formattedDate = formatDate(new Date(postDate));
            await ws.send(`${data[i].from_handle}(posted:${formattedDate}) ${data[i].message}`);
          }
          // remove relationship between user and message and delete message if orphaned
          await orm.deleteUndeliveredByUser(ws)
            .catch((err) => {
              utils.log("error", err.stack, __filename);
            });
        })
        .catch((err) => {
          utils.log("error", err.stack, __filename);
        });
    })
      .catch((err) => {
        utils.log("error", err.stack, __filename);
      });
    /**
     * Processes client broadcasts, private messages and commands.
     * So far commannds embedded in the message are; 
     *  1) which private users to send message. 
     *  2) delete existing user when changing handle.
     * @message
     */
    ws.on("message", (message) => {
      const onlineUsers = [];
      let selectedUsers;
      commandMessage(message, ws).then((returnObject) => {
        if (returnObject.message.length > 0) {
          // private users to send message
          selectedUsers = returnObject.selectedUsers;
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              // don't send message back to sending client
              if (ws.id !== client.id) {
                // broadcast message
                if (returnObject.selectedUsers.length === 0 && !returnObject.command) {
                  client.send(`${ws.handle}: ${returnObject.message}`);
                  // private message
                } else if (returnObject.selectedUsers.includes(client.handle)) {
                  client.send(`${ws.handle}: ${returnObject.message}`);
                  // keep track of delivered messages
                  onlineUsers.push(client.handle);
                }
              }
              else {
                if (returnObject.selectedUsers.length === 0 && returnObject.command) {
                  client.send("Private user not selected");
                }
                else
                  client.send("ok");
              }
            }
          });
          // calculate difference between selected and online users
          const disconnectedUsers = selectedUsers
            .filter(x => !onlineUsers.includes(x))
            .concat(onlineUsers.filter(x => !selectedUsers.includes(x)));
          // save any undelivered private messages
          undeliveredPrivateMessages(ws, disconnectedUsers, returnObject);
        }
      });
    });

    ws.on("close", (data) => {
      if (data !== 1000) {
        utils.log("info", `Closed: ${data}`, __filename);
      }
    });
  });
}

function undeliveredPrivateMessages(ws, disconnectedUsers, data) {
  if (disconnectedUsers.length === 0) {
    return;
  }
  orm.addMessage(ws, data).then(async (message) => {
    await orm.addUndelivered(ws, disconnectedUsers, message.get("id"));
  })
    .catch((err) => {
      utils.log("error", err.message, __filename);
    });
}
/**
 * Parse and process possible command from message.
 * @clientData - message with optional embedded command
 * @ws - socket, includes user name/password
 */
async function commandMessage(clientData, ws) {
  const dataArray = clientData.toString().split("!!");

  let returnObject = {};
  if (dataArray.length === 1) {
    returnObject.message = clientData;
    returnObject.selectedUsers = [];
    returnObject.command = "";
    return returnObject;
  }
  let data = dataArray[1];
  const command = data.length === 0 ? dataArray[0] : dataArray[0].substring(dataArray[0].lastIndexOf(";"));
  const message = data.length === 0 ? data : dataArray[0].substring(0, dataArray[0].lastIndexOf(";"));

  returnObject = processCommand(command, data, ws);
  returnObject.message = message;

  return returnObject;
}

function processCommand(command, data, ws) {
  let selectedUsers = [];
  switch (command) {
    // Remove user from db when client changes handle.
    // There should not be any undelivered messages against this user if using the dodex client.
    // Howerver, if the browser cache is cleared, the user may remain in db(obsoleted).
    case ";removeuser":
      orm.deleteUser(ws);
      break;
    // Set users for private messaging.
    case ";users":
      selectedUsers = JSON.parse(data);
      break;
    default: break;
  }

  return { selectedUsers: selectedUsers, command: command };
}

function formatDate(date) {
  const h = addZero(date.getHours());
  const m = addZero(date.getMinutes());
  const mon = addZero(date.getMonth() + 1);
  const day = addZero(date.getDay() + 1);
  const yr = date.getFullYear().toString().substring(2);
  return `${mon}-${day}-${yr} ${h}:${m}`;
}

function addZero(value) {
  if (value < 10) {
    value = `0${value}`;
  }
  return value;
}

module.exports = { router: router, socketserver: socketServer };
