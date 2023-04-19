ARG NODE_VERSION=18-alpine

FROM --platform=$BUILDPLATFORM node:$NODE_VERSION as frontend_builder

WORKDIR /unleash/frontend

COPY . /unleash

RUN yarn install --frozen-lockfile

FROM node:$NODE_VERSION as builder

WORKDIR /unleash

COPY . /unleash

RUN yarn config set network-timeout 300000

RUN yarn install --frozen-lockfile --ignore-scripts  && yarn run build && yarn run local:package

COPY --from=frontend_builder /unleash/frontend/build /unleash/build/frontend/build

WORKDIR /unleash/docker

RUN yarn install --frozen-lockfile --production=true

FROM node:$NODE_VERSION

ENV NODE_ENV production

WORKDIR /unleash

COPY --from=builder /unleash/docker /unleash

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

CMD ["node", "index.js"]
