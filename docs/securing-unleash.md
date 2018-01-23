# Securing Unleash
The Unleash API is split in two different paths: `/api/client` and `/api/admin`. 
This makes it easy to have different authentication strategy for the admin interface and the client-api used by the applications integrating with Unleash. 

## General settings
Unleash uses an encrypted cookie to maintain a user session. This allows users to be logged in across instances of Unleash. To protect this cookie you should specify the `secret` option when starting unleash.- 

## Securing the Admin API
In order to secure the Admin API you have to tell Unleash that you are using a custom admin authentication and implement your authentication logic as a preHook. You should also set the secret option to a protected secret in your system. 

```javascript
const unleash = require('unleash-server');
const myCustomAdminAuth = require('./auth-hook');

unleash.start({
  databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
  secret: 'super-duper-secret',
  adminAuthentication: 'custom',
  preRouterHook: myCustomAdminAuth
}).then(unleash => {
    console.log(`Unleash started on http://localhost:${unleash.app.get('port')}`);
});
```

Additionally, you can trigger the admin interfact to prompt the user to sign in by configuring your middleware to return a `401` status on
protected routes. The response body must contain a `message` and a `path` used to redirect the user to the proper login route.

```json
{
    "message": "You must be logged in to use Unleash",
    "path": "/custom/login"
}
```

Examples on custom authentication hooks:
- [google-auth-hook.js](https://github.com/Unleash/unleash/blob/master/examples/google-auth-hook.js)
- [basic-auth-hook.js](https://github.com/Unleash/unleash/blob/master/examples/basic-auth-hook.js)

We also have a version of Unleash deployed on heroku which uses Google Oauth 2.0:
https://secure-unleash.herokuapp.com

## Securing the Client API
A common way to support client access is to use pre shared secrets. This can be solved by having clients send a shared key in a http header with every client requests to the Unleash API. All official Unleash clients should support this. 

In the [Java client](https://github.com/Unleash/unleash-client-java#custom-http-headers) this looks like:

```java
UnleashConfig unleashConfig = UnleashConfig.builder()
  .appName("my-app")
  .instanceId("my-instance-1")
  .unleashAPI(unleashAPI)
  .customHttpHeader("Authorization", "12312Random")
  .build();
```

On the unleash server side you need to implement a preRouter hook which verifies that all calls to `/api/client` includes this pre shared key in the defined header. This could look something like this:

```javascript
const unleash = require('unleash-server');
const sharedSecret = '12312Random';

unleash.start({
  databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
  enableLegacyRoutes: false,
  preRouterHook: (app) => {
      app.use('/api/client', (req, res, next) => {
        if(req.headers.authorization !== sharedSecret) {
            res.sendStatus(401);
        } else {
            next()
        }
      });
  }
}).then(unleash => {
    console.log(`Unleash started on http://localhost:${unleash.app.get('port')}`);
});
```

[client-auth-unleash.js](https://github.com/Unleash/unleash/blob/master/examples/client-auth-unleash.js)


PS! Remember to disable legacy route with by setting the `enableLegacyRoutes` option to false. This will require all your clients to be on v3.x. 
