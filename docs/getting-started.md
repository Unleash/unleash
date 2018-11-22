---
id: getting_started
title: Getting Started
---

## Requirements

You will need Node.js >= 8.0.0 and a **PostreSQL** 9.5+ database instance to be able to run Unleash.

When starting Unleash you must specify a database uri (can be set as environment variable DATABASE_URL) which includes a username and password, that have rights to migrate the database.

On startup _Unleash_ will perform necessary migrations if needed.

## Start Unleash

### 1. The simplest way to get started:

```bash
$ npm install unleash-server -g
$ unleash -d postgres://unleash_user:passord@localhost:5432/unleash -p 4242

Unleash started on http://localhost:4242
```

### 2. Or programmatically:

You can also depend on unleash

```js
const unleash = require('unleash-server');

unleash
  .start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    port: 4242,
  })
  .then(unleash => {
    console.log(
      `Unleash started on http://localhost:${unleash.app.get('port')}`,
    );
  });
```

Available unleash options includes:

- **databaseUrl** - the postgress database url to connect to. Should include username/password.
- **port** - Which port should the unleash-server bind to?
- **enableLegacyRoutes** (boolean) - allows you to turn on/off support for legacy routes to support older clients. Enabled by default.
- **serverMetrics** (boolean) - Use this option to turn off prometheus metrics.
- **preHook** (function) - This is a hook if you need to provide any middlewares to express before `unleash` adds any. Express app instance is injected as first arguement.
- **preRouterHook** (function) - Use this to register custom express middlewares before the `unleash` specific routers are added. This is typically how you would register custom middlewares to handle authentication.
- **secret** (string) - Set this when you want to secure unleash. Used to encrypt the user session.
- **adminAuthentication** (string) - Use this when implementing custom admin authentication [securing-unleash](./securing-unleash.md). Possible values are:
  - `none` - Will disable authentication altogether
  - `unsecure` - (default) Will use simple cookie based authentication. UI will require the user to specify an email in order to use unleash.
  - `custom` - Use this when you implement your own custom authentication logic.

### 3. Docker

You can also use the [hosted docker image](https://hub.docker.com/r/unleashorg/unleash-server/) to start the Unleash server

```sh
docker run -d -e DATABASE_URL=postgres://user:pass@10.200.221.11:5432/unleash unleashorg/unleash-server
```

## How do I configure the log output?

By default, `unleash` uses [log4js](https://github.com/nomiddlename/log4js-node) to log important information. It is possible to swap out the logger provider (only when using Unleash programmatically). This enables filtering of log levels and easy redirection of output streams.

### What is a logger provider?

A logger provider is a function which takes the name of a logger and returns a logger implementation. For instance, the following code snippet shows how a logger provider for the global `console` object could be written:

```javascript
function consoleLoggerProvider(name) {
  // do something with the name
  return {
    debug: console.log,
    info: console.log,
    warn: console.log,
    error: console.error,
  };
}
```

The logger interface with its `debug`, `info`, `warn` and `error` methods expects format string support as seen in `debug` or the JavaScript `console` object. Many commonly used logging implementations cover this API, e.g. bunyan, pino or winston.

### How do I set a logger provider?

Custom logger providers need to be set _before requiring the `unleash-server` module_. The following example shows how this can be done:

```javascript
// first configure the logger provider
const unleashLogger = require('unleash-server/logger');
unleashLogger.setLoggerProvider(consoleLoggerProvider);

// then require unleash-server and continue as normal
const unleash = require('unleash-server');
```
