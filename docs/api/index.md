---
id: index
title: API Documentation
---

## Client API

This describes the API provided to unleash-clients. 

Since v4.0.0 all operations require an [API token](token.md) with `Client` level access.

With versions earlier than v4.0.0 and `insecure` authentication no authentication is required.

- [Feature Toggles API](client/feature-toggles-api.md)
- [Register API](client/register-api.md)
- [Metrics API](client/metrics-api.md)

## Admin API (internal)

The internal API used by the Admin UI (unleash-frontend). Since v4.0.0 all operations require an [API token](token.md) with `Admin` level access:

With versions earlier than v4.0.0 and `insecure` authentication Basic Auth (with curl `-u myemail@test.com:`) is enough

- [Feature Toggles API](admin/feature-toggles-api.md)
- [Strategies API](admin/strategies-api.md)
- [Events API](admin/events-api.md)
- [Metrics API](admin/metrics-api.md)
- [Tags API](admin/tags-api.md)

## System API's

- [Internal Backstage API](internal-backstage-api.md)
