import express from "express"
import fs from "fs"
import { Server } from "http"
import bodyParser from "body-parser"
import { LoggerService } from "../infra/log"
import { ErrorHandlingMiddleware, HttpLogMiddleware } from "./middlewares"
import { RegisterRoutes } from "./routes"
import { singleton, AppConfig } from "../config"
import swaggerUi from "swagger-ui-express"
import httpContext from "express-http-context"
import { ContextPropertyNamesEnum } from "./model"
import { UuidHelper } from "../shared/helpers"

@singleton(ApiServer)
export class ApiServer {
  private readonly app: express.Express
  private nodeServer?: Server
  private readonly logger = new LoggerService(ApiServer.name)
  private errorHandler: ErrorHandlingMiddleware
  private logMiddleware: HttpLogMiddleware

  constructor(private readonly appConfig: AppConfig) {
    this.app = express()
    this.errorHandler = new ErrorHandlingMiddleware()
    this.logMiddleware = new HttpLogMiddleware(ApiServer.name)
  }

  public getHttpServer(): express.Express {
    return this.app
  }

  public start(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, _reject) => {
      this.app.disable("x-powered-by")
      this.app
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json({ limit: "3mb" }))
        .use((req, res, next) => {
          return httpContext.middleware(req as never, res as never, next)
        })
        .use((req, res, next) => {
          const logId = UuidHelper.generate()
          httpContext.set(ContextPropertyNamesEnum.TRANSACTION_ID, logId)

          const olderResJsonFunc = res.json
          res.json = (data) => {
            httpContext.set(ContextPropertyNamesEnum.RESPONSE_DATA, data)
            return olderResJsonFunc.apply(res, [data])
          }

          res.setHeader(ContextPropertyNamesEnum.TRANSACTION_ID, logId)

          next()
        })
        .use((_req, res, next) => {
          res.header("Access-Control-Allow-Headers", `Origin, X-Requested-With, Content-Type, Accept, Authorization`)
          next()
        })
      this.logMiddleware.setHandler(this.app)

      RegisterRoutes(this.app)
      this.errorHandler.setHandler(this.app)

      this.registerDocRoutes()

      const port = this.appConfig.serverConfig.port
      this.nodeServer = this.app.listen(port, () => {
        this.logger.info(`Server is up & running on port ${port}`)
        resolve()
      })
    })
  }

  private registerDocRoutes() {
    const mainDocsPath = `/${this.appConfig.serverConfig.context}/docs`
    this.app.use(mainDocsPath, (_req, res, next) => {
      next()
    })
    fs.readFile(`${__dirname}/swagger.json`, (err, swaggerDocument) => {
      if (!err) {
        this.app.use(mainDocsPath, swaggerUi.serve, swaggerUi.setup(JSON.parse(swaggerDocument.toString()), { explorer: true }))
        this.logger.info(`registerDocRoutes: Api docs registered under ${mainDocsPath}`)
      } else {
        this.logger.error(`registerDocRoutes: cannot register the docs - ${err.message}`)
      }
    })
  }

  public stop = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.nodeServer?.close((err?: Error) => {
        if (err) {
          reject()
        }

        resolve()
      })
    })
  }
}
