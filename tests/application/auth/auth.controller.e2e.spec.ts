import supertest from "supertest"
import { container, LoadDependencies } from "../../../src/config"
import { ApiServer } from "../../../src/server"
import { HttpStatusCodesEnum } from "../../../src/server/enums"
import { EncryptHelper, UuidHelper } from "../../../src/shared/helpers"
import { AuthController } from "../../../src/application/auth/controllers/auth.controller"
import { MockFactory, TestHelper } from "../../utils"
import { MongoDBClient } from "../../../src/infra/database"
import { UserRepository } from "../../../src/domain/repositories"
import { User } from "../../../src/domain/models"
import { InvalidPasswordException, InvalidSigninDataException } from "../../../src/domain/exceptions"
import { ISignInOutputDto } from "../../../src/application/auth/dto"
import { JWTService } from "../../../src/server/services"

describe(AuthController.name, () => {
  LoadDependencies(container)
  const server: ApiServer = container.get(ApiServer)
  const dbClient: MongoDBClient = container.get(MongoDBClient)
  const userRepo: UserRepository = container.get(UserRepository)
  const jwtService: JWTService = container.get(JWTService)

  beforeAll(async () => {
    await TestHelper.clearDataBase(dbClient)
    await server.start()
  })

  afterAll(async () => {
    await TestHelper.clearDataBase(dbClient)
    await dbClient.disconnectDB()
    await server.stop()
  })

  it("should register a new user with success", async () => {
    const userInput = MockFactory.newUserSignUpInput()

    await supertest(server.getHttpServer())
      .post(TestHelper.apiPath("/auth/signup"))
      .send(userInput)
      .expect(HttpStatusCodesEnum.CREATED)

    const userFromDB = await userRepo
      .getOneBy({
        email: userInput.email,
      })
      .catch((err) => err)
    expect(userFromDB).not.toBeInstanceOf(Error)
    expect(userFromDB).not.toBeNull()
    expect(userFromDB).toBeDefined()

    const userData = userFromDB as User
    expect(userData.id).toBeDefined()
    expect(UuidHelper.isValid(userData.id)).toBeTruthy()
    expect(userData.email).toBe(userInput.email)
    expect(userData.name).toBe(userInput.name)
    expect(EncryptHelper.verify(userInput.password, userData.password)).toBeTruthy()
  })

  it("should not register a new user when password is not valid", async () => {
    const userInput = MockFactory.newUserSignUpInput({ length: 5 })

    await supertest(server.getHttpServer())
      .post(TestHelper.apiPath("/auth/signup"))
      .send(userInput)
      .expect(HttpStatusCodesEnum.BAD_REQUEST)
      .expect({
        name: InvalidPasswordException.name,
        message: "Password length have at least 8 characters",
      })

    const userFromDB = await userRepo
      .getOneBy({
        email: userInput.email,
      })
      .catch((err) => err)
    expect(userFromDB).not.toBeInstanceOf(Error)
    expect(userFromDB).toBeNull()
  })

  it("should sign in an user with success", async () => {
    const userData = MockFactory.newUserInput()
    const signinInput = MockFactory.newUserSignInInput(userData)
    const user = new User(userData)

    const createRes = await userRepo.create(user).catch((err) => err)
    expect(createRes).not.toBeInstanceOf(Error)

    const signinResponse = await supertest(server.getHttpServer())
      .post(TestHelper.apiPath("/auth/signin"))
      .send(signinInput)
      .expect(HttpStatusCodesEnum.SUCCESS)

    const responseData = signinResponse.body as ISignInOutputDto
    expect(responseData.expires_in).toBeDefined()
    expect(responseData.expires_in).not.toBeNaN()

    const resolvedToken = await jwtService.resolveToken(responseData.access_token).catch((err) => err)
    expect(resolvedToken).not.toBeInstanceOf(Error)
    expect(resolvedToken).toBeDefined()
    expect(resolvedToken).toMatchObject({
      sub: user.id,
      name: user.name,
    })
  })

  it("should not sign in an user with wrong signin data", async () => {
    const userData = MockFactory.newUserInput()
    const user = new User(userData)
    const createRes = await userRepo.create(user).catch((err) => err)
    expect(createRes).not.toBeInstanceOf(Error)

    const signinInput = MockFactory.newUserSignInInput({ email: userData.email })

    await supertest(server.getHttpServer())
      .post(TestHelper.apiPath("/auth/signin"))
      .send(signinInput)
      .expect(HttpStatusCodesEnum.BAD_REQUEST)
      .expect({
        name: InvalidSigninDataException.name,
        message: "Invalid email or password",
      })
  })
})
