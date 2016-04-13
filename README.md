# unleash

[![Build Status](https://travis-ci.org/finn-no/unleash.svg?branch=master)](https://travis-ci.org/finn-no/unleash) [![Code Climate](https://codeclimate.com/github/finn-no/unleash/badges/gpa.svg)](https://codeclimate.com/github/finn-no/unleash) [![Coverage Status](https://coveralls.io/repos/finn-no/unleash/badge.png?branch=master)](https://coveralls.io/r/finn-no/unleash?branch=master) [![Dependency Status](https://david-dm.org/finn-no/unleash.png)](https://david-dm.org/finn-no/unleash) [![devDependency Status](https://david-dm.org/finn-no/unleash/dev-status.png)](https://david-dm.org/finn-no/unleash#info=devD)

![Admin UI](https://cloud.githubusercontent.com/assets/572/5873775/3ddc1a66-a2fa-11e4-923c-0a9569605dad.png)

[Demo](http://unleash.herokuapp.com/) instance on Heroku

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. In order to make use of unleash you will also need a client implementation.

Known client implementations:
- [unleash-client-java](https://github.com/finn-no/unleash-client-java)
- [unleash-client-node](https://github.com/finn-no/unleash-client-node)

## Run with docker
We have set up docker-compose to start postgres and the unleash server together. This makes it really fast to start up
unleash locally without setting up a database or node.

```bash
$ docker-compose build
$ docker-compose up
```

## Development

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
```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash_test
```

### Commands

```
// Install dependencies
npm install

// Run migrations in your local DBs
./node_modules/.bin/db-migrate up
DATABASE_URL=$TEST_DATABASE_URL ./node_modules/.bin/db-migrate up

// Start server in dev-mode:
npm run dev

// Admin dashboard
http://localhost:4242

// Feature API:
http://localhost:4242/features

// Execute tests:
npm test

// Run tests with postgres running in docker:
npm run docker-test
```

### Making a schema change

1. Create `migrations/sql/NNN-your-migration-name.up.sql` with your change in SQL.
2. Create `migrations/sql/NNN-your-migration-name.down.sql` with the rollback of your change in SQL.
3. Run `db-migrate create your-migration-name` and edit the generated file to have this line: `module.exports = require('../lib/migrationRunner').create('NNN-your-migration-name');`
4. Run `db-migrate up`.
5. Generate LB artifact using `scripts/generate-liquibase-artifact` (TODO: make this internal)
