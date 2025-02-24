import { AuthService } from "../services/auth.service"
import { ISignInInputDto, ISignInOutputDto, ISignUpInputDto } from "../dto"
import { Body, Controller, Example, Post, Route, SuccessResponse, Tags } from "tsoa"
import { singleton } from "../../../config"
import { HttpStatusCodesEnum } from "../../../server/enums"

@Route("/v1/auth")
@Tags("Auth")
@singleton(AuthController)
export class AuthController extends Controller {
  constructor(private readonly authService: AuthService) {
    super()
  }

  @Post("/signup")
  @SuccessResponse(HttpStatusCodesEnum.CREATED, "User registered with success")
  async registerUser(@Body() body: ISignUpInputDto) {
    await this.authService.signUp(body)
  }

  @Post("/signin")
  @SuccessResponse(HttpStatusCodesEnum.SUCCESS, "User signed in with success")
  @Example<ISignInOutputDto>({
    access_token: "iusdbf38whfbw38hj38ofhwn8ejfa3oifnwu3ofj03jngfo3mqv93fj8ubfk2f3=",
    expires_in: 86400,
  })
  async signIn(@Body() body: ISignInInputDto): Promise<ISignInOutputDto> {
    return this.authService.signIn(body)
  }
}
