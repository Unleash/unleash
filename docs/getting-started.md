# Getting stated

## Requirements

You will need a __PostreSQL__ 9.3+ database instance to be able to run Unleash.

When starting Unleash you must specify a database uri (can be set as environment variable DATABASE_URL) 
which includes a username and password,  that have rights to migrate the database.

_Unleash_ will, at startup, check whether database migration is needed, and perform necessary migrations.

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

unleash.start({
  databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
  port: 4242
}).then(unleash => {
    console.log(`Unleash started on http://localhost:${unleash.app.get('port')}`);
});
```

Available unleash options includes:

- databaseUrl 
- port

## How do I configure the log output?
 
By default, `unleash` uses [log4js](https://github.com/nomiddlename/log4js-node) to log important information. It is possible to swap out the logger provider (only when using Unleash programatically). This enables filtering of log levels and easy redirection of output streams.
 
### What is a logger provider?
 
A logger provider is a function which takes the name of a logger and returns a logger implementation. For instance, the following code snippet shows how a logger provider for the global `console` object could be written:
 
```javascript
function consoleLoggerProvider (name) {
  // do something with the name
  return {
    debug: console.log,
    info: console.log,
    warn: console.log,
    error: console.error
  };
}
```
 
The logger interface with its `debug`, `info`, `warn` and `error` methods expects format string support as seen in `debug` or the JavaScript `console` object. Many commonly used logging implementations cover this API, e.g. bunyan, pino or winston.
 
### How do I set a logger provider?
 
Custom logger providers need to be set *before requiring the `unleash-server` module*. The following example shows how this can be done:
 
```javascript
// first configure the logger provider
const unleashLogger = require('unleash-server/logger');
unleashLogger.setLoggerProvider(consoleLoggerProvider);
 
// then require unleash-server and continue as normal
const unleash = require('unleash-server');
```
