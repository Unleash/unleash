---
id: getting_started
title: Getting Started
---

## Requirements

You will need:

- [**Node.js**](https://nodejs.org/en/download/) (version 12 or later)
- [**PostgreSQL**](https://www.postgresql.org/download/) (version 10 or later)
- [Create an unleash user and database](./developer-guide.md).

## Start Unleash server

Whichever option you choose to start Unleash, you must specify a database URI (it can be set in the environment variable DATABASE_URL).

Once the server has started, you will see the message:

```sh
Unleash started on http://localhost:4242
```

### Option one - from a terminal/bash shell

```sh
npm install unleash-server -g
unleash -d postgres://unleash_user:password@localhost:5432/unleash -p 4242
```

### Option two - from Node.js

1. Create a new folder/directory on your development computer.
2. From a terminal/bash shell, install the dependencies:

   ```sh
   npm init
   npm install unleash-server --save
   ```

3. Create a file called _server.js_, paste the following into it and save.

   ```js
   const unleash = require('unleash-server');

   unleash
     .start({
       databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
       port: 4242,
     })
     .then(unleash => {
       console.log(
         `Unleash started on http://localhost:${unleash.app.get('port')}`,
       );
     });
   ```

4. Run _server.js_:
   ```sh
   node server.js
   ```

### Option three - use Docker

[View the image on dockerhub](https://hub.docker.com/r/unleashorg/unleash-server/)

#### Docker-compose

1. Clone the [unleash-docker](https://github.com/Unleash/unleash-docker) repository.
2. Run `docker-compose build` in repository root folder.
3. Run `docker-compose up` in repository root folder.

#### Manually

1. Create a network by running `docker create network unleash`
2. Run

```sh
docker run -e POSTGRES_PASSWORD={INSERT_PASSWORD} -e POSTGRES_USER={INSERT_USER} -e POSTGRES_DB=unleash --network unleash postgres

docker run -p 4242:4242 --network unleash -e DATABASE_URL=postgres://{INSERT_USER}:{INSERT_PASSWORD}@postgres:5432/unleash unleashorg/unleash-server
```

## Test your server and create a sample API call

Once the Unleash server has started, go to [localhost:4242](http://localhost:4242) in your browser. If you see a list of example feature toggles, try modifying one of them with [curl](https://curl.se/) from a terminal/bash shell:

```
curl --location --request PUT 'http://localhost:4242/api/admin/features/Feature.A' --header 'Content-Type: application/json' --data-raw '{\
  "name": "Feature.A",\
  "description": "Dolor sit amet.",\
  "type": "release",\
  "enabled": false,\
  "stale": false,\
  "strategies": [\
    {\
      "name": "default",\
      "parameters": {}\
    }\
  ]\
}'\
```
