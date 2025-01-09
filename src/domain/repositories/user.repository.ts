import { singleton } from "../../config"
import { initialize } from "../../config/ioc"
import { BaseRepository, ICollectionIndex, IDBFindOptions, IndexSortOrderEnum } from "../../infra/database"
import { DateTimeHelper } from "../../shared/helpers"
import { IUser, User } from "../models"

@singleton(UserRepository)
export class UserRepository extends BaseRepository {
  protected collectionName = "users"

  @initialize(UserRepository)
  public async setupCollection() {
    await this.createCollectionIfNotExists()

    const collectionIndexes: ICollectionIndex[] = [
      {
        name: `${this.collectionName}_id_PRIMARY`,
        model: {
          id: IndexSortOrderEnum.ASCENDING,
        },
        isUnique: true,
      },
      {
        name: `${this.collectionName}_email_IDX`,
        model: {
          email: IndexSortOrderEnum.ASCENDING,
        },
        isUnique: true,
      },
    ]

    await this.createIndexes(collectionIndexes)
  }

  private formatToOuput(data: IUser | null): User | null {
    if (!data) {
      return null
    }

    return new User(data)
  }

  async create(data: User): Promise<User> {
    await this.insert(data)
    return data
  }

  async getOne(id: string): Promise<User | null> {
    return await this.findById<IUser>(id).then((user) => this.formatToOuput(user))
  }

  async getOneBy(filter: Partial<IUser>): Promise<User> {
    return await this.findOneBy<IUser>(filter).then((user) => this.formatToOuput(user) as User)
  }

  async search(filter: Partial<IUser>, options?: IDBFindOptions): Promise<User[]> {
    return await this.find<IUser>(filter, options).then((users) => users.map((user) => this.formatToOuput(user) as User))
  }

  async update(id: string, updateData: Partial<User>) {
    const updatedData = { ...updateData, updatedAt: DateTimeHelper.getCurrentDateTime() }
    return await this.upd(id, updatedData)
  }

  async delete(id: string): Promise<void> {
    await this.del(id)
  }
}
