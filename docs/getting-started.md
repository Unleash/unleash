# Getting stated (v.1.0.x)

### Prerequisite
To run unleash you need to provide a PostgreSQL databse (PostgreSQL v.9.5.x or newer). 

You need to give unleash a database uri which includes a username and password,  that have rights to 
migrate the database. _Unleash_ will, at startup, check whether database migration is needed, 
and perform necessary migrations.

### 1. The simplest way to get started:

```bash
$ npm install unleash-server -g
$ unleash -d postgres://unleash_user:passord@localhost:5432/unleash -p 4242

Unleash started on port:4242
```

### 2. Or programmatically:

```js
const unleash = require('unleash-server');

unleash.start({
  databaseUri: 'postgres://unleash_user:passord@localhost:5432/unleash'
  port: 4242
}).then(unleash => {
    console.log(`Unleash started on port:${unleash.app.get('port')}`);
});
```
