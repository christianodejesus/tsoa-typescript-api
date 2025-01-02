import { Controller, Example, Get, Route, SuccessResponse, Tags } from "tsoa"
import { singleton, AppConfig } from "../../../config"
import { DateTimeHelper } from "../../../shared/helpers"
import { IHealthOutputDto } from "../dto"
import { HttpStatusCodesEnum } from "../../../server/enums"

@Route("/")
@Tags("Main")
@singleton(MainController)
export class MainController extends Controller {
  private startupDate: string = DateTimeHelper.getCurrentDateTime()

  constructor(private appConfig: AppConfig) {
    super()
  }

  @Example<IHealthOutputDto>({
    message: "I'm health",
    builtAt: "2024-12-01T09:00:00Z",
    startedAt: "2024-12-27T21:52:14.489Z",
    commitHash: "fb6668f1e78153f2334bc",
  })
  @SuccessResponse(HttpStatusCodesEnum.SUCCESS, "Health check data returned with success")
  @Get("/health")
  public health(): IHealthOutputDto {
    return {
      message: "I'm health",
      builtAt: this.appConfig.buildDate,
      startedAt: this.startupDate,
      commitHash: this.appConfig.lastCommitHash,
    }
  }
}
