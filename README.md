# unleash

__Warning: We are in the process of splitting up unleash into multiple packages in this repository, if you want to test the previous package see [previous tag](https://github.com/finn-no/unleash/tree/v1.0.0-alpha.2) __ 

[![Build Status](https://travis-ci.org/Unleash/unleash.svg?branch=master)](https://travis-ci.org/Unleash/unleash)
[![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master)
[![Dependency Status](https://david-dm.org/Unleash/unleash.svg)](https://david-dm.org/Unleash/unleash)
[![devDependency Status](https://david-dm.org/Unleash/unleash/dev-status.svg)](https://david-dm.org/Unleash/unleash#info=devD)
![Admin UI](https://cloud.githubusercontent.com/assets/572/5873775/3ddc1a66-a2fa-11e4-923c-0a9569605dad.png)
[Demo](http://unleash.herokuapp.com/) instance on Heroku

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. In order to make use of unleash you will also need a client implementation.

Known client implementations:
- [unleash-client-java](https://github.com/finn-no/unleash-client-java)
- [unleash-client-node](https://github.com/finn-no/unleash-client-node)

## Project details
- [Project Roadmap](https://github.com/finn-no/unleash/wiki/Roadmap)

## Run with docker
We have set up docker-compose to start postgres and the unleash server together. This makes it really fast to start up
unleash locally without setting up a database or node.

You find the docker files inside the `packages/unleash-docker` folder

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

// Build unleash-frontend 
// (yes this is a bit wierd and be easier when we have a release of the frontend artifact).
// You can of course "npm link unleash-frontend" instead 
cd node_modules/unleash-frontend && npm install

// Start server in development
npm start:dev

// Admin dashboard
http://localhost:4242

// Feature API:
http://localhost:4242/api/features

// Execute tests in all packages:
npm test
```

### Making a schema change

1. Create `migrations/sql/NNN-your-migration-name.up.sql` with your change in SQL.
2. Create `migrations/sql/NNN-your-migration-name.down.sql` with the rollback of your change in SQL.
3. Run `db-migrate create your-migration-name` and edit the generated file to have this line: `module.exports = require('../scripts/migration-runner').create('NNN-your-migration-name');`
4. Run `db-migrate up`.
5. Generate LB artifact using `scripts/generate-liquibase-artifact` (TODO: make this internal)


### Publishing / Releasing new packages

Please run `npm run nsp` nad `npm run lint` checks before publishing.

Run `npm run publish` to start the publishing process.
Lerna is setup with independent versioning so you will be prompted with version per package, and lerna will update all the versions across packages.

`npm run publish:dry` 
