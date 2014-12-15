#!/bin/bash
export POSTGRES_PASSWORD="uleash"

echo "starting postgres in docker "

HASH=`docker run -p 0.0.0.0:15432:5432 --name unleash-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d postgres:9.3`

# ----------- Wait for postgres to start -----------
for i in `seq 1 120`;
do
  echo -n "."
  sleep 1
  netcat -z experimental-docker.finntech.no 15432 && echo "postgres is up and running in docker in $i seconds!" && break
done

if [ -z "$DOCKER_HOST" ]
  then
    export database_host="127.0.0.1"
else
  export database_host=$(echo $DOCKER_HOST |awk -F \/ '{print $NF}'| awk -F \: '{print $1}')
fi
export TEST_DATABASE_URL=postgres://postgres:unleash@$database_host:15432/postgres

npm install
DATABASE_URL=$TEST_DATABASE_URL ./node_modules/.bin/db-migrate up
npm test
docker stop $HASH
docker rm $HASH
