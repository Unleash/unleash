ARG NODE_VERSION=22.22-alpine3.23

FROM node:$NODE_VERSION AS builder

WORKDIR /unleash

COPY . /unleash

RUN corepack enable

RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm prepare:backend && pnpm local:package

# frontend/build should already exist (it needs to be built in the local filesystem but in case of a fresh build we'll build it here)
RUN pnpm build:frontend:if-needed

RUN mkdir -p /unleash/build/frontend && mv /unleash/frontend/build /unleash/build/frontend/build

RUN CI=true pnpm prune --prod --ignore-scripts

FROM node:$NODE_VERSION

ENV NODE_ENV=production

ENV TZ=UTC

WORKDIR /unleash

COPY --from=builder /unleash/build /unleash/

COPY --from=builder /unleash/node_modules /unleash/node_modules

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN apk upgrade --no-cache

EXPOSE 4242

USER node

CMD ["node", "dist/server.js"]
