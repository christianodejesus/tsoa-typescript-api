import { faker } from "@faker-js/faker"
import { container } from "../../src/config/ioc/inversify.ioc.module"
import { JWTService } from "../../src/server/services/JWTService"

export default class Factory {
  static generateRandomToken = (isVtexJWT?: boolean): string => {
    const accountName = isVtexJWT ? { accountName: `${faker.name}` } : {}

    const payload = {
      exp: 9709291472,
      iat: 1706289672,
      ...accountName,
    }

    const jwtService = container.get(JWTService)
    const token = jwtService.generateToken(payload)
    return `Bearer ${token}`
  }
}
