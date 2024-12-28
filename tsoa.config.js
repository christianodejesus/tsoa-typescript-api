/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */

const configFiles = {
  development: ".env.dev",
  homolog: ".env.hml",
  production: ".env",
  test: ".env.test",
}
const environment = process.env.NODE_ENV || "development"

require("dotenv").config({
  path: `./env/${configFiles[environment]}`,
})

module.exports = {
  entryFile: "src/app.ts",
  ignore: ["**/node_modules/**"],
  noImplicitAdditionalProperties: "throw-on-extras",
  controllerPathGlobs: ["./src/**/*.controller.ts"],
  spec: {
    securityDefinitions: {
      api_key: {
        type: "apiKey",
        name: "X-API-KEY",
        in: "header",
      },
    },
    jwt: {
      type: "apiKey",
    },
    basePath: `/${process.env.CONTEXT_PATH}`,
    outputDirectory: "./src/server",
    specVersion: 3,
  },
  routes: {
    routesDir: "./src/server",
    iocModule: "./src/config/ioc/inversify.ioc.module.ts",
    basePath: `/${process.env.CONTEXT_PATH}`,
    middleware: "express",
    authenticationModule: "./src/server/middlewares/express.authentication.middleware.ts",
  },
}
