# Migrations guide
Generally the intention is that `unleash-server` should always provide support for clients one lower major version. This should make possible to upgrade `unleash` gradually. 


## Upgrading from v2.x to v3.x
The notable change introduced in Unleash v3.x is a strict separation of api paths for client requests and admin requests. This makes it easier to implement different authentication mechanisms for the admin UI and all unleash-clients. You can read more about [securing unleash](https://github.com/Unleash/unleash/blob/master/docs/securing-unleash.md). 

The recommended approach is to first upgrade the `unleash-server` to v3 (which still supports v2 clients). After this is done you should upgrade all your clients to v3. 

After upgrading all your clients you should consider turning off legacy routes, used by v2 clients. Read more about this option in in the [gettings started guide](https://github.com/Unleash/unleash/blob/master/docs/getting-started.md#2-or-programmatically).

## Upgrading from v1.0 to v2.0

### Caveat 1: Not used db-migrate to migrate the unleash database?
In FINN we used, for internal reasons, liquebase to migrate our database.  
Because unleash from version 2.0 migrates the database internally, with db-migrate, 
you need to make sure that all previous migrations for version 1 exists, so unleash
does not try to create tables that already exists. 

#### How to check?
If you don't have a "migrations" table with _7 unique migrations_ you are affected by this. 

#### How to fix?
Before starting unleash version 2 you have to run the SQL located under `scripts/fix-migrations-version-1.sql`

### Caveat 2: databaseUrl (not database*Uri*)
Using unleash as a lib and injecting your own config? Then you should know that we changed the databaseUri config param name to **databaseUrl**. This to align it with the environment variable (DATABASE_URL), avoiding multiple names for same config param. 
