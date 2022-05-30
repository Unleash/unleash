---
id: features-archive
title: /api/admin/archive
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### Fetch archived toggles {#fetch-archived-toggles}

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
      "stale": false,
      "variants": [],
      "tags": [],
      "strategy": "default",
      "parameters": {}
    }
  ]
}
```

### Revive feature toggle {#revive-feature-toggle}

`POST http://unleash.host.com/api/admin/archive/revive/:featureName`

Response: **200 OK** - When feature toggle was successfully revived. 

### Delete an archived feature toggle

`DELETE http://unleash.host.com/api/admin/archive/:featureName`

Will fully remove the feature toggle and associated configuration. Impossible to restore after this action. 
