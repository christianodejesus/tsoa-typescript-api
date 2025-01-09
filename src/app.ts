import "reflect-metadata"
import { initializerModule } from "./config/ioc"
import { LoadDependencies, container } from "./config/ioc/inversify.ioc.module"
import { MongoDBClient } from "./infra/database/core"
import { LoggerService } from "./infra/log/logger.service"
import { ApiServer } from "./server"
import { AppConfig } from "./config"

class App {
  private logger: LoggerService = new LoggerService(App.name, new AppConfig())

  public async startUp() {
    this.logger.info("startUp: Application start up")

    this.logger.info("startUp: Loading application dependencies")
    LoadDependencies(container)

    const dbClient = container.get(MongoDBClient)
    await dbClient.connectDB()

    await initializerModule.inititalizes()

    this.logger.info("startUp: Starting API server")
    const apiServer = container.get(ApiServer)
    await apiServer.start()
  }
}

const app = new App()
app.startUp()
