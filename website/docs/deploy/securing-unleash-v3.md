---
id: securing-unleash-v3
title: Securing Unleash v3
---

> This guide is only relevant if you are using Unleash Open-Source. The Enterprise edition does already ship with a secure setup and multiple SSO options.

The Unleash API is split into two different paths: `/api/client` and `/api/admin`. This makes it easy to have different authentication strategy for the admin interface and the client-api used by the applications integrating with Unleash.

## General settings {#general-settings}

Unleash uses an encrypted cookie to maintain a user session. This allows users to be logged in across multiple instances of Unleash. To protect this cookie, Unleash will automatically generate a secure token the first time you start Unleash.

## Securing the Admin API {#securing-the-admin-api}

To secure the Admin API, you have to tell Unleash that you are using a custom admin authentication and implement your authentication logic as a preHook.

```javascript
const unleash = require('unleash-server');
const myCustomAdminAuth = require('./auth-hook');

unleash
  .start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    adminAuthentication: 'custom',
    preRouterHook: myCustomAdminAuth,
  })
  .then((unleash) => {
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

- [google-auth-hook.js](https://github.com/Unleash/unleash-examples/blob/7ed25f97a31dfd8f773c00847080b1a4c889fd87/v3/securing-google-auth/google-auth-hook.js)
- [basic-auth-hook.js](https://github.com/Unleash/unleash-examples/blob/7ed25f97a31dfd8f773c00847080b1a4c889fd87/v3/securing-basic-auth/basic-auth-hook.js)
- [keycloak-auth-hook.js](https://github.com/Unleash/unleash-examples/blob/7ed25f97a31dfd8f773c00847080b1a4c889fd87/v3/securing-keycloak-auth/keycloak-auth-hook.js)

We also have a version of Unleash deployed on Heroku which uses Google OAuth 2.0: https://secure-unleash.herokuapp.com

## Securing the Client API {#securing-the-client-api}

A common way to support client access is to use pre-shared secrets. This can be solved by having clients send a shared key in an HTTP header with every client request to the Unleash API. All official Unleash clients should support this.

In the [Java client](https://github.com/Unleash/unleash-client-java#custom-http-headers) this would look like this:

```java
UnleashConfig unleashConfig = UnleashConfig.builder()
  .appName("my-app")
  .instanceId("my-instance-1")
  .unleashAPI(unleashAPI)
  .customHttpHeader("Authorization", "12312Random")
  .build();
```

On the Unleash server side, you need to implement a preRouter hook which verifies that all calls to `/api/client` include this pre-shared key in the defined header. This could look something like this.

```javascript
const unleash = require('unleash-server');
const sharedSecret = '12312Random';

unleash
  .start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    preRouterHook: (app) => {
      app.use('/api/client', (req, res, next) => {
        if (req.header('authorization') !== sharedSecret) {
          res.sendStatus(401);
        } else {
          next();
        }
      });
    },
  })
  .then((unleash) => {
    console.log(
      `Unleash started on http://localhost:${unleash.app.get('port')}`,
    );
  });
```

[client-auth-unleash.js](https://github.com/Unleash/unleash-examples/blob/7ed25f97a31dfd8f773c00847080b1a4c889fd87/v3/securing-client-auth/index.js)
