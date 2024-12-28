import { HttpStatusCodesEnum } from "../model/http.status.codes.enum"
import { IServerError } from "./server.error.interface"

export class ApiError extends Error implements IServerError {
  public responseStatus: HttpStatusCodesEnum
  public errors?: Record<string, unknown>
  public internalErrorDetails?: Record<string, unknown>
  constructor(
    errorName: string,
    responseStatus: HttpStatusCodesEnum,
    message?: string,
    errors?: Record<string, unknown>,
    internalErrorDetails?: Record<string, unknown>,
  ) {
    super(message)
    this.name = errorName
    this.responseStatus = responseStatus
    this.errors = errors
    this.internalErrorDetails = internalErrorDetails
  }
}
