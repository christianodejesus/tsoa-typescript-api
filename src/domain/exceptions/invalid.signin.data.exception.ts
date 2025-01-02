import { ServiceError } from "../../shared/exceptions"

export class InvalidSigninDataException extends ServiceError {
  constructor(message: string) {
    super(InvalidSigninDataException.name, message)
    this.name = InvalidSigninDataException.name
  }
}
