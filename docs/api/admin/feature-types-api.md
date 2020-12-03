---
id: feature-types
title: /api/admin/feature-types
---

> In order to access the admin api endpoints you need to identify yourself. If you are using the `unsecure` authententication method, you may use [basic authenticaion](https://en.wikipedia.org/wiki/Basic_access_authentication) to ientify yourself.

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
