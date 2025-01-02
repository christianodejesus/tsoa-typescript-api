import { singleton } from "../../../config"
import { IUser, User } from "../../../domain/models"
import { UserRepository } from "../../../domain/repositories"
import { LoggerService } from "../../../infra/log"

@singleton(UserService)
export class UserService {
  private readonly logger = new LoggerService(UserService.name)

  constructor(private readonly userRepository: UserRepository) {}

  public async findByEmail(email: string): Promise<User | null> {
    const users = await this.userRepository.search({
      email,
    })

    if (users.length === 0) {
      return null
    }

    return users[0]
  }

  public async create(data: IUser): Promise<User> {
    const newUser = new User(data)
    await this.userRepository.create(newUser)
    return newUser
  }
}
