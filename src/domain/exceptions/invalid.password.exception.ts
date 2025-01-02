import { ServiceError } from "../../shared/exceptions"

export class InvalidPasswordException extends ServiceError {
  constructor(message: string) {
    super(InvalidPasswordException.name, message)
    this.name = InvalidPasswordException.name
  }
}
