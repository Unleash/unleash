---
id: index
title: API Documentation
slug: /api
---

## Client API {#client-api}

This describes the API provided to unleash-clients.

Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Client` level access.

With versions earlier than v4.0.0 and `insecure` authentication no authentication is required.

- [Feature Toggles API](/api/client/features)
- [Register API](/api/client/register)
- [Metrics API](/api/client/metrics)

## Admin API (internal) {#admin-api-internal}

The internal API used by the Admin UI (unleash-frontend). Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Admin` level access:

With versions earlier than v4.0.0 and `insecure` authentication Basic Auth (with curl `-u myemail@test.com:`) is enough.

- [Events API](/api/admin/events)
- [Feature Toggles API](/api/admin/features)
- [Metrics API](/api/admin/metrics)
- [Project API](/api/admin/project.md)
- [Strategies API](/api/admin/strategies)
- [Tags API](/api/admin/tags)

## System API's {#system-apis}

- [Internal Backstage API](/api/internal/internal)

### Content-Type {#contenttype}

All endpoints require `application/json` as content type, so if you're using curl remember to add

```bash
-H "Content-Type: application/json"
```
