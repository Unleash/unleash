---
id: index
title: API Documentation
---

## Client API {#client-api}

This describes the API provided to unleash-clients.

Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Client` level access.

With versions earlier than v4.0.0 and `insecure` authentication no authentication is required.

- [Feature Toggles API](client/features)
- [Register API](client/register)
- [Metrics API](client/metrics)

## Admin API (internal) {#admin-api-internal}

The internal API used by the Admin UI (unleash-frontend). Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Admin` level access:

With versions earlier than v4.0.0 and `insecure` authentication Basic Auth (with curl `-u myemail@test.com:`) is enough

- [Feature Toggles API](admin/feature-toggles-api.md)
- [Strategies API](admin/strategies-api.md)
- [Events API](admin/events-api.md)
- [Metrics API](admin/metrics-api.md)
- [Tags API](admin/tags-api.md)

## System API's {#system-apis}

- [Internal Backstage API](/api/internal/internal)
