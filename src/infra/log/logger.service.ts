import { AsyncLocalStorage } from "async_hooks"
import httpContext from "express-http-context"
import winston from "winston"
import { ContextPropertyNamesEnum } from "../../server/enums"
import { AppConfig } from "../../config/app/app.config"
import { container } from "../../config/ioc/inversify.ioc.module"
import { LogOutputFormatEnum } from "../../config"
import winstonTimestampColorize from "winston-timestamp-colorize"

export class LoggerService {
  private appConfig: AppConfig
  private logger: winston.Logger
  private serviceName: string
  public static asyncStorage = new AsyncLocalStorage<Map<string, unknown>>()

  constructor(context: string, config: AppConfig = container.get(AppConfig)) {
    this.appConfig = config
    this.serviceName = this.appConfig.appName
    const logLevel = this.appConfig.logLevel

    const levels = {
      default: 0,
      error: 3,
      warn: 4,
      info: 6,
      debug: 7,
    }

    const customLogFormatter = winston.format.printf((logInfo) => {
      const { level, message, timestamp, context, logId, details, timestampValue } = logInfo
      const levelName = Object.keys(levels).find((name) => level.includes(name))
      const colorizedPart = levelName
        ? level.replace(levelName, `${this.serviceName}:${context}:${levelName}`)
        : `${this.serviceName}:${context}:${level}`

      let output = `${(timestamp as string).replace(timestampValue as string, `[${timestampValue}]`)} ${colorizedPart} ${message}`

      // @ts-expect-error i dont know
      const dataOutput = JSON.stringify({ ...details, logId }, null, 2)

      if (dataOutput !== "{}") {
        output += ` ${dataOutput}`
      }

      return output
    })

    const defaultLogFormatters = [winston.format.timestamp({ alias: "timestampValue" }), winston.format.errors({ stack: true })]

    if (this.appConfig.logOutputFormat === LogOutputFormatEnum.CONSOLE) {
      winston.addColors({
        info: "bold green",
        error: "bold red",
        warn: "bold yellow",
        debug: "bold magenta",
      })
      defaultLogFormatters.push(winston.format.colorize())
      defaultLogFormatters.push(winstonTimestampColorize({ color: "blue" }))
      defaultLogFormatters.push(customLogFormatter)
    } else {
      defaultLogFormatters.push(
        winston.format.printf((logInfo) => {
          const { details } = logInfo

          // @ts-expect-error i dont know
          const output = { ...logInfo, ...details }
          delete output.details

          return JSON.stringify(output)
        }),
      )
    }

    this.logger = winston.createLogger({
      levels,
      level: logLevel,
      silent: false,
      format: winston.format.combine(...defaultLogFormatters),
      defaultMeta: {
        context,
        env: this.appConfig.environment,
        service: this.serviceName,
        version: this.appConfig.lastCommitHash,
        get logId() {
          return (
            LoggerService.getContextVariables(ContextPropertyNamesEnum.TRANSACTION_ID) ||
            httpContext.get(ContextPropertyNamesEnum.TRANSACTION_ID)
          )
        },
      },
      transports: [new winston.transports.Console()],
      exitOnError: false,
    })
  }

  public error(message: string, details?: object): void {
    this.logger.error(message, { details })
  }

  public info(message: string, details?: object): void {
    this.logger.info(message, { details })
  }

  public debug(message: string, details?: object): void {
    this.logger.debug(message, { details })
  }

  public warn(message: string, details?: object): void {
    this.logger.warn(message, { details })
  }

  public static setContextVariables<T>(key: string, value: T): void {
    LoggerService.asyncStorage.getStore()?.set(key, value)
  }

  public static getContextVariables<T>(key: string): T | undefined {
    return LoggerService.asyncStorage.getStore()?.get(key) as T
  }
}
