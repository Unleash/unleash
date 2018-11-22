---
id: developer_guide
title: Developer guide
---

## PostgreSQL

To run and develop unleash you need to have PostgreSQL database (PostgreSQL v.9.5.x or newer) locally.

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

Then set env vars:

(Optional as unleash will assume these as default values).

```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash_test
```

## PostgreSQL with docker

If you dont want to install PostgreSQL locally you can spin up an instance with docker. We have created a script to ease this process: `scripts/docker-postgres.sh`

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

In order to run migrations you will set the environment variable for DATABASE_URL

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

Please run `npm run nsp` nad `npm run test` checks before publishing.

Run `npm run publish` to start the publishing process.

`npm run publish:dry`
