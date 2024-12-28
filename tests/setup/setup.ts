import { restore } from "nock"
import { container } from "../../src/config"

afterAll(async () => {
  restore()
  await container.unbindAllAsync()
})
