# TSOA API

This is a simple TSOA and TypeScript API basic project.

## Key Technologies

- [NodeJS](https://nodejs.org) NodeJS.
- [TypeScript](https://www.typescriptlang.org/) TypeScript lang.
- [TSOA](https://tsoa-community.github.io/) OpenAPI-compliant Web APIs using TypeScript and Node.
- [MongoDB](https://mongodb.com/) MongoDB database system.
- [Docker](https://docker.com/) Docker containers.
- [TDD] Tests Driven Development.

## Project setup

Download or clone API source code and follow above steps to setup local environment

```bash
# install project dependencies
$ yarn

# running local stack
$ yarn stack:up

# generate new .env.dev file from .env.example
$ cp /env/.env.example /env/.env.dev
```

## Compile and run the project

```bash
# running in development mode
$ yarn dev

# build project to deploy
$ yarn build

# build and run built version (dev mode)
$ yarn build:start
```

With these steps the API is running locally on port 3000, then you can access the api under URL http://localhost:3000/...

- Access API health check endpoint (http://localhost:3000/tsoa-api/health)
- Access API Swagger documentation (http://localhost:3000/tsoa-api/docs)

## Running tests

### Note: to run tests properly, you need to setup local stack and database, see Project Setup section for this

```bash
# generate new .env.test file from .env.example
$ cp /env/.env.example /env/.env.test

# run tests
$ yarn test

# with log messages on info level
$ yarn test:info

# with log messages on debug level
$ yarn test:debug
```

## About Author

- Github - [Christiano Marques](https://github.com/christianodejesus)
- Linkedin - [Professional Profile](https://www.linkedin.com/in/christiano-marques)
