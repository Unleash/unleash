\set ON_ERROR_STOP on

DO
$$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'unleash_user') THEN
      CREATE ROLE unleash_user LOGIN PASSWORD 'password';
   END IF;
END
$$;

ALTER ROLE unleash_user CREATEDB;

SELECT 'CREATE DATABASE unleash WITH OWNER unleash_user'
 WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'unleash');
\gexec

SELECT 'CREATE DATABASE unleash_test WITH OWNER unleash_user'
 WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'unleash_test');
\gexec

SELECT 'ALTER DATABASE unleash_test SET timezone TO ''UTC'''
 WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = 'unleash_test');
\gexec
