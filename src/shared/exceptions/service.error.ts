import { TStringToUnknownDictionary } from "../model/dictionary.types"

export class ServiceError extends Error {
  constructor(
    errorName: string,
    message?: string,
    public details?: TStringToUnknownDictionary,
  ) {
    super(message)
    this.name = errorName
  }
}
