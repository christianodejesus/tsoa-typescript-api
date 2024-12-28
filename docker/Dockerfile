FROM node:20-alpine

ARG LOG_LEVEL
ARG NODE_ENV
ARG APP_BUILD_TIME
ARG PORT
ARG COMMIT_HASH
ENV NO_COLOR=1

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN chown -R node:node /home/node/app
USER node

RUN yarn && yarn build

ENV LOG_LEVEL=${LOG_LEVEL}
ENV NODE_ENV=${NODE_ENV}
ENV APP_BUILD_TIME=${APP_BUILD_TIME}
ENV PORT=${PORT}
ENV COMMIT_HASH=${COMMIT_HASH}
EXPOSE ${PORT}

CMD ["node", "dist/app.js"]
