import { singleton } from "../../../config"
import { InvalidSigninDataException } from "../../../domain/exceptions"
import { LoggerService } from "../../../infra/log"
import { JWTService } from "../../../server/services"
import { EncryptHelper } from "../../../shared/helpers"
import { UserService } from "../../user/services"
import { ISignInInputDto, ISignInOutputDto, ISignUpInputDto } from "../dto"

@singleton(AuthService)
export class AuthService {
  private readonly DEFAULT_TOKEN_TIMEOUT = 60 * 60 * 24 // 24h expressed in seconds
  private readonly logger = new LoggerService(AuthService.name)

  constructor(
    private userService: UserService,
    private jwtService: JWTService,
  ) {}

  public async validateUser(input: ISignInInputDto) {
    this.logger.info("user validation process", { email: input.email })
    const user = await this.userService.findByEmail(input.email)

    if (user && EncryptHelper.verify(input.password, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, id, email, name } = user

      return { id, name, email }
    }

    throw new InvalidSigninDataException("Invalid email or password")
  }

  public async signUp(input: ISignUpInputDto): Promise<void> {
    this.logger.info("user sign up process", {
      input: {
        name: input.name,
        email: input.email,
      },
    })

    await this.userService.create(input)
  }

  async signIn(input: ISignInInputDto): Promise<ISignInOutputDto> {
    this.logger.info("user sign in process", { email: input.email })
    const user = await this.validateUser(input)

    return {
      access_token: this.jwtService.generateToken({ name: user.name, sub: user.id }, this.DEFAULT_TOKEN_TIMEOUT),
      expires_in: this.DEFAULT_TOKEN_TIMEOUT,
    }
  }
}
