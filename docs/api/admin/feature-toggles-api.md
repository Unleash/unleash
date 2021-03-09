---
id: features
title: /api/admin/features
---

> In order to access the admin api endpoints you need to identify yourself. If you are using the `unsecure` authentication method, you may use [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) to identify yourself.

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
      "stale": false,
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
      ],
      "tags": [
        {
          "id": 1,
          "type": "simple",
          "value": "TeamRed"
        }
      ]
    },
    {
      "name": "Feature.B",
      "description": "lorem ipsum",
      "enabled": true,
      "stale": false,
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
      "variants": [],
      "tags": []
    }
  ]
}
```

#### Filter feature toggles

Supports three params for now

- `tag` - filters for features tagged with tag
- `project` - filters for features belonging to project
- `namePrefix` - filters for features beginning with prefix

For `tag` and `project` performs OR filtering if multiple arguments

To filter for any feature tagged with a `simple` tag with value `taga` or a `simple` tag with value `tagb` use

`GET https://unleash.host.com/api/admin/features?tag[]=simple:taga&tag[]simple:tagb`

To filter for any feature belonging to project `myproject` use

`GET https://unleash.host.com/api/admin/features?project=myproject`

Response format is the same as `api/admin/features`

### Fetch specific feature toggle

`GET: http://unleash.host.com/api/admin/features/:featureName`

Used to fetch details about a specific featureToggle. This is mostly provded to make it easy to debug the API and should not be used by the client implementations.

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
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
  "tags": []
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
  "stale": false,
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

Returns 200-response if the feature toggle was created successfully.

### Update a Feature Toggle

`PUT: http://unleash.host.com/api/admin/features/:toggleName`

**Body:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": false,
  "stale": false,
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

Returns 200-response if the feature toggle was updated successfully.

### Tag a Feature Toggle

`POST https://unleash.host.com/api/admin/features/:featureName/tags`

Used to tag a feature

If the tuple (type, value) does not already exist, it will be added to the list of tags. Then Unleash will add a relation between the feature name and the tag.

**Body:**

```json
{
  "type": "simple",
  "value": "Team-Green"
}
```

## Success

    - Returns _201-CREATED_ if the feature was tagged successfully
    - Creates the tag if needed, then connects the tag to the existing feature

## Failures

    - Returns _404-NOT-FOUND_ if the `type` was not found

### Remove a tag from a Feature Toggle

`DELETE https://unleash.host.com/api/admin/features/:featureName/tags/:type/:value`

Removes the specified tag from the `(type, value)` tuple from the Feature Toggle's list of tags.

## Success

    - Returns _200-OK_

## Failures

    - Returns 404 if the tag does not exist
    - Returns 500 if the database could not be reached

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
  "variants": [],
  "tags": []
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
  "stale": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": [],
  "tags": []
}
```

### Mark a Feature Toggle as "stale"

`POST: http://unleash.host.com/api/admin/features/:featureName/stale/on`

Used to mark a feature toggle as stale (deprecated). The :featureName must match an existing Feature Toggle. Returns 200-response if the feature toggle was enabled successfully.

**Body**

None

**Example response:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "type": "release",
  "enabled": true,
  "stale": true,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "variants": [],
  "tags": []
}
```

### Mark a Feature Toggle as "active"

`POST: http://unleash.host.com/api/admin/features/:featureName/stale/off`

Used to mark a feature toggle active (remove stale marking). The :featureName must match an existing Feature Toggle. Returns 200-response if the feature toggle was disabled successfully.

**Body**

None

**Example response:**

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
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
  "tags": []
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
