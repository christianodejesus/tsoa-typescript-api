import { EncryptHelper } from "../../shared/helpers"
import { InvalidPasswordException } from "../exceptions"

export class Password {
  private encryptedValue: string

  constructor(private password: string) {
    if (password.length < 8) throw new InvalidPasswordException("Password length have at least 8 characters")
    if (!password.match(/\d+/g)) throw new InvalidPasswordException("Password must have as least one number")
    if (!password.match(/[A-Za-z]+/g)) throw new InvalidPasswordException("Password must have as least one letter")
    this.encryptedValue = EncryptHelper.encrypt(this.password)
  }

  public getEncrypted(): string {
    return this.encryptedValue
  }

  public getValue(): string {
    return this.password
  }
}
