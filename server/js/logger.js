/**
 * Configurations for logger.
 */
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const logDir = "log";
const serverFile = path.join(logDir, "server.log");
const accessFile = path.join(logDir, "access.log");
global.currentFilename = __filename;

const consoleLogger = new (transports.Console)({
  level: env === "development" ? "debug" : "info",
  format: format.combine(
    format((info, opts) => {
      info.label = path.basename(global.currentFilename);
      return info;
    })(),
    format.colorize(), 
    format.simple(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.printf(info => `${info.timestamp} ${info.level}: [${info.label}]: ${info.message}`)
  )
});

const logger = createLogger({
  transports: [
      consoleLogger,
      new transports.DailyRotateFile({
      filename: serverFile,
      datePattern: "WW-MM-YY",
      maxFiles: "24",
      maxSize: "50m",
      prepend: true,
      level: env === "development" ? "debug" : "info",
      format: format.combine(
        format((info, opts) => {
          info.label = path.basename(global.currentFilename);
          return info;
        })(),
        format.simple(),
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.printf(info => `${info.timestamp} ${info.level}: [${info.label}]: ${info.message}`)
      )
    })
  ]
});

const accessLogger = createLogger({
      transports: [
    new transports.DailyRotateFile({
      filename: accessFile,
      datePattern: "WW-MM-YY",
      maxFiles: "24",
      maxSize: "25m",
      prepend: true,
      level: "info",
      format: format.combine(
        format((info, opts) => {
          info.label = path.basename(global.currentFilename);
          return info;
        })(),
        format.simple(),
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.printf(info => `${info.timestamp} ${info.level}: [${info.label}]: ${info.message}`)
      )
    })
  ]
});

module.exports.logger = logger;
module.exports.accessLogger = accessLogger;
