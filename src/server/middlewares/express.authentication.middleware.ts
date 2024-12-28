import express from "express"
import { singleton, container } from "../../config"
import { ApiError } from "../exceptions"
import { HttpStatusCodesEnum, RequestJWT } from "../model"
import { JWTService } from "../services"

@singleton(AuthenticationService)
class AuthenticationService {
  constructor(private jwtService: JWTService) {}

  private checkPermissions(securityName: string, decoded: RequestJWT, scopes: string[]) {
    for (const scope of scopes) {
      if (!decoded.scopes?.includes(scope)) {
        throw new ApiError("FORBIDDEN", HttpStatusCodesEnum.FORBIDDEN, "JWT does not contain required scope.")
      }
    }

    return decoded
  }

  public async expressAuthentication(req: express.Request, securityName: string, scopes: string[] = []): Promise<RequestJWT> {
    const token: string | undefined = req.headers["authorization"]?.replace(/^Bearer /, "")

    if (!token) {
      throw new ApiError("UNAUTHORIZED", HttpStatusCodesEnum.UNAUTHORIZED, "Authorization token is required")
    }

    const decodedData: RequestJWT = await this.jwtService.resolveToken(token)
    this.checkPermissions(securityName, decodedData, scopes)

    return decodedData
  }
}

export const expressAuthentication = async (
  req: express.Request,
  securityName: string,
  scopes: string[] = [],
): Promise<RequestJWT> => {
  const service = container.get(AuthenticationService)
  return service.expressAuthentication(req, securityName, scopes)
}
