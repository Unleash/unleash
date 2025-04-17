FROM node:20.19.0-alpine3.21
COPY .. /app
WORKDIR /app
RUN corepack enable
RUN yarn --cwd ./frontend install
ARG UNLEASH_API="http://localhost:4242"
ENV UNLEASH_API=${UNLEASH_API}
WORKDIR /app/frontend