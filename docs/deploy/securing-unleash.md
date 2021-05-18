---
id: securing_unleash
title: Securing Unleash
---

**If you are still using Unleash v3 you need to follow the [securing-unleash-v3](./securing-unleash-v3)**

> This guide is only relevant if you are using Unleash Open-Source. The Enterprise edition does already ship with multiple SSO options, such as SAML 2.0, OpenId Connect.

Unleash Open-Source v4 comes with username/password authentication out of the box. In addition Unleash v4 also comes with API token support, to make it easy to handle access tokens for Client SDKs and programmatic asses to the Unleash APIs.

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

- [securing-google-auth](https://github.com/Unleash/unleash-examples/tree/main/v4/securing-google-auth)
- [securing-basic-auth](https://github.com/Unleash/unleash-examples/tree/main/v4/securing-basic-auth)
- [securing-keycloak-auth](https://github.com/Unleash/unleash-examples/tree/main/v4/securing-keycloak-auth)
