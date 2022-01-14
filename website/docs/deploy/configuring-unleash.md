---
id: configuring_unleash
title: Configuring Unleash
---

> This is the guide on how to configure **Unleash v4 self-hosted**. If you are still using Unleash v3 you should checkout [configuring Unleash v3](./configuring_unleash_v3)

## Must configure

### Database details {#database-details}

In order for Unleash server to work, you must setup database connection details.

- If using docker, use environment variables
  - `DATABASE_HOST` - the database hostname - defaults to `localhost`
  - `DATABASE_PORT` - the port the database is listening on - defaults to `5432`
  - `DATABASE_USERNAME` - the user configured for access - defaults to `unleash_user`
  - `DATABASE_PASSWORD` - the password for the user - defaults to `passord`
  - `DATABASE_NAME` - the name of the database - defaults to `unleash`
  - `DATABASE_SSL` - a json object representing SSL configuration or `false` for not using SSL
  - `DATABASE_SCHEMA` - Which schema to use - defaults to `public`
- We also support `DATABASE_URL` see [libpq's doc](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) for full format explanation. In short: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`
- If you're using secret files from kubernetes and would like to load a `DATABASE_URL` format from a file, use `DATABASE_URL_FILE` and point it to a path containing a connection URL.

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
  - initApiTokens: (ApiTokens[]) - Array of API tokens to create on startup. The tokens will only be created if the database doesn't already contain any API tokens.
      Example:
     ```ts
     [{
        environment: '*',
        project: '*',
        secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
        type: ApiTokenType.ADMIN,
        username: 'some-user',
    }]
     ```
      The tokens can be of any API token type. Note that _admin_ tokens **must** target all environments and projects (i.e. use `'*'` for `environments` and `project` and start the secret with `*:*.`).

      You can also use the environment variable `INIT_ADMIN_API_TOKENS` to create API tokens on startup. This variable should be set to a comma-separated list of API tokens to initialize (for instance `*:*.some-random-string, *:*.some-other-token`). With the environment variable, all tokens will be created as admin tokens and Unleash will assign a username automatically.
- **databaseUrl** - (_deprecated_) the postgres database url to connect to. Only used if _db_ object is not specified, and overrides the _db_ object and any environment variables that change parts of it (like `DATABASE_SSL`). Should include username/password. This value may also be set via the `DATABASE_URL` environment variable. Alternatively, if you would like to read the database url from a file, you may set the `DATABASE_URL_FILE` environment variable with the full file path. The contents of the file must be the database url exactly.
- **db** - The database configuration object taking the following properties:
  - _user_ - the database username (`DATABASE_USERNAME`)
  - _password_ - the database password (`DATABASE_PASSWORD`)
  - _host_ - the database hostname (`DATABASE_HOST`)
  - _port_ - the database port defaults to 5432 (`DATABASE_PORT`)
  - _database_ - the database name to be used (`DATABASE_NAME`)
  - _ssl_ - an object describing ssl options, see https://node-postgres.com/features/ssl (`DATABASE_SSL`, as a stringified json object)
  - _schema_ - the postgres database schema to use. Defaults to 'public'. (`DATABASE_SCHEMA`)
  - _version_ - the postgres database version. Used to connect a non-standard database. Defaults to `undefined`, which let the underlying adapter to detect the version automatically. (`DATABASE_VERSION`)
  - _pool_ - an object describing pool options, see https://knexjs.org/#Installation-pooling. We support the following three fields:
    - _min_ - minimum connections in connections pool (defaults to 0) (`DATABASE_POOL_MIN`)
    - _max_ - maximum connections in connections pool (defaults to 4) (`DATABASE_POOL_MAX`)
    - _idleTimeoutMillis_ - time in milliseconds a connection must be idle before being marked as a candidate for eviction (defaults to 30000) (`DATABASE_POOL_IDLE_TIMEOUT_MS`)
- **disableLegacyFeaturesApi** (boolean) - whether to disable the [legacy features API](../api/admin/feature-toggles-api.md). Defaults to `false` (`DISABLE_LEGACY_FEATURES_API`). Introduced in Unleash 4.6.
- **email** - the email object configuring an SMTP server for sending welcome mails and password reset mails
  - `host` - The server URL to your SMTP server
  - `port` - Which port the SMTP server is running on. Defaults to 465 (Secure SMTP)
  - `secure` (boolean) - Whether to use SMTPS or not.
  - `sender` - Which email should be set as sender of mails being sent from Unleash?
  - `smtpuser` - Username for your SMTP server
  - `smtppass` - Password for your SMTP server
- **eventHook** (`function(event, data)`) - If provided, this function will be invoked whenever a feature is mutated. The possible values for `event` are `'feature-created'`, `'feature-updated'`, `'feature-archived'`, `'feature-revived'`. The `data` argument contains information about the mutation. Its fields are `type` (string) - the event type (same as `event`); `createdBy` (string) - the user who performed the mutation; `data` - the contents of the change. The contents in `data` differs based on the event type; For `'feature-archived'` and `'feature-revived'`, the only field will be `name` - the name of the feature. For `'feature-created'` and `'feature-updated'` the data follows a schema defined in the code [here](https://github.com/Unleash/unleash/blob/master/src/lib/services/feature-schema.js#L65). See an [api here](/api/admin/events).
- **getLogger** (function) - Used to register a [custom log provider](#how-do-i-configure-the-log-output).
- **logLevel** (`debug` | `info` | `warn` | `error` | `fatal`) - The lowest level to log at, also configurable using environment variable `LOG_LEVEL`.
- **preHook** (function) - this is a hook if you need to provide any middlewares to express before `unleash` adds any. Express app instance is injected as first argument.
- **preRouterHook** (function) - use this to register custom express middlewares before the `unleash` specific routers are added.
- **secureHeaders** (boolean) - use this to enable security headers (HSTS, CSP, etc) when serving Unleash from HTTPS. Can also be configured through the environment variable `SECURE_HEADERS`.
- **server** - The server config object taking the following properties
  - _port_ - which port the unleash-server should bind to. If port is omitted or is 0, the operating system will assign an arbitrary unused port. Will be ignored if pipe is specified. This value may also be set via the `HTTP_PORT` environment variable
  - _host_ - which host the unleash-server should bind to. If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise. This value may also be set via the `HTTP_HOST` environment variable
  - _pipe_ - parameter to identify IPC endpoints. See https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections for more details
  - _serverMetrics_ (boolean) - use this option to turn on/off prometheus metrics.
  - _baseUriPath_ (string) - use to register a base path for all routes on the application. For example `/my/unleash/base` (note the starting /). Defaults to `/`. Can also be configured through the environment variable `BASE_URI_PATH`.
  - _unleashUrl_ (string) - Used to specify the official URL this instance of Unleash can be accessed at for an end user. Can also be configured through the environment variable `UNLEASH_URL`.
  - _gracefulShutdownEnable_: (boolean) - Used to control if Unleash should shutdown gracefully (close connections, stop tasks,). Defaults to true. `GRACEFUL_SHUTDOWN_ENABLE`
  - _gracefulShutdownTimeout_: (number) - Used to control the timeout, in milliseconds, for shutdown Unleash gracefully. Will kill all connections regardless if this timeout is exceeded. Defaults to 1000ms `GRACEFUL_SHUTDOWN_TIMEOUT`
- **ui** (object) - Set of UI specific overrides. You may set the following keys: `environment`, `slogan`.
- **versionCheck** - the object deciding where to check for latest version
  - `url` - The url to check version (Defaults to `https://version.unleash.run`) - Overridable with (`UNLEASH_VERSION_URL`)
  - `enable` - Whether version checking is enabled (defaults to true) - Overridable with (`CHECK_VERSION`) (if anything other than `true`, does not check)

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

## Database pooling connection timeouts {#database-pooling-connection-timeouts}

- Please be aware of the default values of connection pool about idle session handling.
- If you have a network component which closes idle sessions on tcp layer, please ensure, that the connection pool idleTimeoutMillis setting is lower than the timespan as the network component will close the idle connection.
