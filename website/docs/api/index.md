---
id: index
title: API Documentation
slug: /api
---

:::caution Deprecation notice & switchover

These docs are currently in the process of being deprecated in favor of auto-generated [docs based on the Unleash OpenAPI schema](/reference/api/unleash). In the interim, some information may still only be available here.

:::

## Client API {#client-api}

:::info OpenAPI docs

You can also find the operation descriptions at [OpenAPI client operations](/reference/api/unleash/client).

:::

This describes the API provided to unleash-clients.

Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Client` level access.

With versions earlier than v4.0.0 and `insecure` authentication no authentication is required.

- [Feature Toggles API](/api/client/features) (**OpenAPI**: [get a single feature](/reference/api/unleash/get-client-feature) and [get all features](/reference/api/unleash/get-all-client-features))
- [Register API](/api/client/register) (**OpenAPI**: [register a client application](/reference/api/unleash/register-client-application)))
- [Metrics API](/api/client/metrics) (**OpenAPI**: [register client metrics](/reference/api/unleash/register-client-metrics))

## Admin API (internal) {#admin-api-internal}

:::info OpenAPI docs

The various admin API operations have been given their own sections under the OpenAPI docs. Some endpoints are located slightly differently than in this doc.

:::

The internal API used by the Admin UI (unleash-frontend). Since v4.0.0 all operations require an [API token](/user_guide/api-token) with `Admin` level access:

With versions earlier than v4.0.0 and `insecure` authentication Basic Auth (with curl `-u myemail@test.com:`) is enough.

- [Events API](/api/admin/events) (**OpenAPI**: [Events operations](/reference/api/unleash/Events))
- [Feature Toggles API](/api/admin/features) (**OpenAPI**: [Feature operations](/reference/api/unleash/Features))
- [Metrics API](/api/admin/metrics) (**OpenAPI**: [Metrics operations](/reference/api/unleash/Metrics))
- [Project API](/api/admin/project.md) (**OpenAPI**: [Project operations](/reference/api/unleash/Projects))
- [Strategies API](/api/admin/strategies) (**OpenAPI**: [Strategies operations](/reference/api/unleash/Strategies))
- [Tags API](/api/admin/tags) (**OpenAPI**: [Tags operations](/reference/api/unleash/Tags))

## System API's {#system-apis}

- [Internal Backstage API](/api/internal/internal)

### Content-Type {#contenttype}

All endpoints require `application/json` as content type, so if you're using curl remember to add

```bash
-H "Content-Type: application/json"
```
