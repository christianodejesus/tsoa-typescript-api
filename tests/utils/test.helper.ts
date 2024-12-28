import { AppConfig, container } from "../../src/config"
import { MongoDBClient } from "../../src/infra/database"

export class TestHelper {
  static async clearDataBase(
    dbClient: MongoDBClient,
    opts: { collectionName?: string; dropCollection?: boolean } = { dropCollection: false },
  ) {
    const { collectionName, dropCollection } = opts || { dropCollection: false }
    let collectionNames: string[] = []

    if (collectionName) {
      collectionNames.push(collectionName)
    } else {
      collectionNames = (await dbClient.client.db().listCollections().toArray()).map((collection) => collection.name)
    }

    for (const name of collectionNames) {
      await dbClient.client.db().collection(name).deleteMany()
      if (dropCollection) {
        await dbClient.client.db().collection(name).drop()
      }
    }
  }

  static apiPath(route: string, version: string | false = "v1") {
    const appConfig = container.get(AppConfig)
    return `/${appConfig.serverConfig.context}${version ? `/${version}` : ""}${route}`
  }
}
