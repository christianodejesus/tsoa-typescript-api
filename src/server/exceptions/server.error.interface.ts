import { HttpStatusCodesEnum } from "../enums"

export interface IServerError extends Error {
  code?: string
  status?: HttpStatusCodesEnum
}
