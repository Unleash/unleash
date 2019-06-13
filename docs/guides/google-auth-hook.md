---
id: google_auth
title: Google Auth Hook
---

This part of the tutorial shows how to create a sign-in flow for users and integrate with Unleash server project. The implementation assumes that I am working in `localhost` with `4242` port.

This is a simple `index.js` server file.

```javascript
const unleash = require('unleash-server');

unleash.start(options).then(unleash => {
  console.log(`Unleash started on http://localhost:${unleash.app.get('port')}`);
});
```

### Creating a web application client ID

1. Go to the credentials section in the [Google Cloud Platform Console](https://console.cloud.google.com/apis/credentials?_ga=2.77615956.-1991581217.1542834301).

2. Click **OAuth consent screen**. Type a product name. Fill in any relevant optional fields. Click **Save**.

3. Click **Create credentials > OAuth client ID**.

4. Under **Application type**, select **Web Application**.

5. Type the **Name**.

6. Under **Authorized redirect URIs** enter the following URLs, one at a time.

```
http://localhost:4242/api/auth/callback
```

7. Click **Create**.

8. Copy the **CLIENT ID** and **CLIENT SECRET** and save them for later use.

### Add dependencies

Add two dependencies [`@passport-next/passport`](https://www.npmjs.com/package/@passport-next/passport) and [`@passport-next/passport-google-oauth2`](https://www.npmjs.com/package/@passport-next/passport-google-oauth2) inside `index.js` file

```js
const unleash = require('unleash-server');
const passport = require('@passport-next/passport');
const GoogleOAuth2Strategy = require('@passport-next/passport-google-oauth2')
  .Strategy;
```

### Configure the Google strategy for use by Passport.js

OAuth 2-based strategies require a `verify` function which receives the credential (`accessToken`) for accessing the Google API on the user's behalf, along with the user's profile. The function must invoke `cb` with a user object, which will be set at `req.user` in route handlers after authentication.

```js
const GOOGLE_CLIENT_ID = '...';
const GOOGLE_CLIENT_SECRET = '...';
const GOOGLE_CALLBACK_URL = 'http://localhost:4242/api/auth/callback';

passport.use(
  new GoogleOAuth2Strategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    function(accessToken, refreshToken, profile, cb) {
      // Extract the minimal profile information we need from the profile object
      // and connect with Unleash to get name and email.
      cb(
        null,
        new unleash.User({
          name: profile.displayName,
          email: profile.emails[0].value,
        }),
      );
    },
  ),
);
```

Add `googleAdminAuth()` function and other options

```js
function googleAdminAuth(app) {}

let options = {
  enableLegacyRoutes: false,
  adminAuthentication: 'custom',
  preRouterHook: googleAdminAuth,
};

unleash.start(options).then(instance => {
  console.log(
    `Unleash started on http://localhost:${instance.app.get('port')}`,
  );
});
```

### In `googleAdminAuth` function

Configure `passport` package.

```js
function googleAdminAuth(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  // ...
}
```

Implement a preRouter hook for `/api/admin/login`. It's neccesary for login with Google.

```js
function googleAdminAuth(app) {
  // ...
  app.get(
    '/api/admin/login',
    passport.authenticate('google', { scope: ['email'] }),
  );
  // ...
}
```

Implement a preRouter hook for `/api/auth/callback`. It's a callback when the login is executed.

```js
function googleAdminAuth(app) {
  // ...
  app.get(
    '/api/auth/callback',
    passport.authenticate('google', {
      failureRedirect: '/api/admin/error-login',
    }),
    (req, res) => {
      // Successful authentication, redirect to your app.
      res.redirect('/');
    },
  );
  // ...
}
```

Implement a preRouter hook for `/api/admin`.

```js
function googleAdminAuth(app) {
  // ...
  app.use('/api/admin/', (req, res, next) => {
    if (req.user) {
      next();
    } else {
      // Instruct unleash-frontend to pop-up auth dialog
      return res
        .status('401')
        .json(
          new unleash.AuthenticationRequired({
            path: '/api/admin/login',
            type: 'custom',
            message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
          }),
        )
        .end();
    }
  });
  // ...
}
```

### The complete code

The `index.js` server file.

```js
'use strict';

const unleash = require('unleash-server');
const passport = require('@passport-next/passport');
const GoogleOAuth2Strategy = require('@passport-next/passport-google-oauth2');

const GOOGLE_CLIENT_ID = '...';
const GOOGLE_CLIENT_SECRET = '...';
const GOOGLE_CALLBACK_URL = 'http://localhost:4242/api/auth/callback';

passport.use(
  new GoogleOAuth2Strategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, cb) => {
      cb(
        null,
        new unleash.User({
          name: profile.displayName,
          email: profile.emails[0].value,
        }),
      );
    },
  ),
);

function googleAdminAuth(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.get(
    '/api/admin/login',
    passport.authenticate('google', { scope: ['email'] }),
  );
  app.get(
    '/api/auth/callback',
    passport.authenticate('google', {
      failureRedirect: '/api/admin/error-login',
    }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.use('/api/admin/', (req, res, next) => {
    if (req.user) {
      next();
    } else {
      return res
        .status('401')
        .json(
          new unleash.AuthenticationRequired({
            path: '/api/admin/login',
            type: 'custom',
            message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
          }),
        )
        .end();
    }
  });
}

const options = {
  enableLegacyRoutes: false,
  adminAuthentication: 'custom',
  preRouterHook: googleAdminAuth,
};

unleash.start(options).then(instance => {
  console.log(
    `Unleash started on http://localhost:${instance.app.get('port')}`,
  );
});
```
