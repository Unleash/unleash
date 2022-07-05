ARG NODE_VERSION=16-alpine
FROM node:$NODE_VERSION as builder

RUN echo "Debug - node version: $NODE_VERSION "

WORKDIR /unleash

COPY . /unleash

RUN yarn install --frozen-lockfile --ignore-scripts && yarn run build && yarn run local:package

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
