FROM node:10-alpine

# There are 2 main ways to run this:
# - Pass in environment variable with knex-compatible DATABASE_URL
# - Container-mount a new knexfile.js with the values filled in on 'production'

RUN mkdir -p /liveperson/code/unleash
WORKDIR /liveperson/code/unleash

ENV NODE_ENV=production
COPY package.json .
RUN yarn install

COPY . .

EXPOSE 4242

ENTRYPOINT ["node", "server.js"]
