import { existsSync } from "fs"
import { singleton } from "../ioc/inversify.ioc.module"
import { config } from "dotenv"
import { AppEnvironmentEnum, IDBConfig, LogLevelConfigEnum, LogOutputFormatEnum, IServerConfig } from "./model"
import { DateTimeHelper, UuidHelper } from "../../shared/helpers"

@singleton(AppConfig)
export class AppConfig {
  private readonly configFiles = {
    [AppEnvironmentEnum.DEV]: ".env.dev",
    [AppEnvironmentEnum.HML]: ".env.hml",
    [AppEnvironmentEnum.PROD]: ".env",
    [AppEnvironmentEnum.TEST]: ".env.test",
  }
  public readonly environment = process.env.NODE_ENV || AppEnvironmentEnum.DEV

  public appName: string
  public serverConfig: IServerConfig = {
    port: 0,
    context: "",
  }
  public dbConfig: IDBConfig
  public buildDate: string
  public logOutputFormat: LogOutputFormatEnum
  public logLevel: LogLevelConfigEnum
  public lastCommitHash: string
  public jwtSecret: string

  constructor() {
    const envFilePath = `env/${this.configFiles[this.environment as AppEnvironmentEnum]}`
    if (!existsSync(envFilePath)) {
      throw new Error(`Env file not found for ${this.environment}`)
    }

    config({
      path: envFilePath,
    })

    const missingVars = ["PORT", "DB_CONN_STRING", "JWT_SECRET"].filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(`Missing required configuration environment variables`, { cause: missingVars })
    }

    this.buildDate = process.env.APP_BUILD_TIME || DateTimeHelper.getCurrentDateTime()

    this.serverConfig = {
      port: Number(process.env.PORT),
      context: process.env.CONTEXT_PATH || "/api",
    }

    this.dbConfig = {
      connectionString: process.env.DB_CONN_STRING as string,
      options: {
        serverSelectionTimeoutMS: 30000,
      },
    }

    this.appName = process.env.APP_NAME ?? "App Name"
    this.logOutputFormat = (process.env.LOG_OUTPUT_FORMAT as LogOutputFormatEnum) ?? LogOutputFormatEnum.CONSOLE
    this.logLevel = (process.env.LOG_LEVEL as LogLevelConfigEnum) ?? LogLevelConfigEnum.DEFAULT
    this.lastCommitHash = process.env.COMMIT_HASH ?? UuidHelper.generate()
    this.jwtSecret = process.env.JWT_SECRET as string
  }
}
