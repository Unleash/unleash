---
id: developer_guide
title: Developer guide
---

## PostgreSQL

To run and develop unleash, you need to have PostgreSQL database (PostgreSQL v10.x or newer) locally.

> Unleash currently also work with PostgreSQL v9.5+, but this might change in a future feature release, and we have stopped running automatic integration tests below PostgreSQL v10.

### Create a local unleash databases in postgres

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
CREATE DATABASE unleash_test;
GRANT ALL PRIVILEGES ON DATABASE unleash_test to unleash_user;
SQL
```

> Password is intentionally set to 'passord', which is the Norwegian word for password.

Then set env vars:

(Optional as unleash will assume these as default values).

```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash_test
```

## PostgreSQL with docker

If you don't want to install PostgreSQL locally, you can spin up an Docker instance. We have created a script to ease this process: `scripts/docker-postgres.sh`

## Commands

```
// Install dependencies
npm install

// Start server in development
npm start:dev

// Unleash UI
http://localhost:4242

// API:
http://localhost:4242/api/

// Execute tests in all packages:
npm test
```

## Database changes

We use database migrations to track database changes.

### Making a schema change

To run migrations, you will set the environment variable for DATABASE_URL

`export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash`

Use db-migrate to create new migrations file.

```bash
> npm run db-migrate -- create YOUR-MIGRATION-NAME
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
> npm run db-migrate -- up
> npm run db-migrate -- down
```

## Publishing / Releasing new packages

Please run `npm run nsp` and `npm run test` checks before publishing.

Run `npm run publish` to start the publishing process.

`npm run publish:dry`
