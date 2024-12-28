import { Document, MongoClient, Sort } from "mongodb"
import { AppConfig, singleton } from "../../../config"
import { ICollectionIndex } from "./collection-index"
import { LoggerService } from "../../log"

export type DBOrderOptions = "ASC" | "DESC"
export type DBOrder = Record<string, DBOrderOptions>

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
      this.logger.info("connectDB: conectado com sucesso.")

      return true
    } catch (e) {
      this.logger.error("connectDB: Erro ao conectar com o MongoDB.", e)
      return false
    }
  }

  async disconnectDB() {
    try {
      await this.client.close()
      this.logger.info("disconnectDB: MongoDB desconectado com sucesso.")

      return true
    } catch (e) {
      this.logger.error("disconnectDB: Erro ao desconectar do MongoDB.", e)
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
      this.logger.error("create: Erro ao inserir registro no banco.", e.message)
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
      this.logger.error("update: Erro ao atualizar registro no banco.", e.message)
      throw e
    }
  }

  async delete(filter: Record<string, unknown>, collection: string) {
    try {
      const result = await this.client.db().collection(collection).deleteOne(filter)

      return result.deletedCount > 0
    } catch (e) {
      this.logger.error("delete: Erro ao deletar registro do banco.", e.message)
      throw e
    }
  }

  async find<T>(filter: Partial<T>, collection: string, order?: DBOrder, limit?: number, page?: number): Promise<T[]> {
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
      this.logger.error("find: Erro ao buscar registros no banco.", e)
      throw e
    }
  }

  async getById<T>(id: string, collection: string): Promise<T | null> {
    try {
      const result = await this.client
        .db()
        .collection(collection)
        .findOne<T>({ id: id }, { projection: { _id: false } })

      return result
    } catch (e) {
      this.logger.error("getById: Erro ao obter o registro no banco.", e.message)
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
        this.logger.info(`createIndexes: criando índices para a collection`, {
          collectionName,
          indexCount: indexesToCreate.length,
        })
        await dB.createIndexes(indexesToCreate)
      }
    } catch (e) {
      this.logger.error(`createIndexes: Erro ao criar índice(s) para collection ${collectionName} no banco.`, e.message)
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
        this.logger.info(`createCollectionIfNotExists: collection "${collectionName}" not found on database, creating collection`)
        await this.client.db().createCollection(collectionName)
      }
    } catch (e) {
      this.logger.error(
        `createCollectionIfNotExists: Erro ao criar índice(s) para collection ${collectionName} no banco.`,
        e.message,
      )
      throw e
    }
  }
}
