## Introduction {#introduction}

This repository contains two main parts. The backend and the frontend of unleash. The backend is a Node.js application that is built using TypeScript. The frontend is a React application that is built using TypeScript. The backend specific code can be found in the `src` lib folder. The frontend specific code can be found in the `frontend` folder. 

## Development philosophy

The development philosophy at unleash is centered at delivering high quality software. We do this by following a set of principles that we believe will help us achieve this goal. We believe that these principles will also help us deliver software that is easy to maintain and extend, serving as our north star.

We believe that the following principles will help us achieve our goal of delivering high quality software:

* We test our code always

Software is difficult. Being a software engineer is about acknowledging our limits, and taking every precaution necessary to avoid introducing bugs. We believe that testing is the best way to achieve this. We test our code always, and prefer automation over manual testing.

* We strive to write code that is easy to understand and maintain

We believe code is a language. Written code is a way to communicate intent. It's about explaining to the reader what this code does, in the shortest amount of time possible. As such, writing clean code is supremely important to us. We believe that this contributes to keeping our codebase maintainable, and helps us maintain speed in the long run. 

* We think about solutions before comitting

We don't jump to implementation immediately. We think about the problem at hand, and try to examine the impact that this solution may have in a multitude of scenarios. As our product core is open source, we need to balance the solutions and avoid implementations that may be cumbersome for our community. The need to improve our paid offering must never come at the cost of our open source offering.

### Required reading

The following resources should be read before contributing to the project:

* [Clean code javascript](https://github.com/ryanmcdermott/clean-code-javascript)
* [frontend overview](./frontend/overview.md)
* [backend overview](./backend/overview.md) 

### Recommended reading

* 


## Requirements

Before developing on this project you will need two things:

- PostgreSQL 10.x or newer
- Node.js 14.x or newer

```sh
yarn install
yarn run start:dev
```

## PostgreSQL {#postgresql}

To run and develop unleash, you need to have PostgreSQL database (PostgreSQL v10.x or newer) locally.

> Unleash currently also work with PostgreSQL v9.5+, but this might change in a future feature release, and we have stopped running automatic integration tests below PostgreSQL v10.

### Create a local unleash databases in postgres {#create-a-local-unleash-databases-in-postgres}

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
CREATE DATABASE unleash_test;
GRANT ALL PRIVILEGES ON DATABASE unleash_test to unleash_user;

ALTER DATABASE unleash_test SET timezone TO 'UTC';
SQL
```

> Password is intentionally set to 'passord', which is the Norwegian word for password.

Then set env vars:

(Optional as unleash will assume these as default values).

```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash_test
```

## PostgreSQL with docker {#postgresql-with-docker}

If you don't want to install PostgreSQL locally, you can spin up an Docker instance. We have created a script to ease this process: `scripts/docker-postgres.sh`

## Start the application {#start-the-application}

In order to start the application you will need Node.js v14.x or newer installed locally.

```
// Install dependencies
yarn install

// Start server in development
yarn start:dev

// Unleash UI
http://localhost:4242

// API:
http://localhost:4242/api/

// Execute tests in all packages:
yarn test
```

## Database changes {#database-changes}

We use database migrations to track database changes.

### Making a schema change {#making-a-schema-change}

To run migrations, you will set the environment variable for DATABASE_URL

`export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash`

Use db-migrate to create new migrations file.

```bash
> yarn run db-migrate create YOUR-MIGRATION-NAME
```

All migrations require one `up` and one `down` method.

Example of a typical migration:

```js
/* eslint camelcase: "off" */
'use strict';

exports.up = function(db, cb) {
  db.createTable(
    'examples',
    {
      id: { type: 'int', primaryKey: true, notNull: true },
      created_at: { type: 'timestamp', defaultValue: 'now()' },
    },
    cb,
  );
};

exports.down = function(db, cb) {
  return db.dropTable('examples', cb);
};
```

Test your migrations:

```bash
> yarn run db-migrate up
> yarn run db-migrate down
```

## Publishing / Releasing new packages {#publishing--releasing-new-packages}

Please run `yarn test` checks before publishing.

Run `npm run publish` to start the publishing process.

`npm run publish:dry`
