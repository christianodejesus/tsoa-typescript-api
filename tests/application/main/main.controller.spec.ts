import supertest from "supertest"
import { MainController } from "../../../src/application/main"
import { container, LoadDependencies } from "../../../src/config"
import { ApiServer } from "../../../src/server"
import { HttpStatusCodesEnum } from "../../../src/server/enums"
import { UuidHelper } from "../../../src/shared/helpers"
import { TestHelper } from "../../utils"

describe(MainController.name, () => {
  LoadDependencies(container)
  const server: ApiServer = container.get(ApiServer)

  beforeAll(async () => {
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it("should api answer a health check request", async () => {
    const res = await supertest(server.getHttpServer())
      .get(TestHelper.apiPath("/health", false))
      .expect(HttpStatusCodesEnum.SUCCESS)

    expect(res.headers).toHaveProperty("tid")
    expect(res.headers.tid).toBeDefined()
    expect(UuidHelper.isValid(res.headers.tid)).toBeTruthy()

    const healthData = res.body
    expect(healthData).toBeDefined()
    expect(healthData).not.toBeNull()
    expect(healthData.message).toBe("I'm health")
    expect(healthData.builtAt).not.toBeNull()
    expect(healthData.startedAt).not.toBeNull()
  })
})
