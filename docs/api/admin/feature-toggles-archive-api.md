---
id: features-archive
title: /api/admin/archive
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](../../user_guide/api-token) and add an Authorization header using the token.

### Fetch archived toggles

`GET http://unleash.host.com/api/admin/archive/features`

Used to fetch list of archived feature toggles

**Example response:**

```json
{
  "version": 1,
  "features": [
    {
      "name": "Feature.A",
      "description": "lorem ipsum",
      "type": "release",
      "enabled": false,
      "stale": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "variants": [],
      "tags": [],
      "strategy": "default",
      "parameters": {}
    }
  ]
}
```

### Revive feature toggle

`POST http://unleash.host.com/api/admin/archive/revive`

**Body:**

```json
{
  "name": "Feature.A"
}
```

Used to revive a feature toggle.
