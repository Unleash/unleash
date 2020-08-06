---
id: features
title: /api/admin/features
---

### Fetching Feature Toggles

`GET: http://unleash.host.com/api/admin/features`

This endpoint is the one all admin ui should use to fetch all available feature toggles from the _unleash-server_. The response returns all active feature toggles and their current strategy configuration. A feature toggle will have _at least_ one configured strategy. A strategy will have a `name` and `parameters` map.

**Example response:**

```json
{
  "version": 2,
  "features": [
    {
      "name": "Feature.A",
      "description": "lorem ipsum",
      "type": "release",
      "enabled": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "variants": [
        {
          "name": "variant1",
          "weight": 50
        },
        {
          "name": "variant2",
          "weight": 50
        }
      ]
    },
    {
      "name": "Feature.B",
      "description": "lorem ipsum",
      "enabled": true,
      "strategies": [
        {
          "name": "ActiveForUserWithId",
          "parameters": {
            "userIdList": "123,221,998"
          }
        },
        {
          "name": "GradualRolloutRandom",
          "parameters": {
            "percentage": "10"
          }
        }
      ],
      "variants": []
    }
  ]
}
```

`GET: http://unleash.host.com/api/admin/features/:featureName`

Used to fetch details about a specific featureToggle. This is mostly provded to make it easy to debug the API and should not be used by the client implementations.

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": []
}
```

### Create a new Feature Toggle

`POST: http://unleash.host.com/api/admin/features/`

**Body:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ]
}
```

Used by the admin-dashboard to create a new feature toggles.

**Notes:**

- _name_ **must be globally unique**, otherwise you will get a _403-response_.
- _type_ is optional. If not defined it defaults to `release`

Returns 200-respose if the feature toggle was created successfully.

### Update a Feature Toggle

`PUT: http://unleash.host.com/api/admin/features/:toggleName`

**Body:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": []
}
```

Used by the admin dashboard to update a feature toggles. The name has to match an existing features toggle.

Returns 200-respose if the feature toggle was updated successfully.

### Archive a Feature Toggle

`DELETE: http://unleash.host.com/api/admin/features/:toggleName`

Used to archive a feature toggle. A feature toggle can never be totally be deleted, but can be archived. This is a design decision to make sure that a old feature toggle suddenly reappears becuase someone else re-using the same name.

### Enable a Feature Toggle

`POST: http://unleash.host.com/api/admin/features/:featureName/toggle/on`

Used to enable a feature toggle. The :featureName must match an existing Feature Toggle. Returns 200-response if the feature toggle was enabled successfully.

**Body**

None

**Example response:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": true,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": []
}
```

### Disable a Feature Toggle

`POST: http://unleash.host.com/api/admin/features/:featureName/toggle/off`

Used to disable a feature toggle. The :featureName must match an existing Feature Toggle. Returns 200-response if the feature toggle was disabled successfully.

**Body**

None

**Example response:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": []
}
```

## Archive

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
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "variants": [],
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
