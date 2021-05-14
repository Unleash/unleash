---
id: securing_unleash
title: Securing Unleash
---

> This guide is only relevant if you are using Unleash Open-Source. The Enterprise edition does already ship with multiple SSO options, such as SAML 2.0, OpenId Connect.

**If you are still using Unleash v3 you need to follow the [securing-unleash-v3](./securing-unleash-v3)**

Out of the box Unleash Open-Source comes with username/password authentication. It also comes with API token support out of the box, to make it easy to handle access tokens for Client SDKs and programmatic asses to the Unleash APIs.

### Implementing Custom Authentication

If you do not wish to use the built-in

To secure the Admin API, you have to tell Unleash that you are using a custom admin authentication and implement your authentication logic as a preHook.

```javascript
const unleash = require('unleash-server');
const myCustomAdminAuth = require('./auth-hook');

unleash
  .start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    authentication: {
      type: 'custom',
      customAuthHandler: myCustomAdminAuth,
    },
  })
  .then(unleash => {
    console.log(
      `Unleash started on http://localhost:${unleash.app.get('port')}`,
    );
  });
```

Additionally, you can trigger the admin interface to prompt the user to sign in by configuring your middleware to return a `401` status on protected routes. The response body must contain a `message` and a `path` used to redirect the user to the proper login route.

```json
{
  "message": "You must be logged in to use Unleash",
  "path": "/custom/login"
}
```

Examples of custom authentication hooks:

- [google-auth-hook.js](https://github.com/Unleash/unleash/blob/master/examples/google-auth-hook.js)
- [basic-auth-hook.js](https://github.com/Unleash/unleash/blob/master/examples/basic-auth-hook.js)
- [keycloak-auth-hook.js](https://github.com/Unleash/unleash/blob/master/examples/keycloak-auth-hook.js)

We also have a version of Unleash deployed on Heroku which uses Google OAuth 2.0: https://secure-unleash.herokuapp.com

## Securing the Client API

A common way to support client access is to use API tokens. [Create a token](../api/token.md). Then use the token when configuring the client

In the [Java client](https://github.com/Unleash/unleash-client-java#custom-http-headers) this would look like this:

```java
UnleashConfig unleashConfig = UnleashConfig.builder()
  .appName("my-app")
  .instanceId("my-instance-1")
  .unleashAPI(unleashAPI)
  .customHttpHeader("Authorization", "yourtokenhere")
  .build();
```

On the Unleash server side, you need to implement a preRouter hook which verifies that all calls to `/api/client` include this pre-shared key in the defined header. This could look something like this.

```javascript
const unleash = require('unleash-server');
const sharedSecret = '12312Random';

unleash
  .start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    preRouterHook: app => {
      app.use('/api/client', (req, res, next) => {
        if (req.header('authorization') !== sharedSecret) {
          res.sendStatus(401);
        } else {
          next();
        }
      });
    },
  })
  .then(unleash => {
    console.log(
      `Unleash started on http://localhost:${unleash.app.get('port')}`,
    );
  });
```

[client-auth-unleash.js](https://github.com/Unleash/unleash/blob/master/examples/client-auth-unleash.js)
