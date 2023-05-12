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

- PostgreSQL 12.x or newer
- Node.js 14.x or newer

```sh
yarn install
yarn dev
```

## PostgreSQL {#postgresql}

To run and develop unleash, you need to have PostgreSQL database (PostgreSQL v12.x or newer) locally.

Unleash currently also work with PostgreSQL v12+, but this might change in a future feature release, and we have stopped running automatic integration tests below PostgreSQL v10.

### Create a local unleash databases in postgres {#create-a-local-unleash-databases-in-postgres}

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'password';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
CREATE DATABASE unleash_test;
GRANT ALL PRIVILEGES ON DATABASE unleash_test to unleash_user;
ALTER DATABASE unleash_test SET timezone TO 'UTC';
SQL
```

> Password is intentionally set to 'password', which is the Norwegian word for password.

Then set env vars:

(Optional as unleash will assume these as default values).

```
export DATABASE_URL=postgres://unleash_user:password@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:password@localhost:5432/unleash_test
```

## PostgreSQL with docker {#postgresql-with-docker}

If you don't want to install PostgreSQL locally, you can spin up an Docker instance. We have created a script to ease this process: `scripts/docker-postgres.sh`

## Start the application {#start-the-application}

In order to start the application you will need Node.js v14.x or newer installed locally.

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

## Database changes {#database-changes}

We use database migrations to track database changes. Never change a migration that has been merged to main. If you need to change a migration, create a new migration that reverts the old one and then creates the new one.

### Making a schema change {#making-a-schema-change}

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

## Publishing / Releasing new packages {#publishing--releasing-new-packages}

Please run `yarn test` checks before publishing.

Run `npm run publish` to start the publishing process.

`npm run publish:dry`
