import { Request } from "express"
import { IUser } from "./user.interface"

export interface IBaseRequestJWT extends Request {
  scopes: string[]
}

export interface IUserRequestJWT extends IBaseRequestJWT {
  user: IUser
}

export type RequestJWT = IUserRequestJWT
