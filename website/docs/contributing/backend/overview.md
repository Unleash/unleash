---
title: Back end
---

The backend is written in nodejs/typescript. It's written as a REST API following a CSR (controller, service, repository/store) pattern. The following ADRs are defined for the backend:

## ADRs

We have created a set of ADRs to help guide the development of the backend:

* [Naming](../ADRs/back-end/naming.md)
* [Preferred export](../ADRs/back-end/preferred-export.md)

## Requirements

Before developing on this project you will need two things:

- PostgreSQL 14.0+
- Node.js v22.0+

```sh
corepack enable
yarn install
yarn dev
```

## PostgreSQL

To run and develop Unleash, you need to have PostgreSQL 14.0+ locally.

Unleash currently also works with PostgreSQL v14.0+, but this might change in a future feature release, and we have stopped running automatic integration tests below PostgreSQL 14. The current recommendation is to use a role with Owner privileges since Unleash uses Postgres functions to simplify our database usage.

### Create a local Unleash database in Postgres

Start the ready-to-use Postgres container (first run builds a small image that
executes the required SQL automatically):

```bash
$ docker compose -f docker-compose.postgres.yml up -d
```

The container exposes Postgres on `localhost:5432` with the expected role and
databases already created. Stop it with `docker compose -f docker-compose.postgres.yml down`.

If you prefer to run the SQL manually outside of Docker, you can execute:

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'password';
ALTER USER unleash_user CREATEDB;
CREATE DATABASE unleash WITH OWNER unleash_user;
CREATE DATABASE unleash_test WITH OWNER unleash_user;
ALTER DATABASE unleash_test SET timezone TO 'UTC';
SQL
```

Then set env vars:

(Optional as unleash will assume these as default values).

```
export DATABASE_URL=postgres://unleash_user:password@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:password@localhost:5432/unleash_test
```

## PostgreSQL with docker

If you don't want to install PostgreSQL locally, you can spin up an Docker instance. We have created a script to ease this process: `scripts/docker-postgres.sh`

## Start the application

In order to start the application you will need Node.js v22.x or newer installed locally.

```
// Install dependencies
yarn install

// Start Unleash in development
yarn dev

// Unleash UI
http://localhost:3000

// API:
http://localhost:3000/api/

// Execute tests in all packages:
yarn test
```

## Database changes

We use database migrations to track database changes. Never change a migration that has been merged to main. If you need to change a migration, create a new migration that reverts the old one and then creates the new one.

### Making a schema change

To run migrations, you will set the environment variable for DATABASE_URL

`export DATABASE_URL=postgres://unleash_user:password@localhost:5432/unleash`

Use db-migrate to create new migrations file.

```bash
> yarn run db-migrate create YOUR-MIGRATION-NAME
```

All migrations require one `up` and one `down` method. There are some migrations that will maintain the database integrity, but not the data integrity and may not be safe to run on a production database.

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

## Publishing / Releasing new packages

Please run `yarn test` checks before publishing.

Run `npm run publish` to start the publishing process.

`npm run publish:dry`
