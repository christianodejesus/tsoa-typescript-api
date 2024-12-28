import { LoadDependencies, container } from "./config/ioc/inversify.ioc.module"
import { MongoDBClient } from "./infra/database/core"
import { LoggerService } from "./infra/log/logger.service"
import { ApiServer } from "./server"

LoadDependencies(container)

class App {
  private logger: LoggerService = new LoggerService(App.name)

  public async startUp() {
    this.logger.info("application startUp")

    this.logger.info("application loading dependencies")

    const dbClient = container.get(MongoDBClient)
    await dbClient.connectDB()

    this.logger.info("starting API server")
    const apiServer = container.get(ApiServer)
    await apiServer.start()
  }
}

const app = new App()
app.startUp()
