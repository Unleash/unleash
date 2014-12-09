#!/bin/bash
export POSTGRES_PASSWORD="uleash"
export DATABASE_URL=postgres://postgres:unleash@127.0.0.1:15432/postgres

HASH=`docker run -p 127.0.0.1:15432:5432 --name unleash-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d postgres:9.3`
npm install
./node_modules/.bin/db-migrate up
npm test
docker stop $HASH
docker rm $HASH

