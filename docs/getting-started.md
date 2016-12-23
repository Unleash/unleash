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

Unleash started on port:4242
```

### 2. Or programmatically:
You can also depend on unleash

```js
const unleash = require('unleash-server');

unleash.start({
  databaseUri: 'postgres://unleash_user:passord@localhost:5432/unleash'
  port: 4242
}).then(unleash => {
    console.log(`Unleash started on port:${unleash.app.get('port')}`);
});
```

Available unleash options includes:

- databaseURI 
- port
- logLevel - ('INFO', 'ERROR',)
