import { Document, MongoClient, Sort } from "mongodb"
import { AppConfig, singleton } from "../../../config"
import { ICollectionIndex } from "./collection-index"
import { LoggerService } from "../../log"

export type TDBOrderOptions = "ASC" | "DESC"
export type TDBOrder = Record<string, TDBOrderOptions>

@singleton(MongoDBClient)
export class MongoDBClient {
  private readonly logger = new LoggerService(MongoDBClient.name)
  public client: MongoClient

  constructor(private readonly appConfig: AppConfig) {
    this.client = new MongoClient(this.appConfig.dbConfig.connectionString, this.appConfig.dbConfig.options)
  }

  async connectDB() {
    try {
      await this.client.connect()
      this.logger.info("connectDB: Connected with success to database server")

      return true
    } catch (e) {
      this.logger.error("connectDB: Error on trying to connect to database server", {
        message: e.message,
      })
      return false
    }
  }

  async disconnectDB() {
    try {
      await this.client.close()
      this.logger.info("disconnectDB: Disconnected with success from database server")

      return true
    } catch (e) {
      this.logger.error("disconnectDB: Error on trying to disconnect from database server", {
        message: e.message,
      })
      return false
    }
  }

  async create<T>(data: T, collection: string): Promise<boolean> {
    try {
      const result = await this.client
        .db()
        .collection(collection)
        .insertOne({ ...(data as Document) })

      return result.acknowledged && !!result.insertedId
    } catch (e) {
      this.logger.error("create: Error on trying to create document on database", {
        message: e.message,
      })
      throw e
    }
  }

  async update<T>(filter: Record<string, unknown>, updateData: Partial<T>, collection: string): Promise<boolean> {
    try {
      const result = await this.client
        .db()
        .collection(collection)
        .updateOne(filter, { $set: { ...(updateData as Document) } })

      return result.modifiedCount > 0
    } catch (e) {
      this.logger.error("update: Error on trying to update document on database", {
        message: e.message,
      })
      throw e
    }
  }

  async delete(filter: Record<string, unknown>, collection: string) {
    try {
      const result = await this.client.db().collection(collection).deleteOne(filter)

      return result.deletedCount > 0
    } catch (e) {
      this.logger.error("delete: Error on trying to delete document from database", {
        message: e.message,
      })
      throw e
    }
  }

  async find<T>(filter: Partial<T>, collection: string, order?: TDBOrder, limit?: number, page?: number): Promise<T[]> {
    try {
      let sort: Sort = {}
      if (order) {
        sort = Object.entries(order).map((item) => [item[0], item[1] === "ASC" ? 1 : -1]) as Sort
      }

      let skip = 0
      if (limit) {
        skip = limit * ((page || 1) - 1)
      }

      return await this.client
        .db()
        .collection(collection)
        .find(filter, { projection: { _id: false }, sort, limit })
        .skip(skip)
        .map((item) => item as T)
        .toArray()
    } catch (e) {
      this.logger.error("find: Error on trying to find documents on database", {
        message: e.message,
      })
      throw e
    }
  }

  async findById<T>(id: string, collection: string): Promise<T | null> {
    try {
      const result = await this.client
        .db()
        .collection(collection)
        .findOne<T>({ id: id }, { projection: { _id: false } })

      return result
    } catch (e) {
      this.logger.error("findById: Error on trying to find a document on database", {
        message: e.message,
      })
      throw e
    }
  }

  async findOneBy<T>(filter: Partial<T>, collection: string): Promise<T | null> {
    try {
      const result = await this.client
        .db()
        .collection(collection)
        .findOne<T>(filter, { projection: { _id: false } })

      return result
    } catch (e) {
      this.logger.error("findOneBy: Error on trying to find a document on database", {
        message: e.message,
      })
      throw e
    }
  }

  async createIndexes(indexes: ICollectionIndex[], collectionName: string) {
    const dB = this.client.db().collection(collectionName)
    const existentIndexNames = (await dB.listIndexes().toArray()).map((index) => index.name as string)

    try {
      const indexesToCreate = indexes
        .filter((index) => !existentIndexNames.find((name) => name === index.name))
        .map((index) => ({
          key: index.model,
          unique: index.isUnique,
          name: index.name,
        }))

      if (indexesToCreate.length > 0) {
        this.logger.info("createIndexes: creating indexes for collection", {
          collectionName,
          indexCount: indexesToCreate.length,
        })
        await dB.createIndexes(indexesToCreate)
      }
    } catch (e) {
      this.logger.error(`createIndexes: Error on trying to create indexes for collection ${collectionName}`, {
        message: e.message,
      })
      throw e
    }
  }

  async createCollectionIfNotExists(collectionName: string) {
    try {
      const collectionFound = await this.client
        .db()
        .listCollections({
          name: collectionName,
        })
        .toArray()

      if (collectionFound.length === 0) {
        this.logger.info(`createCollectionIfNotExists: collection "${collectionName}" not found on database, creating it`)
        await this.client.db().createCollection(collectionName)
      }
    } catch (e) {
      this.logger.error(`createCollectionIfNotExists: Error on trying to create collection ${collectionName}`, {
        message: e.message,
      })
      throw e
    }
  }
}
