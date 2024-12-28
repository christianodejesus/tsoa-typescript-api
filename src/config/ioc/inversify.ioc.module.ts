import { Container, decorate, injectable, interfaces } from "inversify"
import { buildProviderModule, fluentProvide } from "inversify-binding-decorators"
import { Controller } from "tsoa"
import "reflect-metadata"

const iocContainer = new Container()
const container = iocContainer

decorate(injectable(), Controller)

const LoadDependencies = (container: Container) => {
  container.load(buildProviderModule())
}

const singleton = <T>(identifier: interfaces.ServiceIdentifier<T>) => {
  return fluentProvide(identifier).inSingletonScope().done(true)
}

export { iocContainer, container, LoadDependencies, singleton }
