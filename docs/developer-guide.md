# Developer Guide

## PostgreSQL
To run and develop unleash you need to have PostgreSQL databse (PostgreSQL v.9.5.x or newer) locally.


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

(Optional as unleash will asume these as default values).

```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
export TEST_DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash_test
```

## PostgreSQL with docker
If you dont want to install PostgreSQL locally you can spin up an instance with docker. 
We have created a script to ease this process: `scripts/docker-postgres.sh`


## Commands

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

## Database changes

We use database migrations to track database changes. 

### Making a schema change

1. Create `migrations/sql/NNN-your-migration-name.up.sql` with your change in SQL.
2. Create `migrations/sql/NNN-your-migration-name.down.sql` with the rollback of your change in SQL.
3. Run `db-migrate create your-migration-name` and edit the generated file to have this line: `module.exports = require('../scripts/migration-runner').create('NNN-your-migration-name');`
4. Run `db-migrate up`.


## Publishing / Releasing new packages

Please run `npm run nsp` nad `npm run lint` checks before publishing.

Run `npm run publish` to start the publishing process.
Lerna is setup with independent versioning so you will be prompted with version per package, and lerna will update all the versions across packages.

`npm run publish:dry` 