---
title: Frontend API
---

:::note Availability

**Version**: `4.18+`

:::

## Overview

The Unleash [Frontend API](/reference/api/unleash/frontend-api) simplifies connecting client-side applications to Unleash. It shares the same API as [Unleash Edge](https://docs.getunleash.io/reference/unleash-edge) but is best suited for development environments, low-traffic applications, or internal dashboards. 

The Frontend API has a straightforward setup and since it is built directly into Unleash, you don't need to manage it. However, unlike Unleash Edge, it cannot be scaled horizontally and isn’t designed for high request volumes.

The Frontend API shares the same API as Unleash Edge, so you can start development with the Frontend API and transition to Unleash Edge when needed.

## Configure the Frontend API

### Configure cross-origin resource sharing (CORS)

For web and hybrid mobile apps, allow traffic from your application's domains. To update CORS settings in the Unleash Admin UI, go to **Admin > CORS origins**. Alternatively, you can update CORS using the [Admin API](/reference/api/unleash/set-cors).

### Configure the API URL

Point your application to the correct API endpoint: `<your-unleash-instance>/api/frontend`.

### Generate an API token

Your application needs a [frontend token](../reference/api-tokens-and-client-keys.mdx#frontend-tokens) to interact with the Frontend API.

### Configure the refresh interval for tokens

Feature flag updates occur at a default refresh interval of 10 seconds plus a random offset (0-10 seconds) to prevent simultaneous database queries. You can customize the refresh interval using the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or the `frontendApi.refreshIntervalInMs` configuration option in the SDK.
