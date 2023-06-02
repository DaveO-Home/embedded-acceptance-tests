/**
 * knex defaults to sqlite3 - no further db config required
 * also configured and tested with postgres.
 * Set Env variable "DB=pg" to run postgres(change config as needed) 
 */
global.currentFilename = __filename;
const dbConfig = require("./db-config")(process.env.DB || "sqlite3");
const knex = require("knex")(Object.assign(
  dbConfig,
  {
    log: {
      warn(message) {
        console.warn("Sql Warn: %o", message);
      },
      error(message) {
        console.error("Sql Error: %o", message);
      },
      deprecate(message) {
        // eslint-disable-next-line no-console
        console.log("Sql Deprecate: %o", message);
      },
      debug(message) {
        // eslint-disable-next-line no-console
        console.log("Sql debug: %o", message);
      }
    }
  }));

const { initialize, Model } = require('objection');

const tables = {
  createUsers(tableName) {
    return knex.schema.createTable(tableName, (table) => {
      table.increments("id");
      table.string("name");
      table.string("password");
      table.string("ip");
      table.datetime("last_login");
      table.unique("name");
      table.unique("password");
    });
  },
  createMessages(tableName) {
    return knex.schema.createTable(tableName, (table) => {
      table.increments("id");
      table.text("message");
      table.string("from_handle");
      table.datetime("post_date");
    });
  },
  createUndelivered(tableName) {
    return knex.schema.createTable(tableName, (table) => {
      table.integer("user_id").unsigned();
      table.integer("message_id").unsigned();
      table.foreign("user_id").references("users.id");
      table.foreign("message_id").references("messages.id");
    });
  }
};

Model.knex(knex);

class User extends Model {

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ["name", "password"],

      properties: {
        id: { type: "integer" },
        password: { type: "string", minLength: 10, maxLength: 255 },
        name: { type: "string", minLength: 1, maxLength: 255 },
        "last_login": { type: "integer" },
      },
    }
  }

  static get relationMappings() {
    return {
      users_undelivered: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: "users.id",
          to: "undelivered.user_id"
        }
      },
      messages: {
        relation: Model.ManyToManyRelation,
        modelClass: Message,
        join: {
          from: 'users.id',
          through: {
            modelClass: Undelivered,
            from: 'undelivered.user_id',
            to: 'undelivered.message_id'
          },
          to: 'messages.id'
        }
      }
    };
  }
}

class Undelivered extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "undelivered";
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ["user_id", "message_id"],

      properties: {
        "message_id": { type: "integer" },
        "user_id": { type: "integer" },
      },
    }
  }
}

class Message extends Model {
  static get tableName() {
    return "messages";
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ["from_handle", "message", "post_date"],

      properties: {
        id: { type: "integer" },
        "from_handle": { type: "string", minLength: 3, maxLength: 255 },
        message: { type: "string", minLength: 3, maxLength: 255 },
        "post_date": { type: "integer" },
      }
    }
  }

  static get relationMappings() {
    return {
      message_undelivered: {
        relation: Model.HasManyRelation,
        modelClass: Undelivered,
        join: {
          from: "messages.id",
          to: "undelivered.message_id"
        }
      }
    }
  }
}

exports.tables = tables;
exports.User = User;
exports.Message = Message;
exports.Undelivered = Undelivered;
exports.Model = Model;
