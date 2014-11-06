# unleash-server [![Build Status](https://travis-ci.org/finn-no/unleash.svg?branch=master)](https://travis-ci.org/finn-no/unleash) [![Code Climate](https://codeclimate.com/github/finn-no/unleash/badges/gpa.svg)](https://codeclimate.com/github/finn-no/unleash) [![Coverage Status](https://coveralls.io/repos/finn-no/unleash/badge.png?branch=master)](https://coveralls.io/r/finn-no/unleash?branch=master) [![Dependency Status](https://david-dm.org/finn-no/unleash.png)](https://david-dm.org/finn-no/unleash) [![devDependency Status](https://david-dm.org/finn-no/unleash/dev-status.png)](https://david-dm.org/finn-no/unleash#info=devD)

unleash-server is a place to ask for the status of features.

### Create a local unleash-db on postgres

```bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
SQL
```

Then set up your DATABASE_URI env.var:
```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
```

## Important commands:

```
// Install dependencies
npm install

// Make sure DATABASE_URL is set and run migrations in your local DB
./node_modules/.bin/db-migrate up

// Start server in dev-mode:
npm run start-dev

// Admin dashboard
http://localhost:4242

// Feature API:
http://localhost:4242/features

// Execute tests:
npm test
```

## Making a schema change

1. Create `migrations/sql/NNN-your-migration-name.up.sql` with your change in SQL.
2. Create `migrations/sql/NNN-your-migration-name.down.sql` with the rollback of your change in SQL.
3. Run `db-migrate create your-migration-name` and edit the generated file to run the above SQL files.
4. Run `npm run db-migrate-up`.
5. Generate LB artifact using `scripts/generate-liquibase-artifact` (TODO: make this internal)

## Clients
In order to make use of unleash you will probably need a client implementation. 

Known client implementations: 
- [unleash-client-java](https://github.com/finn-no/unleash-client-java)
