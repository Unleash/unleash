---
id: getting_started
title: Getting Started
---

## Requirements

You will need:

- [**Node.js**](https://nodejs.org/en/download/) (version 12 or later)
- [**PostgreSQL**](https://www.postgresql.org/download/) (version 10 or later)
- [Create an unleash user and database](./developer-guide.md).

## Start Unleash server

Whichever option you choose to start Unleash, you must specify a database URI (it can be set in the environment variable DATABASE_URL).

Once the server has started, you will see the message:
```
Unleash started on http://localhost:4242
```

### Option one - from a terminal/bash shell

```
npm install unleash-server -g
unleash -d postgres://unleash_user:password@localhost:5432/unleash -p 4242
```

### Option two - from Node.js

1. Create a new folder/directory on your development computer.
2. From a terminal/bash shell, install the dependencies:

    ```
    npm init
    npm install unleash-server --save
    ```

3. Create a file called *server.js*, paste the following into it and save.
    ```js
    const unleash = require('unleash-server');

    unleash
      .start({
        databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
        port: 4242,
      })
      .then(unleash => {
        console.log(
          `Unleash started on http://localhost:${unleash.app.get('port')}`,
        );
      });
    ```

4. Run *server.js*:
    ```
    node server.js
    ```

### Option three - use Docker

Launch the [Unleash server Docker image](https://hub.docker.com/r/unleashorg/unleash-server/).

```
docker run -d -e DATABASE_URL=postgres://user:pass@10.200.221.11:5432/unleash unleashorg/unleash-server
```

## Test your server and create a sample API call

Once the Unleash server has started, go to [localhost:4242](http://localhost:4242) in your browser. If you see a list of example feature toggles, try modifying one of them with [curl](https://curl.se/) from a terminal/bash shell:

~~~
curl --location --request PUT 'http://localhost:4242/api/admin/features/Feature.A' --header 'Content-Type: application/json' --data-raw '{\
  "name": "Feature.A",\
  "description": "Dolor sit amet.",\
  "type": "release",\
  "enabled": false,\
  "stale": false,\
  "strategies": [\
    {\
      "name": "default",\
      "parameters": {}\
    }\
  ]\
}'\
~~~
<!-- The following doesn't seem to fit the 'remit' of Getting started'. it would be a better fit in the developer section of the documentation -->
## Unleash server options

Available Unleash options include:

- **db** - The database configuration object taking the following properties:
  - _user_ - the database username (`DATABASE_USERNAME`)
  - _password_ - the database password (`DATABASE_PASSWORD`)
  - _host_ - the database hostname (`DATABASE_HOST`)
  - _port_ - the database port defaults to 5432 (`DATABASE_PORT`)
  - _database_ - the database name to be used (`DATABASE_NAME`)
  - _ssl_ - an object describing ssl options, see https://node-postgres.com/features/ssl (`DATABASE_SSL`, as a stringified json object)
  - _version_ - the postgres database version. Used to connect a non-standard database. Defaults to `undefined`, which let the underlying adapter to detect the version automatically. (`DATABASE_VERSION`)
- **databaseUrl** - the postgres database url to connect to. Only used if _db_ object is not specified. Should include username/password. This value may also be set via the `DATABASE_URL` environment variable. Alternatively, if you would like to read the database url from a file, you may set the `DATABASE_URL_FILE` environment variable with the full file path. The contents of the file must be the database url exactly.
- **databaseSchema** - the postgres database schema to use. Defaults to 'public'.
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
- **getLogger** (function) - Used to register a [custom log provider](#How do I configure the log output).
- **eventHook** (`function(event, data)`) - If provided, this function will be invoked whenever a feature is mutated. The possible values for `event` are `'feature-created'`, `'feature-updated'`, `'feature-archived'`, `'feature-revived'`. The `data` argument contains information about the mutation. Its fields are `type` (string) - the event type (same as `event`); `createdBy` (string) - the user who performed the mutation; `data` - the contents of the change. The contents in `data` differs based on the event type; For `'feature-archived'` and `'feature-revived'`, the only field will be `name` - the name of the feature. For `'feature-created'` and `'feature-updated'` the data follows a schema defined in the code [here](https://github.com/Unleash/unleash/blob/master/lib/routes/admin-api/feature-schema.js#L38-L59). See an example [here](./guides/feature-updates-to-slack.md).
- **baseUriPath** (string) - use to register a base path for all routes on the application. For example `/my/unleash/base` (note the starting /). Defaults to `/`. Can also be configured through the environment variable `BASE_URI_PATH`.
- **secureHeaders** (boolean) - use this to enable security headers (HSTS, CSP, etc) when serving Unleash from HTTPS. Can also be configured through the environment variable `SECURE_HEADERS`.

### Disabling Auto-Start

If you're using Unleash as part of a larger express app, you can disable the automatic server start by calling `server.create`. It takes the same options as `sevrer.start`, but will not begin listening for connections.

```js
const unleash = require('unleash-server');
// ... const app = express();

unleash
  .create({
    databaseUrl: 'postgres://unleash_user:password@localhost:5432/unleash',
    port: 4242,
  })
  .then(result => {
    app.use(result.app);
    console.log(`Unleash app generated and attached to parent application`);
  });
```

## Securing Unleash

You can integrate Unleash with your authentication provider (OAuth 2.0). Read more about [securing unleash](./securing-unleash.md).

## How do I configure the log output?

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
