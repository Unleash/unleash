# Migrations guide

## Upgrading from v1.0 to 2.0

### Caveat 1: Not used db-migrate to migrate the unleash database
In FINN we used, for internal reasons, liquebase to migrate our database.  
Because unleash from version 2.0 migrates the datbase internally, with db-migrate, 
you need to make sure that all previous migrations for version 1 exists, so unleash
does not try to create tables that already exists. 

#### How to check?
If you don't a "migrations" table with _7 unique migrations_ you are affected by this. 

#### How to fix?
Before starting unleash version 2 you have to run the SQL located under `scripts/fix-migrations-version-1.sql`

### Caveat 2: databaseUrl (not database*Uri*)
Using unleash as a lib and injecting your own config? Then you should know that we changed the databaseUri config param name to **databaseUrl**. This to align it with the environment variable (DATABASE_URL), avoiding multiple names for same config param. 
