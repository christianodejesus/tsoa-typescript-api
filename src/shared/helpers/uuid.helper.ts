import { v7, validate } from "uuid"

export abstract class UuidHelper {
  static generate(): string {
    return v7()
  }

  static isValid(id: string): boolean {
    return validate(id)
  }
}
