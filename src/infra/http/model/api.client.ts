import { injectable } from "inversify"
import { LoggerService } from "../../log"
import { HttpClient, IHttpClientConfig } from "../core"

@injectable()
export abstract class ApiClient {
  private _httpClient?: HttpClient
  protected readonly logger = new LoggerService(this.getClassName())

  protected async getHttpClient(): Promise<HttpClient> {
    if (!this._httpClient) {
      const cfg = await this.getHttpClientConfig()
      this._httpClient = new HttpClient(cfg, this.getClassName())
    }

    return this._httpClient
  }

  protected abstract getHttpClientConfig(): Promise<IHttpClientConfig>
  protected abstract getClassName(): string
}
