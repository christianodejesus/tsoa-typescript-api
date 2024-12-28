export class ServiceError extends Error {
  constructor(
    errorName: string,
    message?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = errorName
  }
}
