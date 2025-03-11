---
title: Frontend API
---

:::note Availability

**Version**: `4.18+`

:::

## Overview

The Unleash [Frontend API](/reference/api/unleash/frontend-api) simplifies connecting client-side applications to Unleash. It shares the same API as [Unleash Edge](https://docs.getunleash.io/reference/unleash-edge) but is best suited for development environments, low-traffic applications, or internal dashboards. You can start development with the Frontend API and transition to Unleash Edge when needed.

Compared to Unleash Edge, the Frontend API has advantages and limitations:

**Benefits:**
- No need to configure or manage Unleash Edge—the Frontend API is built directly into Unleash.
- Clients function the same way as they would with Unleash Edge.

**Drawbacks:**
- Limited scalability—it can’t handle high request volumes like Unleash Edge.   
- Sends application usage metrics to your Unleash instance, which may be a privacy concern (though Unleash only stores this data in a short-term runtime cache).

## Configure the Frontend API

### Configure cross-origin resource sharing (CORS)

For web and hybrid mobile apps, allow traffic from your application's domains. To update CORS settings in the Unleash Admin UI, go to **Admin > CORS origins**. Alternatively, you can update CORS using the [Admin API](/reference/api/unleash/set-cors).

### Configure the API URL

Point your application to the correct API endpoint: `<your-unleash-instance>/api/frontend`.

### Generate an API token

Your application needs a [frontend token](../reference/api-tokens-and-client-keys.mdx#frontend-tokens) to interact with the Frontend API.

### Configure the refresh interval for tokens

Feature flag updates occur at a default refresh interval of 10 seconds plus a random offset (0-10 seconds) to prevent simultaneous database queries. You can customize the refresh interval using the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or the `frontendApi.refreshIntervalInMs` configuration option in the SDK.
