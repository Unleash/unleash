## Introduction {#introduction}

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
