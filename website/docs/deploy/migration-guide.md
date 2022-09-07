---
id: migration_guide
title: Migration Guide
---

Generally, the intention is that `unleash-server` should always provide support for clients one major version lower than the current one. This should make it possible to upgrade `unleash` gradually.

## Upgrading from v3.x to v4.x {#upgrading-from-v3x-to-v4x}

Before you upgrade we strongly recommend that you take a full [database backup](/deploy/database_backup), to make sure you can downgrade to version 3.

You can also read the highlights of **[what's new in v4](/user_guide/v4-whats-new)**.

### 1. All API calls now requires token. {#1-all-api-calls-now-requires-token}

If you are upgrading from Unleash Open-Source v3 client SDKs did not need to use an API token in order to connect to Unleash-server. Starting from v4 we have back-ported the API token handling for Enterprise in to the Open-Source version. This means that all client SDKs now need to use a client token in order to connect to Unleash.

Read more in the [API token documentation](../user_guide/api-token).

### 2. Configuring Unleash {#2-configuring-unleash}

We have done a lot of changes to the options you can pass in to Unleash. If you are manually configuring Unleash you should have a look on the updated [configuring Unleash documentation](./configuring_unleash)

### 3. Role-based Access Control (RBAC) {#3-role-based-access-control-rbac}

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

- [Read more about Securing Unleash v4](./securing-unleash.md)
- [Read more about RBAC](../user_guide/rbac)

### 4. Legacy v2 routes removed {#4-legacy-v2-routes-removed}

Only relevant if you use the `enableLegacyRoutes` option.

In v2 you could query feature toggles on `/api/features`. This was deprecated in v4 and we introduced two different endpoints (`/api/admin/features` and `/api/client/features`) to be able to optimize performance and security. In v3 you could still enable the legacy routes via the `enableLegacyRoutes` option. This was removed in v4.

### 5. Unleash CLI has been removed {#5-unleash-cli-has-been-removed}

Unleash no longer ships with a binary that allows you to start Unleash directly from the command line. From v4 you need to either use Unleash via docker or programmatically.

Read more in our [getting started documentation](./getting_started)

## Upgrading from v2.x to v3.x {#upgrading-from-v2x-to-v3x}

The notable change introduced in Unleash v3.x is a strict separation of API paths for client requests and admin requests. This makes it easier to implement different authentication mechanisms for the admin UI and all unleash-clients. You can read more about [securing unleash](./securing-unleash.md).

The recommended approach is to first upgrade the `unleash-server` to v3 (which still supports v2 clients). After this is done, you should upgrade all your clients to v3.

After upgrading all your clients, you should consider turning off legacy routes, used by v2 clients. To do this, set the configuration option `enableLegacyRoutes` to `false` as described in the [page on configuring Unleash v3](./configuring-unleash-v3.md).

## Upgrading from v1.0 to v2.0 {#upgrading-from-v10-to-v20}

### Caveat 1: Not used db-migrate to migrate the Unleash database? {#caveat-1-not-used-db-migrate-to-migrate-the-unleash-database}

In FINN we used liquibase, for internal reasons, to migrate our database. Because unleash from version 2.0 migrates the database internally, with db-migrate, you need to make sure that all previous migrations for version 1 exist, so that Unleash does not try to create already existing tables.

#### How to check? {#how-to-check}

If you don't have a "migrations" table with _7 unique migrations_ you are affected by this.

#### How to fix? {#how-to-fix}

Before starting unleash version 2 you have to run the SQL located under `scripts/fix-migrations-version-1.sql`

### Caveat 2: databaseUrl (not database*Uri*) {#caveat-2-databaseurl-not-databaseuri}

Using Unleash as a library and injecting your own config? Then you should know that we changed the `databaseUri` config param name to **databaseUrl**. This is to make sure the param is aligned with the environment variable `DATABASE_URL` and avoid multiple names for the same config param.
