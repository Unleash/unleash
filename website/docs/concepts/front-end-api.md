---
title: Frontend API
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Version**: `4.18+`

:::

## Overview

The Unleash [Frontend API](/api/frontend-api) simplifies connecting client-side applications to Unleash. [Unleash Edge](/unleash-edge) also implements this API allowing you to scale from development environments, low-traffic applications, or internal dashboards to a production-ready scalable solution.

The Frontend API has a straightforward setup, and since it is built directly into Unleash, you don't need to manage it. However, unlike Unleash Edge, it cannot be scaled horizontally and isn’t designed for high request volumes.

Since the Frontend API shares the same API as Unleash Edge, you can start development with the Frontend API and transition to Unleash Edge when needed.

## Configure the Frontend API

### Configure cross-origin resource sharing (CORS)

For web and hybrid mobile apps, allow traffic from your application's domains.

For Unleash, you can update CORS settings in the Unleash Admin UI in **Admin settings > Access control > CORS origins**. For Unleash Edge, follow our [command-line for CORS settings](https://github.com/Unleash/unleash-edge/blob/243cfbdf2ef5f78a7312db6cc688cc74b7d5f318/CLI.md).

### Configure the API URL

Point your application to the correct API endpoint: `<your-unleash-instance>/api/frontend`.

### Generate an API token

Your application needs a [frontend token](../concepts/api-tokens-and-client-keys.mdx#frontend-tokens) to interact with the Frontend API.

### Configure the refresh interval for tokens

Feature flag updates occur at a default refresh interval of 10 seconds plus a random offset (0-10 seconds) to prevent simultaneous database queries. You can customize the refresh interval using the `FRONTEND_API_REFRESH_INTERVAL_MS` environment variable or the `frontendApi.refreshIntervalInMs` configuration option in the SDK.
