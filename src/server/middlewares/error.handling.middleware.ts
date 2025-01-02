import express from "express"
import { ValidateError } from "tsoa"
import httpContext from "express-http-context"
import { ApiError, ErrorNamesEnum, IServerError } from "../exceptions"
import { HttpStatusCodesEnum, ContextPropertyNamesEnum } from "../enums"
import { ServiceError } from "../../shared/exceptions"

export class ErrorHandlingMiddleware {
  public setHandler(app: express.Express) {
    app.use((err: IServerError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      httpContext.set(ContextPropertyNamesEnum.ERROR_DATA, err)

      if (err instanceof ApiError) {
        res.status(err.responseStatus)
        res
          .json({
            name: err.name,
            message: err.message,
            errors: err.errors,
          })
          .end()

        return
      }

      if (err.code === "ResourceNotFoundException") {
        res.status(HttpStatusCodesEnum.NOT_FOUND)
        res
          .json({
            name: ErrorNamesEnum.E_NOT_FOUND_ERROR,
            message: err.message,
          })
          .end()

        return
      }

      if (err instanceof ValidateError) {
        res.status(HttpStatusCodesEnum.BAD_REQUEST)
        res
          .json({
            name: ErrorNamesEnum.E_VALIDATION_ERROR,
            message: err.message,
            fields: err.fields,
          })
          .end()

        return
      }

      if (err instanceof ServiceError) {
        const errData = err as ServiceError
        res.status(HttpStatusCodesEnum.BAD_REQUEST)
        res
          .json({
            name: errData.name,
            message: errData.message,
          })
          .end()

        return
      }

      if (err.status) {
        res.status(err.status)
        res
          .json({
            name:
              err.status === HttpStatusCodesEnum.INTERNAL_SERVER_ERROR
                ? ErrorNamesEnum.E_UNEXPECTED_ERROR
                : ErrorNamesEnum.E_GENERIC_ERROR,
            message: err.message,
          })
          .end()

        return
      }

      res.status(HttpStatusCodesEnum.INTERNAL_SERVER_ERROR)
      res
        .json({
          name: ErrorNamesEnum.E_UNEXPECTED_ERROR,
          message: err.message,
        })
        .end()

      if (next) {
        next(err)
      }
    })
  }
}
