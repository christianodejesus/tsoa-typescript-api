import express from "express"
import { LoggerService } from "../../infra/log"
import httpContext from "express-http-context"
import { ContextPropertyNamesEnum, HttpStatusCodesEnum } from "../model"

export class HttpLogMiddleware {
  private logger: LoggerService

  constructor(logContext?: string) {
    this.logger = new LoggerService(logContext || "HttpLogMiddleware")
  }

  public setHandler(app: express.Express) {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const http = {
        referer: "REQUEST",
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        requestBody: Object.keys(req.body).length > 0 ? req.body : undefined,
      }

      this.logger.info(`[${http.referer}] [${http.method}] ${http.url}`)
      this.logger.debug(`[${http.referer}] [${http.method}] ${http.url}`, { http })

      res.on("finish", () => {
        const http = {
          referer: "RESPONSE",
          method: res.req.method,
          url: res.req.originalUrl,
          headers: res.getHeaders(),
          status_code: res.statusCode,
          status_message: res.statusMessage,
          requestBody: Object.keys(res.req.body).length > 0 ? res.req.body : undefined,
          responseBody: httpContext.get(ContextPropertyNamesEnum.RESPONSE_DATA) || undefined,
        }

        const error = httpContext.get(ContextPropertyNamesEnum.ERROR_DATA)

        if (error) {
          const errorToLog = { ...error, message: error.message }
          if (res.statusCode < HttpStatusCodesEnum.INTERNAL_SERVER_ERROR) {
            this.logger.warn(`[${http.referer}] [${http.method}] ${http.url}`, { error: errorToLog })
          } else {
            this.logger.error(`UnexpectedError [${http.referer}] [${http.method}] ${http.url}`, {
              http,
              error: errorToLog,
            })
          }
        } else {
          this.logger.info(`[${http.referer}] [${http.method}] ${http.url} : ${http.status_code} - ${http.status_message}`)
          this.logger.debug(`[${http.referer}] [${http.method}] ${http.url} : ${http.status_code} - ${http.status_message}`, {
            http,
          })
        }
      })

      if (next) {
        next()
      }
    })
  }
}
