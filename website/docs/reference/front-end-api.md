---
title: Front-end API access
---

:::info Availability

The Unleash front-end API is an experimental feature and is currently in development.

<!-- TODO: link blog post with release notes -->

:::

The **Unleash front-end API** offers a simplified workflow for connecting a client-side (front-end) applications to Unleash. It provides the exact same API as the [Unleash proxy](../sdks/unleash-proxy.md). The front-end API is a quick and easy way to add Unleash to single-page applications and mobile apps.

<!-- TODO: image illustrating connection -->

Compared to using the Unleash proxy, using the Unleash front-end API has both benefits and drawbacks. The benefits are:

- **Managing client-side API tokens is easier.** With the Unleash proxy, you need to create and manage client keys manually; with the front-end API, you manage client-side API tokens in the exact same manner as other API tokens.
- **You don't need to configure and run an Unleash proxy.** The front-end API is part of Unleash itself and not an external process. All proxy clients will work exactly the same as they would with the Proxy.

On the other hand, using the front-end API has the following drawbacks compared to using the proxy:

- **It can't handle a large number of requests per second.** Because the front-end API is part of Unleash, you can't scale it horizontally the way you can scale the proxy.
- **It sends client details to your Unleash instance.** Unleash only stores these details in its short-term runtime cache, but this can be a privacy issue for some use cases.

These points make the Unleash front-end API best suited for development purposes and applications that don’t receive a lot of traffic, such as internal dashboards. However, because the API is identical to the Unleash proxy API, you can go from one to the other at any time. As such, you can start out by using the front-end API and switch to using the proxy when you need it.

## Using the Unleash front-end API

When using the front-end API in an SDK, there's three things you need to configure.

### Front-end API tokens

As a client-side API, you should use a [front-end API token](../reference/api-tokens-and-client-keys.mdx#front-end-tokens) to interact with it. Refer to the [how to create API tokens](../user_guide/token.mdx) guide for steps on how to create API tokens.

### Cross-origin resource sharing (CORS) configuration {#cors}

You need to allow traffic from your application domains to use the Unleash front-end API with web and hybrid mobile applications. You can update the front-end API CORS settings from the Unleash UI under _admin \> CORS_ or by using the API.

### API URL

The client needs to point to the correct API endpoint. The front-end API is available at `<your-unleash-instance>/api/frontend`.

<!-- Point to the API docs when they're published -->

### API token

You can create appropriate token, with type `FRONTEND` on `<YOUR_UNLEASH_URL>/admin/api/create-token` page or with a request to `/api/admin/api-tokens`. See our guide on [how to create API tokens](../user_guide/token.mdx) for more details.

### Refresh interval for tokens

Internally, Unleash creates a new Unleash client for each token it receives. Each client is configured with the project and environment specified in the token.

Each client updates its feature toggle configuration at a specified refresh interval plus a random offset between 0 and 10 seconds. By default, the refresh interval is set to 10 seconds. The random offset is used to stagger incoming requests to avoid a large number of clients all querying the database simultaneously. A new, random offset is used for every update.

The refresh interval is specified in milliseconds and can be set by using the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or by using the `frontendApi.refreshIntervalInMs` configuration option in code.