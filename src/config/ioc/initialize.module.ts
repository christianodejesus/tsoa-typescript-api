import { LoggerService } from "../../infra/log"
import { AppConfig } from "../app"
import { container } from "./inversify.ioc.module"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class = new (...args: any[]) => any

interface RunnableMethod {
  method: () => Promise<unknown>
  classReference: Class
}

class InitializerModule {
  private readonly logger = new LoggerService(InitializerModule.name, new AppConfig())

  private container = new Map<string, RunnableMethod>()

  public async inititalizes() {
    this.logger.info(`Initializing [${this.container.size}] configured methods for it`)

    this.container.forEach(async (value, key) => {
      const { method, classReference } = value
      this.logger.debug(`Initializing ${classReference.name}.${key}`)
      const ref = container.get(classReference)
      await method.apply(ref)
    })
  }

  public addToContainer(key: string, reference: RunnableMethod) {
    this.container.set(key, reference)
  }

  public clear() {
    this.container.clear()
  }
}

const initializerModule = new InitializerModule()

function initialize(classReference: Class) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    initializerModule.addToContainer(propertyKey, {
      method,
      classReference,
    })
  }
}

export { initializerModule, initialize }
