import { faker } from "@faker-js/faker"
import { container } from "../../src/config/ioc/inversify.ioc.module"
import { JWTService } from "../../src/server/services"
import { ISignInInputDto, ISignUpInputDto } from "../../src/application/auth/dto"
import { IUser } from "../../src/domain/models"

export class MockFactory {
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

  static newUserSignUpInput(passOpts?: { length?: number }): ISignUpInputDto {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.helpers.fromRegExp(`[a-z][0-9][A-Z]{${passOpts?.length || 16}}`),
    }
  }

  static newUserSignInInput(data?: Partial<IUser>): ISignInInputDto {
    return {
      email: data?.email || faker.internet.email(),
      password: data?.password || faker.internet.password(),
    }
  }

  static newUserInput(): IUser {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
  }
}
