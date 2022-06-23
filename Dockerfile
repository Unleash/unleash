ARG NODE_VERSION=16-alpine
FROM node:$NODE_VERSION as builder

RUN echo "Debug - node version: $NODE_VERSION "

WORKDIR /unleash

ADD . /unleash

RUN yarn install --frozen-lockfile --ignore-scripts

RUN yarn run build

WORKDIR /unleash/docker

RUN yarn install --frozen-lockfile --production=true

FROM node:$NODE_VERSION

ENV NODE_ENV production

WORKDIR /unleash

COPY --from=builder /unleash/docker /unleash

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

CMD node index.js
