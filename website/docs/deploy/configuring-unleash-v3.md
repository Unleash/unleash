---
id: configuring_unleash_v3
title: Configuring Unleash
---

> This is the guide on how to configure **Unleash v3 self-hosted**. If you are using Unleash v4 you should checkout [configuring Unleash](./configuring_unleash)

In order to customize "anything" in Unleash you need to use [Unleash from Node.js](./getting_started#option-two---from-nodejs):

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

- **db** - The database configuration object taking the following properties:
  - _user_ - the database username (`DATABASE_USERNAME`)
  - _password_ - the database password (`DATABASE_PASSWORD`)
  - _host_ - the database hostname (`DATABASE_HOST`)
  - _port_ - the database port defaults to 5432 (`DATABASE_PORT`)
  - _database_ - the database name to be used (`DATABASE_NAME`)
  - _ssl_ - an object describing ssl options, see https://node-postgres.com/features/ssl (`DATABASE_SSL`, as a stringified json object)
  - _version_ - the postgres database version. Used to connect a non-standard database. Defaults to `undefined`, which let the underlying adapter to detect the version automatically. (`DATABASE_VERSION`)
  - _pool_ - an object describing pool options, see https://knexjs.org/guide/#pool. We support the following four fields:
    - _min_ - minimum connections in connections pool (defaults to 0) (`DATABASE_POOL_MIN`)
    - _max_ - maximum connections in connections pool (defaults to 4) (`DATABASE_POOL_MAX`)
    - _idleTimeoutMillis_ - time in milliseconds a connection must be idle before being marked as a candidate for eviction (defaults to 30000) (`DATABASE_POOL_IDLE_TIMEOUT_MS`)
    - _afterCreate_ - a callback for for configuring active connections, see https://knexjs.org/guide/#aftercreate. This is incompatible with the `ALLOW_NON_STANDARD_DB_DATES` environment variable, which will override this property to support non-standard Postgres date formats. If you've set your Postgres instance to use a date style other than `ISO, DMY` then you'll need to set the `ALLOW_NON_STANDARD_DB_DATES` environment variable to `true`. Setting the environment variable should be preferred over writing your own callback.
- **databaseUrl** - (_deprecated_) the postgres database url to connect to. Only used if _db_ object is not specified, and overrides the _db_ object and any environment variables that change parts of it (like `DATABASE_SSL`). Should include username/password. This value may also be set via the `DATABASE_URL` environment variable. Alternatively, if you would like to read the database url from a file, you may set the `DATABASE_URL_FILE` environment variable with the full file path. The contents of the file must be the database url exactly.
- **databaseSchema** - the postgres database schema to use. Defaults to 'public'. (`DATABASE_SCHEMA`)
- **port** - which port the unleash-server should bind to. If port is omitted or is 0, the operating system will assign an arbitrary unused port. Will be ignored if pipe is specified. This value may also be set via the `HTTP_PORT` environment variable
- **host** - which host the unleash-server should bind to. If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise. This value may also be set via the `HTTP_HOST` environment variable
- **pipe** - parameter to identify IPC endpoints. See https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections for more details
- **enableLegacyRoutes** (boolean) - allows you to turn on/off support for legacy routes to support older clients. Disabled by default. Will be removed in 4.x.
- **serverMetrics** (boolean) - use this option to turn on/off prometheus metrics.
- **preHook** (function) - this is a hook if you need to provide any middlewares to express before `unleash` adds any. Express app instance is injected as first argument.
- **preRouterHook** (function) - use this to register custom express middlewares before the `unleash` specific routers are added. This is typically how you would register custom middlewares to handle authentication.
- **adminAuthentication** (string) - use this when implementing custom admin authentication [securing-unleash](./securing-unleash.md). Possible values are:
  - `none` - will disable authentication altogether
  - `unsecure` - (default) will use simple cookie based authentication. UI will require the user to specify an email in order to use unleash.
  - `custom` - use this when you implement your own custom authentication logic.
- **ui** (object) - Set of UI specific overrides. You may set the following keys: `headerBackground`, `environment`, `slogan`.
- **getLogger** (function) - Used to register a [custom log provider](#how-do-i-configure-the-log-output).
- **eventHook** (`function(event, data)`) - If provided, this function will be invoked whenever a feature is mutated. The possible values for `event` are `'feature-created'`, `'feature-updated'`, `'feature-archived'`, `'feature-revived'`. The `data` argument contains information about the mutation. Its fields are `type` (string) - the event type (same as `event`); `createdBy` (string) - the user who performed the mutation; `data` - the contents of the change. The contents in `data` differs based on the event type; For `'feature-archived'` and `'feature-revived'`, the only field will be `name` - the name of the feature. For `'feature-created'` and `'feature-updated'` the data follows [this schema defined in the source code](https://github.com/Unleash/unleash/blob/a06d2c04bb0d83d9c8c5bf2a90e9dace50f0b10a/lib/routes/admin-api/feature-schema.js#L38-L59). See an [api here](/api/admin/events).
- **baseUriPath** (string) - use to register a base path for all routes on the application. For example `/my/unleash/base` (note the starting /). Defaults to `/`. Can also be configured through the environment variable `BASE_URI_PATH`.
- **unleashUrl** (string) - Used to specify the official URL this instance of Unleash can be accessed at for an end user. Can also be configured through the environment variable `UNLEASH_URL`.
- **secureHeaders** (boolean) - use this to enable security headers (HSTS, CSP, etc) when serving Unleash from HTTPS. Can also be configured through the environment variable `SECURE_HEADERS`.
- **checkVersion** - the checkVersion object deciding where to check for latest version
  - `url` - The url to check version (Defaults to `https://version.unleash.run`) - Overridable with (`UNLEASH_VERSION_URL`)
  - `enable` - Whether version checking is enabled (defaults to true) - Overridable with (`CHECK_VERSION`) (if anything other than `true`, does not check)

### Disabling Auto-Start {#disabling-auto-start}

If you're using Unleash as part of a larger express app, you can disable the automatic server start by calling `server.create`. It takes the same options as `server.start`, but will not begin listening for connections.

```js
const unleash = require('unleash-server');
// ... const app = express();

unleash
  .create({
    databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
    port: 4242,
  })
  .then((result) => {
    app.use(result.app);
    console.log(`Unleash app generated and attached to parent application`);
  });
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
