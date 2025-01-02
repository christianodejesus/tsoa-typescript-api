import { DateTimeHelper, UuidHelper } from "../../shared/helpers"
import { UserStatusEnum } from "../enums"
import { Password } from "./password.model"

export interface IUser {
  id?: string
  name: string
  email: string
  password: string
  status?: UserStatusEnum
  createdAt?: string
  updatedAt?: string
}

export class User implements IUser {
  public readonly id: string
  public name: string
  public email: string
  public password: string
  public status: UserStatusEnum

  public readonly createdAt: string
  public updatedAt: string

  constructor(data: IUser) {
    this.id = data.id || UuidHelper.generate()
    this.status = data.status || UserStatusEnum.ACTIVE

    this.name = data.name
    this.email = data.email
    if (data.id) {
      this.password = data.password
    } else {
      const pass = new Password(data.password)
      this.password = pass.getEncrypted()
    }

    this.createdAt = data.createdAt || DateTimeHelper.getCurrentDateTime()
    this.updatedAt = data.updatedAt || this.createdAt
  }
}
