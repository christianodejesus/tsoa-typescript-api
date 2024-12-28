import { singleton } from "../../../config"
import { LoggerService } from "../../../infra/log"
import { ILoginInputDto, ILoginOutputDto, IUserInputDto } from "../dto"

@singleton(AuthService)
export class AuthService {
  private readonly logger = new LoggerService(AuthService.name)

  public async validateUser(input: ILoginInputDto) {
    this.logger.info("user validation process", { input })
    // const user = await this.userService.findByEmail(input.email)

    // if (user && (await EncryptService.verify(input.password, user.pass))) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { pass, _id, email, name } = user

    //   return { id: _id, name, email }
    // }

    return null
  }

  public async signUp(input: IUserInputDto): Promise<void> {
    this.logger.info("user sign up process", { input })
  }

  async signIn(input: ILoginInputDto): Promise<ILoginOutputDto> {
    this.logger.info("user sign in process", { input })
    throw new Error()
    // const user = await this.validateUser(input)
    // if (!user) {
    //   throw new Error()
    // }
    // const payload = { name: user.name, sub: user.id }
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    //   expires_in: 86400,
    // }
  }
}
