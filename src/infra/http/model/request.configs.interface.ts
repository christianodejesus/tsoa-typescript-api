export interface IRequestRetryConfig {
  retries?: number
  shouldResetTimeout?: boolean
  retryCondition?: (error?: unknown) => boolean | Promise<boolean>
  retryDelay?: (retryCount: number, error?: unknown) => number
}

export interface IRequestConfigs {
  timeout?: number
  headers?: Record<string, unknown>
  params?: unknown
  auth?: {
    username: string
    password: string
  }
  retry?: IRequestRetryConfig
  responseType?: string
}
