(unleash-server is currently not released yet with these capabilites, but when it is this is how to use unleash)

### The simplest way to get started:

```bash
$ npm install unleash-server -g
$ unleash -d postgres://unleash_user:passord@localhost:5432/unleash -p 4242

Unleash started on port:4242
```

### Or programmatically:

```js
const unleash = require('unleash-server');

unleash.start({
  databaseUri: 'postgres://unleash_user:passord@localhost:5432/unleash'
  port: 4242
}).then(unleash => {
    console.log(`Unleash started on port:${unleash.app.get('port')}`);
});
```
