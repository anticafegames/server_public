import { createLogger, transports, format } from 'winston'
import winston = require('winston');
import { Transform } from 'stream';
import { FormatInputPathObject } from 'path';

type loggerLevel = 'error' | 'info' | 'warn'

export default class Logger {

  static _logger: winston.Logger = null

  static get logger() {

    if (!Logger._logger) {

      const logger = createLogger({
        level: 'info',
        format: format.combine(
          format.timestamp(),
          format.metadata(),
          Logger.customFormat
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
          new transports.File({
            filename: './error.log',
            dirname: './logs',
            level: 'error',
            maxsize: 512000,
            maxFiles: 10,
          }),
          new transports.File({
            filename: './log.log',
            dirname: './logs',
            maxsize: 512000,
            maxFiles: 10,
          }),
          new transports.Console()
        ]
      });

      Logger._logger = logger
    }

    return Logger._logger
  }

  static customFormat = format.printf(info => {
    const formattedDate = info.metadata.timestamp.replace('T', ' ').replace('Z', '')
    return `${formattedDate} | ${info.level} | message: ${info.message} | path: ${info.metadata.path} || data: ${info.metadata.data && JSON.stringify(info.metadata.data)}`
  })

  static log = (level: loggerLevel, message: string, path?: string, data?: any) => Logger.logger.log(level, message, { path, data })

  static info = (message: string, path?: string, data?: any) => Logger.log('info', message, path, data)
  static warning = (message: string, path?: string, data?: any) => Logger.log('warn', message, path, data)
  static error = (message: string, path?: string, data?: any) => Logger.log('error', message, path, data)
}