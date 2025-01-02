import { Request } from "express"
import { IRequestUser } from "./request.user.interface"

export interface IBaseRequestJWT extends Request {
  scopes: string[]
}

export interface IUserRequestJWT extends IBaseRequestJWT {
  user: IRequestUser
}

export type TRequestJWT = IUserRequestJWT
