---
title: Frontend API
---

:::note Availability

**Version**: `4.18+`

:::

The Unleash Frontend API offers a simplified workflow for connecting a client-side applications to Unleash. It provides the exact same API as [Unleash edge](https://docs.getunleash.io/reference/unleash-edge) and [Unleash proxy - deprecated](../generated/unleash-proxy.md). The frontend API is a quick and easy way to add Unleash to single-page applications and mobile apps.

Compared to using Unleash Edge, using the Frontend API has both benefits and drawbacks. The benefits are:

- **You don't need to configure and run Unleash Edge.** The Frontend API is part of Unleash itself and not an external process. All clients will work exactly the same as they would with Unleash Edge.

On the other hand, using the Frontend API has the following drawbacks compared to using Unleash Edge:

- **It can't handle a large number of requests per second.** Because the Frontend API is part of Unleash, you can't scale it horizontally the way you can scale Unleash Edge.
- **It sends client details to your Unleash instance.** Unleash only stores these details in its short-term runtime cache, but this can be a privacy issue for some use cases.

These points make the Unleash Frontend API best suited for development purposes and applications that don’t receive a lot of traffic, such as internal dashboards. However, because the API is identical to the Unleash Edge API, you can go from one to the other at any time. As such, you can start out by using the Frontend API and switch to using Unleash Edge when you need it.

## Using the Unleash Frontend API

When using the Frontend API in an SDK, there's three things you need to configure.

### Cross-origin resource sharing (CORS) configuration {#cors}

You need to allow traffic from your application domains to use the Unleash Frontend API with web and hybrid mobile applications. You can update the Frontend API CORS settings from the Unleash UI under _admin \> CORS_ or by using the API.

### API URL

The client needs to point to the correct API endpoint. The Frontend API is available at `<your-unleash-instance>/api/frontend`.

<!-- Point to the API docs when they're published -->

### API token

The client needs a frontend [token](../reference/api-tokens-and-client-keys.mdx#front-end-tokens) to interacti witht he Frontend API.

### Refresh interval for tokens

Internally, Unleash creates a new Unleash client for each token it receives. Each client is configured with the project and environment specified in the token.

Each client updates its feature flag configuration at a specified refresh interval plus a random offset between 0 and 10 seconds. By default, the refresh interval is set to 10 seconds. The random offset is used to stagger incoming requests to avoid a large number of clients all querying the database simultaneously. A new, random offset is used for every update.

The refresh interval is specified in milliseconds and can be set by using the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or by using the `frontendApi.refreshIntervalInMs` configuration option in code.
