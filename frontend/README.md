# unleash-frontend

This repo contains the Unleash Admin UI frontend app.

## Run with a local instance of the unleash-api

First, start the unleash-api backend on port 4242.
Then, start the unleash-frontend dev server:

```
cd ~/unleash-frontend
yarn install
yarn run start
```

## Run with a heroku-hosted instance of unleash-api

Alternatively, instead of running unleash-api on localhost, use a remote instance:

```
cd ~/unleash-frontend
yarn install
yarn run start:heroku
```

## Running end-to-end Tests

We have a set of Cypress tests that run on the build before a PR can be merged so it's important that you check these yourself before submitting a PR.

On the server the tests will run against the deployed Heroku app so this is what you probably want to test against:

```
yarn run start:heroku
```

In a different shell, you can run the tests themselves:

```
yarn run e2e:heroku
```

If you need to test against patches against a local server instance, you'll need to run that, and then run the end to end tests using:

```
yarn run e2e
```

You may also need to test that a feature works against the enterprise version of unleash. Assuming the Heroku instance is still running, this can be done by:

```
yarn run start:enterprise
yarn run e2e
```
