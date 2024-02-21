ARG NODE_VERSION=18.19.1-alpine

FROM node:$NODE_VERSION as builder

WORKDIR /unleash

COPY . /unleash

RUN yarn config set network-timeout 300000

RUN yarn install --frozen-lockfile --ignore-scripts && yarn prepare:backend && yarn local:package

# frontend/build should already exist (it needs to be built in the local filesystem but in case of a fresh build we'll build it here)
RUN yarn build:frontend:if-needed

RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

WORKDIR /unleash/docker

RUN yarn install --frozen-lockfile --production=true

FROM node:$NODE_VERSION

ENV NODE_ENV production

ENV TZ UTC

WORKDIR /unleash

COPY --from=builder /unleash/docker /unleash

RUN rm -rf /usr/local/lib/node_modules/npm/

EXPOSE 4242

USER node

CMD ["node", "index.js"]
