import express from "express"
import { singleton, container } from "../../config"
import { ApiError } from "../exceptions"
import { HttpStatusCodesEnum } from "../enums"
import { JWTService } from "../services"
import { TRequestJWT } from "../model"

@singleton(AuthenticationService)
class AuthenticationService {
  constructor(private jwtService: JWTService) {}

  private checkPermissions(securityName: string, decoded: TRequestJWT, scopes: string[]) {
    for (const scope of scopes) {
      if (!decoded.scopes?.includes(scope)) {
        throw new ApiError("FORBIDDEN", HttpStatusCodesEnum.FORBIDDEN, "JWT does not contain required scope.")
      }
    }

    return decoded
  }

  public async expressAuthentication(req: express.Request, securityName: string, scopes: string[] = []): Promise<TRequestJWT> {
    const token: string | undefined = req.headers["authorization"]?.replace(/^Bearer /, "")

    if (!token) {
      throw new ApiError("UNAUTHORIZED", HttpStatusCodesEnum.UNAUTHORIZED, "Authorization token is required")
    }

    const decodedData: TRequestJWT = await this.jwtService.resolveToken(token)
    this.checkPermissions(securityName, decodedData, scopes)

    return decodedData
  }
}

export const expressAuthentication = async (
  req: express.Request,
  securityName: string,
  scopes: string[] = [],
): Promise<TRequestJWT> => {
  const service = container.get(AuthenticationService)
  return service.expressAuthentication(req, securityName, scopes)
}
