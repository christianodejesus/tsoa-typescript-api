import { HttpStatusCodesEnum } from "../model/http.status.codes.enum"

export interface IServerError extends Error {
  code?: string
  status?: HttpStatusCodesEnum
}
