import Axios, { AxiosError, AxiosHeaderValue, AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults } from "axios"
import axiosRetry, { IAxiosRetryConfig } from "axios-retry"
import { IServerError } from "../../../server/exceptions/server.error.interface"
import { LoggerService } from "../../log"
import { IRequestConfigs, IRequestRetryConfig } from "../model"

export interface IHttpClientConfig extends IRequestConfigs {
  baseURL?: string
}

export interface IHttpClientResponse {
  data: Record<string, unknown> | string
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface IHttpClientRequestConfig {
  url?: string
  method?: string
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  data?: Record<string, unknown>
  timeout?: number
}

type TRequestMethod = "get" | "post" | "put" | "patch" | "delete"

export class HttpClientError extends Error implements IServerError {
  constructor(
    public message: string,
    public name: string,
    public code?: string,
    public response?: IHttpClientResponse,
    public config?: IHttpClientRequestConfig,
  ) {
    super(message)
  }
}

export class HttpClient {
  public instance: AxiosInstance
  private defaultConfig: AxiosRequestConfig = {}
  private logger: LoggerService

  constructor(
    defaultConfig?: IHttpClientConfig,
    private logContext = "HttpClient",
  ) {
    this.instance = Axios.create()
    this.logger = new LoggerService(this.logContext)

    axiosRetry(this.instance, {
      retries: 0,
    })

    if (defaultConfig) {
      this.setDefaultConfig(defaultConfig)
    }
  }

  public setDefaultConfig(defaultConfig?: IHttpClientConfig) {
    this.logger.debug("setDefaultConfig", { defaultConfig })

    this.defaultConfig = this.mountAxiosRequestConfig(defaultConfig)
    this.instance.defaults = {
      ...(this.defaultConfig as Omit<AxiosRequestConfig, "headers">),
      headers: {
        common: this.defaultConfig.headers || {},
        get: this.defaultConfig.headers || {},
        post: this.defaultConfig.headers || {},
        put: this.defaultConfig.headers || {},
        patch: this.defaultConfig.headers || {},
        delete: this.defaultConfig.headers || {},
        head: this.defaultConfig.headers || {},
      } as HeadersDefaults & Record<string, AxiosHeaderValue>,
    }
  }

  private mountAxiosRequestConfig(inputConfig?: IRequestConfigs): AxiosRequestConfig {
    const config = Object.assign({}, inputConfig)

    if (!config) {
      return Object.assign({}, this.defaultConfig)
    }

    // copying retry from provided config
    const hasRetryConfig = !!config.retry
    const configRetry: IRequestRetryConfig = { ...config.retry }
    delete config.retry

    // copying headers from provided config
    const configHeaders = Object.assign({}, config.headers)
    delete config.headers

    // mounting new config merging default
    const requestConfig = Object.assign({}, this.defaultConfig, config)

    if (hasRetryConfig) {
      requestConfig["axios-retry"] = configRetry as IAxiosRetryConfig
    }

    if (!requestConfig.headers) {
      requestConfig.headers = {}
    }
    requestConfig.headers = Object.assign({}, requestConfig.headers, configHeaders)

    return requestConfig
  }

  private handleErrors(error: AxiosError): HttpClientError {
    const clientError = new HttpClientError(
      error.message,
      error.name,
      error.code,
      error.response ? this.handleResponse(error.response) : undefined,
      this.handleRequestConfig(error.config as AxiosRequestConfig),
    )
    clientError.stack = error.stack

    this.logger.warn(`[${this.logContext}_REQUEST_ERROR] [${error.config?.method?.toUpperCase()}]`, {
      error: {
        code: clientError.code,
        message: error.message,
        request: clientError.config,
        response: clientError.response,
      },
    })

    return clientError
  }

  private handleRequestConfig(requestConfig: AxiosRequestConfig): IHttpClientRequestConfig {
    return {
      url: requestConfig.url,
      method: requestConfig.method,
      baseURL: requestConfig.baseURL,
      headers: requestConfig.headers as Record<string, string>,
      params: requestConfig.params,
      data: requestConfig.data && typeof requestConfig.data === "string" ? JSON.parse(requestConfig.data) : {},
      timeout: requestConfig.timeout,
    }
  }

  private handleResponse(response: AxiosResponse): IHttpClientResponse {
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as Record<string, string>,
    }
  }

  private async request(method: TRequestMethod, url: string, config?: IRequestConfigs, data?: unknown) {
    try {
      const requestConfig = { ...this.mountAxiosRequestConfig(config), method, url, data }
      this.logger.info(`[${this.logContext}_REQUEST] [${method.toUpperCase()}]`, { request: requestConfig })

      const response = await this.instance.request(requestConfig)
      const treatedResponse = this.handleResponse(response)

      this.logger.info(`[${this.logContext}_RESPONSE] [${method.toUpperCase()}]`, {
        response: { method, baseURL: requestConfig.baseURL, url, ...treatedResponse },
      })
      return treatedResponse
    } catch (error) {
      throw this.handleErrors(error)
    }
  }

  public async get(url: string, config?: IRequestConfigs): Promise<IHttpClientResponse> {
    return await this.request("get", url, config)
  }

  public async post(url: string, data: unknown, config?: IRequestConfigs): Promise<IHttpClientResponse> {
    return await this.request("post", url, config, data)
  }

  public async put(url: string, data: unknown, config?: IRequestConfigs): Promise<IHttpClientResponse> {
    return await this.request("put", url, config, data)
  }

  public async patch(url: string, data: unknown, config?: IRequestConfigs): Promise<IHttpClientResponse> {
    return await this.request("patch", url, config, data)
  }

  public async delete(url: string, config?: IRequestConfigs): Promise<IHttpClientResponse> {
    return await this.request("delete", url, config)
  }
}
