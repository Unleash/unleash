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

As a client-side API, you should use a [front-end API token](../reference/api-tokens-and-client-keys.mdx#front-end-api-tokens) to interact with it. Refer to the [how to create API tokens](../user_guide/token.mdx) guide for steps on how to create API tokens.

### Cross-origin resource sharing (CORS) configuration {#cors}

You need to allow traffic from your application domains to use the Unleash front-end API with web and hybrid mobile applications. You can update the front-end API CORS settings from the Unleash UI under _admin \> CORS_ or by using the API.

### API URL

The client needs to point to the correct API endpoint. The front-end API is available at `<your-unleash-instance>/api/frontend`.

<!-- Point to the API docs when they're published -->

### API token

You can create appropriate token, with type `FRONTEND` on `<YOUR_UNLEASH_URL>/admin/api/create-token` page or with a request to `/api/admin/api-tokens`. See our guide on [how to create API tokens](../user_guide/token.mdx) for more details.

### Refresh interval for tokens

Internally, unleash will set up a new unleash client per token it sees and configure the client with the project and environment specified in the token. By default
the refresh interval is set to 10 seconds, plus a 10 second stagger to avoid thundering herd. This means that if you have 1000 users, unleash will refresh the client data within a window of 10s + a random number between 0 and 10s. This is to avoid all clients hitting the database simultaneously to refresh their data. If you need to change this interval, you can do so by setting the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or by setting it directly in the config on startup. Note that the interval is in milliseconds: 

```
const unleashConfig = {
    ... // previous values 
    frontendApi: { refreshIntervalInMs: 4000 }
}