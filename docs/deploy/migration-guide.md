---
id: migration_guide
title: Migration Guide
---

Generally, the intention is that `unleash-server` should always provide support for clients one major version lower than the current one. This should make it possible to upgrade `unleash` gradually.

## Upgrading from v3.x to v4.x

(**Work In Progress**: Will be finalized when we release the official v4 version).

Before you upgrade we strongly recommends that you take a full [database backup](/database_backup), to make sure you can downgrade to version 3.

### 1. Role-based Access Control (RBAC)

We have implemented RBAC in Unleash v4. This has totally changed the permission system in Unleash.

**Required actions:** If you have implemented "custom authentication" for your users you will need to make changes to your integration:

- _extendedPermissions_ option has been removed. You can no longer specify custom permission per-user basis. All "logged_in users" must belong to a "root" role. This can be "Admin", "Editor" or "Viewer". This is taken care of when you create new users via userService.
- All "logged-in users" needs to be defined in Unleash and have a unique ID. This can be achieved by calling "createUser" on "userService".

Code example:

```js
const user = userService.loginUserWithoutPassword(
  'some@getunleash.io',
  false, // autoCreateUser. Set to true if you want to create users on the fly.
);

// The user needs to be set on the current active session
req.session.user = user;
```

### 3. Legacy v2 routes removed

Only relevant if you use the `enableLegacyRoutes` option.

In v2 you could query feature toggles on `/api/features`. This was deprecated in v4 and we introduced two different endpoints (`/api/admin/features` and `/api/client/features`) to be able to optimize performance and security. In v3 you could still enable the legacy routes via the `enableLegacyRoutes` option. This was removed in v4.

## Upgrading from v2.x to v3.x

The notable change introduced in Unleash v3.x is a strict separation of API paths for client requests and admin requests. This makes it easier to implement different authentication mechanisms for the admin UI and all unleash-clients. You can read more about [securing unleash](https://github.com/Unleash/unleash/blob/master/docs/securing-unleash.md).

The recommended approach is to first upgrade the `unleash-server` to v3 (which still supports v2 clients). After this is done, you should upgrade all your clients to v3.

After upgrading all your clients, you should consider turning off legacy routes, used by v2 clients. Read more about this option in the [Getting started guide](https://github.com/Unleash/unleash/blob/master/docs/getting-started.md#2-or-programmatically).

## Upgrading from v1.0 to v2.0

### Caveat 1: Not used db-migrate to migrate the Unleash database?

In FINN we used liquibase, for internal reasons, to migrate our database.  
Because unleash from version 2.0 migrates the database internally, with db-migrate, you need to make sure that all previous migrations for version 1 exist, so that Unleash does not try to create already existing tables.

#### How to check?

If you don't have a "migrations" table with _7 unique migrations_ you are affected by this.

#### How to fix?

Before starting unleash version 2 you have to run the SQL located under `scripts/fix-migrations-version-1.sql`

### Caveat 2: databaseUrl (not database*Uri*)

Using Unleash as a library and injecting your own config? Then you should know that we changed the `databaseUri` config param name to **databaseUrl**. This is to make sure the param is aligned with the environment variable `DATABASE_URL` and avoid multiple names for the same config param.
