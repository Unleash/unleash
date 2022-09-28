---
id: configuring_unleash
title: Configuring Unleash
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

> This is the guide on how to configure **Unleash v4 self-hosted**. If you are still using Unleash v3 you should checkout [configuring Unleash v3](./configuring_unleash_v3)

## Must configure

### Database

In order for Unleash server to work, you need a running database and its connection details. See the [database configuration section](#database-configuration) for the available options and configuration details.

## Nice to configure

### Unleash URL {#unleash-url}

- Configured with `UNLEASH_URL` ** Should be set to the public discoverable URL of your instance, so if your instance is accessed by your users at `https://unleash.mysite.com` use that. ** If you're deploying this to a subpath, include the subpath in this. So `https://mysite.com/unleash` will also be correct.
- Used to create
  - Reset password URLs
  - Welcome link for new users
  - Links in events for our Slack, Microsoft Teams and Datadog addons

### Email server details {#email-server-details}

Used to send reset-password mails and welcome mails when onboarding new users. <br /> **NOTE** - If this is not configured, you will not be able to allow your users to reset their own passwords.

For [more details, see here](./email.md)

## Further customization

In order to customize "anything" in Unleash you need to use [Unleash from Node.js](./getting_started#option-two---from-nodejs) or start the [docker image](./getting_started#option-one---use-docker) with environment variables.

```js
const unleash = require('unleash-server');

const unleashOptions = {
  db: {
    user: 'unleash_user',
    password: 'passord',
    host: 'localhost',
    port: 5432,
    database: 'unleash',
    ssl: false,
    pool: {
      min: 0,
      max: 4,
      idleTimeoutMillis: 30000,
    },
  },
  enableRequestLogger: true,
};

unleash.start(unleashOptions);
```

**Available Unleash options include:**

- **authentication** - (object) - An object for configuring/implementing custom admin authentication

  - enableApiToken (boolean) - Should unleash require API tokens for access? Defaults to `true`
  - type (string) What kind of authentication to use. Possible values
    - `open-source` - Sign in with username and password. This is the default value.
    - `custom` - If implementing your own authentication hook, use this
    - `none` - Turn off authentication all together
    - `demo` - Only requires an email to sign in (was default in v3)
  - customAuthHandler: (function) - custom express middleware handling authentication. Used when type is set to `custom`
  - createAdminUser: (boolean) - whether to create an admin user with default password - Defaults to `true`
  - initApiTokens: (ApiTokens[]) - Array of API tokens to create on startup. The tokens will only be created if the database doesn't already contain any API tokens. Example:

    ```ts
    [
      {
        environment: '*',
        project: '*',
        secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
        type: ApiTokenType.ADMIN,
        username: 'some-user',
      },
    ];
    ```

    The tokens can be of any API token type. Note that _admin_ tokens **must** target all environments and projects (i.e. use `'*'` for `environments` and `project` and start the secret with `*:*.`).

    You can also use the environment variables `INIT_ADMIN_API_TOKENS` or `INIT_CLIENT_API_TOKENS` to create API admin or client tokens on startup. Both variables require a comma-separated list of API tokens to initialize (for instance `*:*.some-random-string, *:*.some-other-token`). The tokens found in `INIT_ADMIN_API_TOKENS` and `INIT_CLIENT_API_TOKENS` will be created as admin and client tokens respectively and Unleash will assign a username automatically.

- **databaseUrl** - (_deprecated_) the postgres database url to connect to. Only used if _db_ object is not specified, and overrides the _db_ object and any environment variables that change parts of it (like `DATABASE_SSL`). Should include username/password. This value may also be set via the `DATABASE_URL` environment variable. Alternatively, if you would like to read the database url from a file, you may set the `DATABASE_URL_FILE` environment variable with the full file path. The contents of the file must be the database url exactly.
- **db** - The database configuration object. See [the database configuration section](#database-configuration) for a full overview of the available properties.
- **disableLegacyFeaturesApi** (boolean) - whether to disable the [legacy features API](../api/admin/feature-toggles-api.md). Defaults to `false` (`DISABLE_LEGACY_FEATURES_API`). Introduced in Unleash 4.6.
- **email** - the email object configuring an SMTP server for sending welcome mails and password reset mails
  - `host` - The server URL to your SMTP server
  - `port` - Which port the SMTP server is running on. Defaults to 465 (Secure SMTP)
  - `secure` (boolean) - Whether to use SMTPS or not.
  - `sender` - Which email should be set as sender of mails being sent from Unleash?
  - `smtpuser` - Username for your SMTP server
  - `smtppass` - Password for your SMTP server
- **eventHook** (`function(event, data)`) - (_deprecated in Unleash 4.3_ in favor of the [Webhook addon](../addons/webhook.md)) If provided, this function will be invoked whenever a feature is mutated. The possible values for `event` are `'feature-created'`, `'feature-archived'` and `'feature-revived'`. The `data` argument contains information about the mutation. Its fields are `type` (string) - the event type (same as `event`); `createdBy` (string) - the user who performed the mutation; `data` - the contents of the change. The contents in `data` differs based on the event type; For `'feature-archived'` and `'feature-revived'`, the only field will be `name` - the name of the feature. For `'feature-created'` the data follows a schema defined in the code [here](https://github.com/Unleash/unleash/blob/7b7f0b84e8cddd5880dcf29c231672113224b9a7/src/lib/schema/feature-schema.ts#L77). See an [api here](/api/admin/events).
- **getLogger** (function) - Used to register a [custom log provider](#how-do-i-configure-the-log-output).
- **logLevel** (`debug` | `info` | `warn` | `error` | `fatal`) - The lowest level to log at, also configurable using environment variable `LOG_LEVEL`.
- **preHook** (function) - this is a hook if you need to provide any middlewares to express before `unleash` adds any. Express app instance is injected as first argument.
- **preRouterHook** (function) - use this to register custom express middlewares before the `unleash` specific routers are added.
- **secureHeaders** (boolean) - use this to enable security headers (HSTS, CSP, etc) when serving Unleash from HTTPS. Can also be configured through the environment variable `SECURE_HEADERS`.
- **additionalCspAllowedDomains** (CspAllowedDomains) - use this when you want to enable security headers but have additional domains you need to allow traffic to
  - You can set the environment variable CSP_ALLOWED_DEFAULT to allow new defaultSrc (comma separated list)
  - You can set the environment variable CSP_ALLOWED_FONT to allow new fontSrc (comma separated list)
  - You can set the environment variable CSP_ALLOWED_STYLE to allow new styleSrc (comma separated list)
  - You can set the environment variable CSP_ALLOWED_SCRIPT to allow new scriptSrc (comma separated list)
  - You can set the environment variable CSP_ALLOWED_IMG to allow new imgSrc (comma separated list)
- **server** - The server config object taking the following properties
  - _port_ - which port the unleash-server should bind to. If port is omitted or is 0, the operating system will assign an arbitrary unused port. Will be ignored if pipe is specified. This value may also be set via the `HTTP_PORT` environment variable
  - _host_ - which host the unleash-server should bind to. If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise. This value may also be set via the `HTTP_HOST` environment variable
  - _pipe_ - parameter to identify IPC endpoints. See https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections for more details
  - _serverMetrics_ (boolean) - use this option to turn on/off prometheus metrics.
  - _baseUriPath_ (string) - use to register a base path for all routes on the application. For example `/my/unleash/base` (note the starting /). Defaults to `/`. Can also be configured through the environment variable `BASE_URI_PATH`.
  - _unleashUrl_ (string) - Used to specify the official URL this instance of Unleash can be accessed at for an end user. Can also be configured through the environment variable `UNLEASH_URL`.
  - _gracefulShutdownEnable_: (boolean) - Used to control if Unleash should shutdown gracefully (close connections, stop tasks,). Defaults to true. `GRACEFUL_SHUTDOWN_ENABLE`
  - _gracefulShutdownTimeout_: (number) - Used to control the timeout, in milliseconds, for shutdown Unleash gracefully. Will kill all connections regardless if this timeout is exceeded. Defaults to 1000ms `GRACEFUL_SHUTDOWN_TIMEOUT`
- **session** - The session config object takes the following options:
  - _ttlHours_ (number) - The number of hours a user session is allowed to live before a new sign-in is required. Defaults to 48 hours. `SESSION_TTL_HOURS`
  - _clearSiteDataOnLogout_ (boolean) - When `true`, a logout action will return a Clear Site Data response header instructing the browser to clear all cookies on the same domain Unleash is running on. If disabled unleash will only destroy and clear the session cookie. Defaults to _true_. `SESSION_CLEAR_SITE_DATA_ON_LOGOUT`
  - _cookieName_ - Name of the cookies used to hold the session id. Defaults to 'unleash-session'.
- **ui** (object) - Set of UI specific overrides. You may set the following keys: `environment`, `slogan`.
- **versionCheck** - the object deciding where to check for latest version
  - `url` - The url to check version (Defaults to `https://version.unleash.run`) - Overridable with (`UNLEASH_VERSION_URL`)
  - `enable` - Whether version checking is enabled (defaults to true) - Overridable with (`CHECK_VERSION`) (if anything other than `true`, does not check)
- **environmentEnableOverrides** - A list of environment names to force enable at startup. This is feature should be used with caution. When passed a list, this will enable each environment in that list and disable all other environments. You can't use this to disable all environments, passing an empty list will do nothing. If one of the given environments is not already enabled on startup then it will also enable projects and toggles for that environment. Note that if one of the passed environments doesn't already exist this will do nothing aside from log a warning.
- **clientFeatureCaching** - configuring memoization of the /api/client/features endpoint
  - `enabled` - set to true by default - Overridable with (`CLIENT_FEATURE_CACHING_ENABLED`)
  - `maxAge` - the time to cache features, set to 600 milliseconds by default - Overridable with (`CLIENT_FEATURE_CACHING_MAXAGE`) ) (accepts milliseconds)
- **frontendApi** - Configuration options for the [Unleash front-end API](../reference/front-end-api.md).
  - `refreshIntervalInMs` - how often (in milliseconds) front-end clients should refresh their data from the cache. Overridable with the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable.

You can also set the environment variable `ENABLED_ENVIRONMENTS` to a comma delimited string of environment names to override environments.

### Disabling Auto-Start {#disabling-auto-start}

If you're using Unleash as part of a larger express app, you can disable the automatic server start by calling `server.create`. It takes the same options as `server.start`, but will not begin listening for connections.

```js
const express = require('express');
const unleash = require('unleash-server');
const app = express();

const start = async () => {
  const instance = await unleash.create({
    databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
  });
  app.use(instance.app);
  console.log(`Unleash app generated and attached to parent application`);
};

start();
```

### Graceful shutdown {#shutdown-unleash}

> PS! Unleash will listen for the `SIGINT` signal and automatically trigger graceful shutdown of Unleash.

If you need to stop Unleash (close database connections, and stop running Unleash tasks) you may use the stop function. Be aware that it is not possible to restart the Unleash instance after stopping it, but you can create a new instance of Unleash.

```js
const express = require('express');
const unleash = require('unleash-server');
const app = express();

const start = async () => {
  const instance = await unleash.start({
    databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
    port: 4242,
  });

  //Sometime later
  await instance.stop();
  console.log('Unleash has now stopped');
};

start();
```

## Securing Unleash {#securing-unleash}

You can integrate Unleash with your authentication provider (OAuth 2.0). Read more about [securing unleash](./securing-unleash.md).

## How do I configure the log output? {#how-do-i-configure-the-log-output}

By default, `unleash` uses [log4js](https://github.com/nomiddlename/log4js-node) to log important information. It is possible to swap out the logger provider (only when using Unleash programmatically). You do this by providing an implementation of the **getLogger** function as This enables filtering of log levels and easy redirection of output streams.

```javascript
function getLogger(name) {
  // do something with the name
  return {
    debug: console.log,
    info: console.log,
    warn: console.log,
    error: console.error,
  };
}
```

The logger interface with its `debug`, `info`, `warn` and `error` methods expects format string support as seen in `debug` or the JavaScript `console` object. Many commonly used logging implementations cover this API, e.g., bunyan, pino or winston.

## Database configuration

:::info

In-code configuration values take precedence over environment values: If you provide a database username both via environment variables and in code with the Unleash options object, Unleash will use the in-code username.

:::

You cannot run the Unleash server without a database. You must provide Unleash with database connection details for it to start correctly.

The available options are listed in the table below. Options can be specified either via JavaScript (only when starting Unleash via code) or via environment variables. The "property name" column below gives the name of the property on the Unleash options' `db` object.

| Property name | Environment variable | Default value | Description |
| --- | --- | --- | --- |
| `user` | `DATABASE_USERNAME` | `unleash_user` | The database username. |
| `password` | `DATABASE_PASSWORD` | `passord` | The database password. |
| `host` | `DATABASE_HOST` | `localhost` | The database hostname. |
| `port` | `DATABASE_PORT` | `5432` | The database port. |
| `database` | `DATABASE_NAME` | `unleash` | The name of the database. |
| `ssl` | `DATABASE_SSL` | N/A | An object describing SSL options. In code, provide a regular JavaScript object. When using the environment variable, provide a **stringified JSON object**. |
| `pool` | N/A (use the below variables) |  | An object describing database pool options. With environment variables, use the options below directly. |
| `pool.min` | `DATABASE_POOL_MIN` | 0 | The minimum number of connections in the connection pool. |
| `pool.max` | `DATABASE_POOL_MAX` | 4 | The maximum number of connections in the connection pool. |
| `pool.idleTimeoutMillis` | `DATABASE_POOL_IDLE_TIMEOUT_MS` | 30000 | The amount of time (in milliseconds) that a connection must be idle for before it is marked as a candidate for eviction. |
| `applicationName` | `DATABASE_APPLICATION_NAME` | `unleash` | The name of the application that created this Client instance. |
| `schema` | `DATABASE_SCHEMA` | `public` | The schema to use in the database. |

Alternatively, you can use a [libpq connection string](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) to connect to the database. You can provide it directly or from a file by using one of the below options. In JavaScript, these are top-level properties of the root configuration object, _not_ the `db` object.

| Property name | Environment variable | Default value | Description |
| --- | --- | --- | --- |
| `databaseUrl` | `DATABASE_URL` | N/A | A string that matches the [libpq connection string](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), such as `postgres://USER:PASSWORD@HOST:PORT/DATABASE`. |
| `databaseUrlFile` | `DATABASE_URL_FILE` | N/A | The path to a file that contains a [libpq connection string](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING). |

Below is an example JavaScript configuration object.

```js
const unleashOptions = {
  databaseUrl: 'postgres:/USER:PASSWORD@HOST:PORT/DATABASE',
  databaseUrlFile: '/path/to/file',
  db: {
    user: 'unleash_user',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'unleash',
    ssl: false,
    pool: {
      min: 0,
      max: 4,
      idleTimeoutMillis: 30000,
    },
  },
};
```

### `db.ssl` vs `DATABASE_SSL` options

When initializing Unleash from code, you'll provide the `db.ssl` option as a JavaScript object. As such, any functions will get evaluated before the object is used for configuration. When using the `DATABASE_SSL` environment variable, you must provide the value as a stringified JSON object. The object will get parsed before being used for configuration, but no further evaluation will take place.

If you want to read content from a file, you should either initialize Unleash via JavaScript or manually interpolate the required values into the environment variable:

<Tabs groupId="db-configuration-options">

<TabItem value="js" label="JavaScript" default>

```js title="Reading from the file system in JavaScript"
const unleashOptions = {
  db: {
    // other options omitted for brevity
    ssl: {
      ca: fs.readFileSync('/path/to/server-certificates/root.crt').toString(),
    },
  },
};
```

</TabItem>

<TabItem value="env" label="Environment variables (bash)">

```bash title="Reading from the file system with bash"
DATABASE_SSL="{ \"key\": \"$(cat /path/to/server-certificates/root.crt)\" }"
```

</TabItem>

</Tabs>

### Enabling self-signed certificates

To use self-signed certificates, you should set the SSL property `rejectUnauthorized` to `false` and set the `ca` property to the value of the certificate:

<Tabs groupId="db-configuration-options">

<TabItem value="js" label="JavaScript" default>

```js title="Enable self-signed certificates"
const unleashOptions = {
  db: {
    // other options omitted for brevity
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync('/path/to/server-certificates/root.crt').toString(),
    },
  },
};
```

</TabItem>

<TabItem value="env" label="Environment variables (bash)">

```bash title="Enable self-signed certificates"
DATABASE_SSL="{ \"rejectUnauthorized\": false, \"key\": \"$(cat /path/to/server-certificates/root.crt)\" }"
```

</TabItem>

</Tabs>

Visit [the node-postgres library's SSL section](https://node-postgres.com/features/ssl) for more information.

### Supported Postgres SSL modes

Unleash builds directly on the [node-postgres library](https://node-postgres.com/features/ssl), so we support all the same SSL modes that they support. As of version 8 (released on February 25th 2020), [node-postgres no longer supports all sslmodes](https://node-postgres.com/announcements#2020-02-25). For this reason, Unleash cannot support all of Postgres' SSL modes. Specifically, Unleash **does not support** `sslmode=prefer`. Instead you must know whether you require an SSL connection ahead of time.

### Troubleshooting: database pooling connection timeouts {#database-pooling-connection-timeouts}

- Check the default values of connection pool about idle session handling.

- If you have a network component which closes idle sessions on the TCP layer, make sure that the connection pool's `idleTimeoutMillis` setting is lower than the `timespan` setting. If it isn't, then the network component will close the connection.

### Proxying requests from Unleash

You can configure proxy services that intercept all outgoing requests from Unleash. This lets you use the Microsoft Teams or the Webhook addon for external services, even if the internet can only be reached via a proxy on your machine or container (for example if restricted by a firewall or similiar).

As an example, here's how you could do it using the [node-global-proxy](https://www.npmjs.com/package/node-global-proxy) package:

```
const proxy = require("node-global-proxy").default;

proxy.setConfig({
    http: "http://user:password@url:8080",      //proxy adress, replace values as needed
    //https: "https://user:password@url:1080",  //if a https proxy is needed
  });

proxy.start();      //this starts the proxy, after this call all requests will be proxied
```

Using above code-snippet, every outgoing request from unleash or its addons will be subsequently routed through set proxy. If the proxy routing needs to be bypassed or stopped, its possible to stop it by using

`proxy.stop();`
