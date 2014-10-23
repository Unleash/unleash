# unleash-server [![Build Status](https://travis-ci.org/finn-no/unleash.svg?branch=master)](https://travis-ci.org/finn-no/unleash) [![Code Climate](https://codeclimate.com/github/finn-no/unleash/badges/gpa.svg)](https://codeclimate.com/github/finn-no/unleash)
unleash-server is a place to ask for the status of features.

## Important commands:

```
// Set up DB
cp config/database.example.json config/database.json
npm run db-setup

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

### Create a local unleash-db on postgres
´´´bash
$ psql postgres <<SQL
CREATE USER unleash_user WITH PASSWORD 'passord';
CREATE DATABASE unleash;
GRANT ALL PRIVILEGES ON DATABASE unleash to unleash_user;
SQL
´´´

Then set up your DATABASE_URI env.var:
```
export DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash
```
