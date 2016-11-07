#!/bin/bash
export POSTGRES_PASSWORD="uleash"

echo "starting postgres in docker "

HASH=`docker run -P --name unleash-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d postgres:9.3`
export PGPORT=`docker ps| grep unleash-post| awk '{print $(NF-1)}'| awk -F "->" '{print $1}'| awk -F \: '{print $2}'`
echo "PGPORT: $PGPORT"
echo ""
# ----------- Wait for postgres to start -----------
if [ -z "$DOCKER_HOST" ]
  then
    export database_host="127.0.0.1"
else
  export database_host=$(echo $DOCKER_HOST |awk -F \/ '{print $NF}'| awk -F \: '{print $1}')
fi
for i in `seq 1 120`;
do
  echo -n "."
  sleep 1
  netcat -z $database_host $PGPORT && echo "postgres is up and running in docker in $i seconds!" && break
done


export TEST_DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@$database_host:$PGPORT/postgres

npm install
DATABASE_URL=$TEST_DATABASE_URL ./node_modules/.bin/db-migrate up
npm test
docker stop $HASH
docker rm $HASH
