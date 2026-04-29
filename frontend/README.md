# frontend

This directory contains the Unleash Admin UI frontend app.

## Run with a local instance of the unleash-api

Refer to the [Contributing to Unleash](../CONTRIBUTING.md#how-to-run-the-project) guide for instructions.
The frontend dev server runs (in port 3000) simultaneously with the backend dev server (in port 4242):

```
pnpm install
pnpm dev
```

## Run with a sandbox instance of the Unleash API

Alternatively, instead of running unleash-api on localhost, you can use a remote instance:

```
cd ./frontend
pnpm install
pnpm run start:sandbox
```

## Running end-to-end tests against localhost 

If you need to test against a local server instance,
you'll need to run in the root directory:

* `pnpm build:frontend`
* `pnpm dev:start` 

Then run the e2e tests using:

```
pnpm run e2e
```

You may also need to test that a feature works against the enterprise version of unleash.

```
pnpm run start:enterprise
pnpm run e2e:enterprise
```

### Debugging end-to-end tests

Run backend and frontend in develoment build. In the root of the project run e.g.: `pnpm dev`. 

Please keep in mind that running tests against dev frontend will be **really** slow (even x5 slower).
It's best to open cypress UI and pick only the test that you need to work on. 

In frontend project run:

```
pnpm e2e:dev:open
```


## Generating the OpenAPI client

The frontend uses an OpenAPI client generated from the backend's OpenAPI spec.
Whenever there are changes to the backend API, the client should be regenerated:

For now we only use generated types (src/openapi/models).
We will use methods (src/openapi/apis) for new features soon.

```
pnpm gen:api
rm -rf src/openapi/apis
```

clean up `src/openapi/index.ts` imports, only keep first line `export * from './models';`

This script assumes that you have a running instance of the enterprise backend at `http://localhost:4242`.
The new OpenAPI client will be generated from the runtime schema of this instance.
The target URL can be changed by setting the `UNLEASH_OPENAPI_URL` env var.

## Analyzing bundle size

`npx vite-bundle-visualizer` in the root of the frontend directory
