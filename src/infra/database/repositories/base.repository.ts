import { inject, injectable } from "inversify"
import { ICollectionIndex, MongoDBClient, IDBFindOptions } from "../core"

@injectable()
export abstract class BaseRepository {
  protected collectionName = ""

  constructor(
    @inject(MongoDBClient)
    private dbClient: MongoDBClient,
  ) {}

  protected async insert<T>(data: T) {
    await this.dbClient.create(data, this.collectionName)
    return data
  }

  protected async upd<T>(id: string, updatedData: Partial<T>): Promise<boolean> {
    return await this.dbClient.update({ id }, updatedData, this.collectionName)
  }

  protected async del(id: string) {
    return await this.dbClient.delete({ id }, this.collectionName)
  }

  protected async find<T>(filter: Partial<T>, options?: IDBFindOptions) {
    const { order, limit, page } = options || {}
    return await this.dbClient.find<T>(filter, this.collectionName, order, limit, page)
  }

  protected async findOneBy<T>(filter: Partial<T>) {
    return await this.dbClient.findOneBy<T>(filter, this.collectionName)
  }

  protected async findById<T>(id: string) {
    return await this.dbClient.findById<T>(id, this.collectionName)
  }

  protected async createIndexes(indexes: ICollectionIndex[]) {
    await this.dbClient.createIndexes(indexes, this.collectionName)
  }

  protected async createCollectionIfNotExists() {
    await this.dbClient.createCollectionIfNotExists(this.collectionName)
  }

  public abstract setupCollection(): Promise<void>
}
