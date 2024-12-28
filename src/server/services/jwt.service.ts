import jwt from "jsonwebtoken"
import { AppConfig } from "../../config/app/app.config"
import { singleton } from "../../config/ioc/inversify.ioc.module"
import { LoggerService } from "../../infra/log"
import { ApiError } from "../exceptions"
import { HttpStatusCodesEnum } from "../model/http.status.codes.enum"
import { RequestJWT } from "../model/request.jwt.interface"

@singleton(JWTService)
export class JWTService {
  private readonly logger = new LoggerService(JWTService.name)

  constructor(private appConfig: AppConfig) {}

  private rejectToken(err: jwt.VerifyErrors, message?: string) {
    return new ApiError("UNAUTHORIZED", HttpStatusCodesEnum.UNAUTHORIZED, message || `JWT error: ${err.message}`)
  }

  async resolveToken(token: string): Promise<RequestJWT> {
    const secretValue = this.appConfig.jwtSecret

    if (!secretValue) {
      this.logger.info(`JWT_SECRET precisa ser definida`)
      return Promise.reject(new ApiError("UNAUTHORIZED", HttpStatusCodesEnum.UNAUTHORIZED, "Undefined secret key"))
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, secretValue, (err, decoded) => {
        if (err) {
          reject(this.rejectToken(err))
        } else {
          resolve(decoded as RequestJWT)
        }
      })
    })
  }

  public generateToken(payload: string | object, expiresIn?: string | number): string {
    const options: jwt.SignOptions = {}

    if (expiresIn) {
      options.expiresIn = expiresIn
    }

    return jwt.sign(payload, this.appConfig.jwtSecret, options)
  }
}
