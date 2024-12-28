import * as bcrypt from "bcrypt"

export abstract class EncryptHelper {
  static async encrypt(original: string): Promise<string> {
    return await bcrypt.hash(original, 10)
  }

  static async verify(original: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(original, hash)
  }
}
