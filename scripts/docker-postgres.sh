#!/bin/bash
set -e

export POSTGRES_PASSWORD="uleash"

function getDockerDBPort() {
  case "$OSTYPE" in
  darwin*) echo `docker ps| grep unleash-post| awk '{print $(NF-1)}'| awk -F "->" '{print $1}'| awk -F \: '{print $4}'`;;
  # solaris*) echo "SOLARIS" ;;
  # linux*)   echo "LINUX" ;;
  # bsd*)     echo "BSD" ;;
  # msys*)    echo "WINDOWS" ;;
  # cygwin*)  echo "ALSO WINDOWS" ;;
  *) echo `docker ps| grep unleash-post| awk '{print $(NF-1)}'| awk -F "->" '{print $1}'| awk -F \: '{print $2}'`;;
  esac
}

if docker ps | grep unleash-postgres > /dev/null; then
  echo "unleash-postgress is already running"
else
  echo "starting postgres in docker "
  HASH=`docker run -P --name unleash-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d postgres:10`
fi

export PGPORT=$(getDockerDBPort)
if [ -z "$PGPORT" ]; then
  echo "could not find PGPORT! is postgres running?"
  exit 1
fi
echo "PGPORT: $PGPORT"
echo ""

echo "Waiting for postgres to start..."

function isPostgresAvailable() {
  echo "polling $1:$2"

  case "$OSTYPE" in
  darwin*) nc -z $1 $2;;
  # solaris*) echo "SOLARIS" ;;
  # linux*)   echo "LINUX" ;;
  # bsd*)     echo "BSD" ;;
  # msys*)    echo "WINDOWS" ;;
  # cygwin*)  echo "ALSO WINDOWS" ;;
  *) netcat -z $1 $2;;
  esac
}

if [ -z "$DOCKER_HOST" ]
  then
    export database_host="127.0.0.1"
else
  export database_host=$(echo $DOCKER_HOST |awk -F \/ '{print $NF}'| awk -F \: '{print $1}')
fi

export TEST_DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@$database_host:$PGPORT/postgres

for i in `seq 1 120`;
do
  # echo -n "."
  sleep 1
  isPostgresAvailable $database_host $PGPORT && echo "postgres is up and running in docker in $i seconds!" && break
done

echo "running migrations..."
DATABASE_URL=$TEST_DATABASE_URL npm run db-migrate -- up

echo "running tests..."
yarn test

echo "cleanup..."
docker stop $HASH
docker rm $HASH

echo "done"
