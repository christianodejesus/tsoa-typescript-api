import * as bcrypt from "bcrypt"

export abstract class EncryptHelper {
  static encrypt(original: string): string {
    return bcrypt.hashSync(original, 10)
  }

  static verify(original: string, hash: string): boolean {
    return bcrypt.compareSync(original, hash)
  }
}
