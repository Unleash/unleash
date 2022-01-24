---
id: getting_started
title: Getting Started
---

> This section only applies if you plan to self-host Unleash. If you are looking for our hosted solution you should head over to [www.getunleash.io](https://www.getunleash.io/plans)

## Requirements {#requirements}

You will need:

- [Node.js](https://nodejs.org/en/download/) (version 14 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (version 10 or later)
- [Create an unleash user and database](./database-setup).

## Start Unleash server {#start-unleash-server}

Whichever option you choose to start Unleash, you must specify a database URI (it can be set in the environment variable DATABASE_URL). If your database server is not set up to support SSL you'll also need to set the environment variable `DATABASE_SSL` to `false`

---

Once the server has started, you will see the message:

```sh
Unleash started on http://localhost:4242
```

To run multiple replicas of Unleash simply point all instances to the same database.

**Unleash v4:** The first time Unleash starts it will create a default user which you can use to sign-in to you Unleash instance and add more users with:

- username: `admin`
- password: `unleash4all`

### Option 1 - use Docker {#option-one---use-docker}

**Useful links:**

- [Docker image on dockerhub](https://hub.docker.com/r/unleashorg/unleash-server/)
- [Unleash Helm Chart on artifacthub](https://artifacthub.io/packages/helm/unleash/unleash)

**Steps:**

1. Create a network by running `docker network create unleash`
2. Start a postgres database:

```sh
docker run -e POSTGRES_PASSWORD=some_password \
  -e POSTGRES_USER=unleash_user -e POSTGRES_DB=unleash \
  --network unleash --name postgres postgres
```

3. Start Unleash via docker:

```sh
docker run -p 4242:4242 \
  -e DATABASE_HOST=postgres -e DATABASE_NAME=unleash \
  -e DATABASE_USERNAME=unleash_user -e DATABASE_PASSWORD=some_password \
  -e DATABASE_SSL=false \
  --network unleash --pull=always unleashorg/unleash-server
```

### Option 2 - use Docker-compose {#option-two---use-docker-compose}

**Steps:**

1. Clone the [unleash-docker](https://github.com/Unleash/unleash-docker) repository.
2. Run `docker-compose build` in repository root folder.
3. Run `docker-compose up` in repository root folder.

### Option 3 - from Node.js {#option-three---from-nodejs}

1. Create a new folder/directory on your development computer.
2. From a terminal/bash shell, install the dependencies:

   ```shell npm2yarn
   npm init
   npm install unleash-server --save
   ```

3. Create a file called _server.js_, paste the following into it and save.

   ```js
   const unleash = require('unleash-server');

   unleash
     .start({
       db: {
         ssl: false,
         host: 'localhost',
         port: 5432,
         database: 'unleash',
         user: 'unleash_user',
         password: 'password',
       },
       server: {
         port: 4242,
       },
     })
     .then((unleash) => {
       console.log(
         `Unleash started on http://localhost:${unleash.app.get('port')}`,
       );
     });
   ```

4. Run _server.js_:
   ```sh
   node server.js
   ```

## Create an api token for your client {#create-an-api-token-for-your-client}

- [API Token creation](../user_guide/api-token)

## Test your server and create a sample API call {#test-your-server-and-create-a-sample-api-call}

Once the Unleash server has started, go to [localhost:4242](http://localhost:4242) in your browser. If you see an empty list of feature toggles, try creating one with [curl](https://curl.se/) from a terminal/bash shell:

```
curl --location -H "Authorization: <apitoken from previous step>" \
  --request POST 'http://localhost:4242/api/admin/features' \
  --header 'Content-Type: application/json' --data-raw '{\
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
}'
```

## Version check {#version-check}

- Unleash checks that it uses the latest version by making a call to https://version.unleash.run.
  - This is a cloud function storing instance id to our database for statistics.
- This request includes a unique instance id for your server.
- If you do not wish to check for upgrades define the environment variable `CHECK_VERSION` to anything else other than `true` before starting, and Unleash won't make any calls
  - `export CHECK_VERSION=false`
