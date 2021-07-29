---
id: metrics
title: /api/admin/metrics
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

# This document describes the metrics endpoint for admin ui

### Seen-toggles {#seen-toggles}

`GET http://unleash.host.com/api/admin/seen-toggles`

This enpoints returns a list of applications and what toogles unleash has seen for each application. It will only guarantee toggles reported by client applications within the last hour, but will in most cases remember seen toggles for applications longer.

**Example response:**

```json
[
  {
    "appName": "demo-app",
    "seenToggles": ["add-feature-2", "toggle-2", "toggle-3"],
    "metricsCount": 127
  },
  {
    "appName": "demo-app-2",
    "seenToggles": ["add-feature-2", "toggle-2", "toggle-3"],
    "metricsCount": 21
  }
]
```

**Fields:**

- **appName** - Name of the application seen by unleash-server
- **seenToggles** - array of toggles names seen by unleash-server for this application
- **metricsCount** - number of metrics counted across all toggles for this application.

### Feature-Toggles metrics {#feature-toggles-metrics}

`GET http://unleash.host.com/api/admin/metrics/feature-toggles`

This endpoint gives _last minute_ and _last hour_ metrics for all active toggles. This is based on metrics reported by client applications. Yes is the number of times a given feature toggle was evaluated to enabled in a client application, and no is the number it was evaluated to false.

**Example response:**

```json
{
  "lastHour": {
    "add-feature-2": {
      "yes": 0,
      "no": 527
    },
    "toggle-2": {
      "yes": 265,
      "no": 85
    },
    "toggle-3": {
      "yes": 257,
      "no": 93
    }
  },
  "lastMinute": {
    "add-feature-2": {
      "yes": 0,
      "no": 527
    },
    "toggle-2": {
      "yes": 265,
      "no": 85
    },
    "toggle-3": {
      "yes": 257,
      "no": 93
    }
  }
}
```

**Fields:**

- **lastHour** - Hour projection collected metrics for all feature toggles.
- **lastMinute** - Minute projection collected metrics for all feature toggles.

### Applications {#applications}

`GET http://unleash.host.com/api/admin/applications`

This endpoint returns a list of known applications (seen the last two days) and a link to follow for more details.

```json
{
  "applications": [
    {
      "appName": "another",
      "strategies": ["default", "other", "brother"],
      "createdAt": "2016-12-09T14:56:36.730Z",
      "links": {
        "appDetails": "/api/admin/applications/another"
      }
    },
    {
      "appName": "bow",
      "strategies": ["default", "other", "brother"],
      "createdAt": "2016-12-09T14:56:36.730Z",
      "links": {
        "appDetails": "/api/admin/applications/bow"
      }
    }
  ]
}
```

#### Query Params {#query-params}

You can also specify the query param: _strategyName_, which will return all applications implementing the given strategy.

`GET http://unleash.host.com/api/admin/applications?strategyName=someStrategyName`

### Application Details {#application-details}

`GET http://unleash.host.com/api/admin/applications/:appName`

This endpoint gives insight into details about a client application, such as instances, strategies implemented and seen toggles.

```json
{
  "appName": "demo-app",
  "instances": [
    {
      "instanceId": "generated-732038-17080",
      "clientIp": "::ffff:127.0.0.1",
      "lastSeen": "2016-11-30T17:32:04.265Z",
      "createdAt": "2016-11-30T17:31:08.914Z"
    },
    {
      "instanceId": "generated-639919-11185",
      "clientIp": "::ffff:127.0.0.1",
      "lastSeen": "2016-11-30T16:04:15.991Z",
      "createdAt": "2016-11-30T10:49:11.223Z"
    }
  ],
  "strategies": [
    {
      "appName": "demo-app",
      "strategies": ["default", "extra"]
    }
  ],
  "seenToggles": ["add-feature-2", "toggle-2", "toggle-3"]
}
```

### Seen applications {#seen-applications}

`GET http://unleash.host.com/api/admin/seen-apps`

This endpoint gives insight into details about application seen per feature toggle.

```json
{
  "my-toggle": [
    {
      "appName": "my-app",
      "createdAt": "2016-12-28T10:39:24.966Z",
      "updatedAt": "2017-01-06T15:32:41.932Z",
      "description": "our main app",
      "strategies": [
        "gradualRolloutRandom",
        "abTest",
        "default",
        "betaUser",
        "userWithId",
        "byHostName",
        "gradualRolloutWithSessionId",
        "gradualRollout",
        "byRemoteAddr"
      ],
      "url": "http://example.com",
      "color": null,
      "icon": "terrain"
    },
    {
      "appName": "my-other-app",
      "createdAt": "2016-12-28T10:39:24.966Z",
      "updatedAt": "2017-01-06T15:32:41.932Z",
      "description": "our other app",
      "strategies": ["default"],
      "url": "http://example.com",
      "color": null,
      "icon": "desktop"
    }
  ]
}
```
