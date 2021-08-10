---
id: feature-types
title: /api/admin/feature-types
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

# Feature Types API

`GET: http://unleash.host.com/api/admin/feature-types`

Used to fetch all feature types defined in the unleash system.

**Response**

```json
{
  "version": 1,
  "types": [
    {
      "id": "release",
      "name": "Release",
      "description": "Used to enable trunk-based development for teams practicing Continuous Delivery.",
      "lifetimeDays": 40
    },
    {
      "id": "experiment",
      "name": "Experiment",
      "description": "Used to perform multivariate or A/B testing.",
      "lifetimeDays": 40
    },
    {
      "id": "ops",
      "name": "Operational",
      "description": "Used to control operational aspects of the system behavior.",
      "lifetimeDays": 7
    },
    {
      "id": "killswitch",
      "name": "Kill switch",
      "description": "Used to to gracefully degrade system functionality.",
      "lifetimeDays": null
    },
    {
      "id": "permission",
      "name": "Permission",
      "description": "Used to change the features or product experience that certain users receive.",
      "lifetimeDays": null
    }
  ]
}
```
