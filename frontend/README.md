# frontend

This directory contains the Unleash Admin UI frontend app.

## Run with a local instance of the unleash-api

First, start the unleash-api backend on port 4242.
Then, start the frontend dev server:

```
cd ~/frontend
yarn install
yarn run start
```

## Run with a heroku-hosted instance of unleash-api

Alternatively, instead of running unleash-api on localhost, use a remote instance:

```
cd ~/frontend
yarn install
yarn run start:heroku
```

## Running end-to-end tests

We have a set of Cypress tests that run on the build before a PR can be merged
so it's important that you check these yourself before submitting a PR.
On the server the tests will run against the deployed Heroku app so this is what you probably want to test against:

```
yarn run start:heroku
```

In a different shell, you can run the tests themselves:

```
yarn run e2e:heroku
```

If you need to test against patches against a local server instance,
you'll need to run that, and then run the end to end tests using:

```
yarn run e2e
```

You may also need to test that a feature works against the enterprise version of unleash.
Assuming the Heroku instance is still running, this can be done by:

```
yarn run start:enterprise
yarn run e2e
```

## Generating the OpenAPI client

The frontend uses an OpenAPI client generated from the backend's OpenAPI spec.
Whenever there are changes to the backend API, the client should be regenerated:

```
./scripts/generate-openapi.sh
```

This script assumes that you have a running instance of the enterprise backend at `http://localhost:4242`.
The new OpenAPI client will be generated from the runtime schema of this instance.
The target URL can be changed by setting the `UNLEASH_OPENAPI_URL` env var.
