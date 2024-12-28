import { inject, injectable } from "inversify"
import { ICollectionIndex, DBOrder, MongoDBClient } from "../core"

@injectable()
export abstract class Repository {
  protected collection = ""

  constructor(
    @inject(MongoDBClient)
    private dbClient: MongoDBClient,
  ) {}

  protected async insert<T>(data: T) {
    await this.dbClient.create(data, this.collection)
    return data
  }

  protected async upd<T>(id: string, updatedData: Partial<T>): Promise<boolean> {
    return await this.dbClient.update({ id }, updatedData, this.collection)
  }

  protected async del(id: string) {
    return await this.dbClient.delete({ id }, this.collection)
  }

  protected async find<T>(filter: Partial<T>, order?: DBOrder, limit?: number, page?: number) {
    return await this.dbClient.find<T>(filter, this.collection, order, limit, page)
  }

  protected async getById<T>(id: string) {
    return await this.dbClient.getById<T>(id, this.collection)
  }

  protected async createIndexes(indexes: ICollectionIndex[]) {
    await this.dbClient.createIndexes(indexes, this.collection)
  }

  protected async createCollectionIfNotExists() {
    await this.dbClient.createCollectionIfNotExists(this.collection)
  }
}
