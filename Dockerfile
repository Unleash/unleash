ARG NODE_VERSION=22.22-alpine3.23

FROM node:$NODE_VERSION AS builder

WORKDIR /unleash

COPY . /unleash

RUN corepack enable

RUN yarn install --immutable  && yarn prepare:backend && yarn local:package

# frontend/build should already exist (it needs to be built in the local filesystem but in case of a fresh build we'll build it here)
RUN yarn build:frontend:if-needed

RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

RUN yarn workspaces focus -A --production

FROM node:$NODE_VERSION

ENV NODE_ENV=production

ENV TZ=UTC

WORKDIR /unleash

COPY --from=builder /unleash/build /unleash/

COPY --from=builder /unleash/node_modules /unleash/node_modules

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

CMD ["node", "dist/server.js"]
