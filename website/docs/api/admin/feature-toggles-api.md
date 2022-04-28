---
id: features
title: /api/admin/features
---

:::caution Deprecation notice
Most of this API was deprecated as part of the v4.3 release and will be removed in v5.0. You should use [the project-based API (/api/admin/projects/:projectId)](./feature-toggles-api-v2.md) instead. The deprecated endpoints are marked as such in the document below.
:::


:::info
In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an **admin** token](/user_guide/api-token) and add an Authorization header using the token.
:::


## Fetching Feature Toggles {#fetching-feature-toggles}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to fetch all toggles](./feature-toggles-api-v2.md#fetching-toggles) instead.
:::

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

### Filter feature toggles {#filter-feature-toggles}

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

## Fetch specific feature toggle {#fetch-specific-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to fetch specific toggles](./feature-toggles-api-v2.md#get-toggle) instead.
:::

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

## Create a new Feature Toggle {#create-a-new-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to create feature toggles](./feature-toggles-api-v2.md#create-toggle) instead.
:::


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

## Update a Feature Toggle {#update-a-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to update a feature toggle](./feature-toggles-api-v2.md#update-toggle) instead.
:::


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

## Tag a Feature Toggle {#tag-a-feature-toggle}

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

**Success**

    - Returns _201-CREATED_ if the feature was tagged successfully
    - Creates the tag if needed, then connects the tag to the existing feature

**Failures**

    - Returns _404-NOT-FOUND_ if the `type` was not found

## Remove a tag from a Feature Toggle {#remove-a-tag-from-a-feature-toggle}

`DELETE https://unleash.host.com/api/admin/features/:featureName/tags/:type/:value`

Removes the specified tag from the `(type, value)` tuple from the Feature Toggle's list of tags.

**Success**

    - Returns _200-OK_

**Failures**

    - Returns 404 if the tag does not exist
    - Returns 500 if the database could not be reached

## Archive a Feature Toggle {#archive-a-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to archive toggles](./feature-toggles-api-v2.md#archive-toggle) instead.
:::


`DELETE: http://unleash.host.com/api/admin/features/:toggleName`

Used to archive a feature toggle. A feature toggle can never be totally be deleted, but can be archived. This is a design decision to make sure that a old feature toggle does not suddenly reappear because someone else is re-using the same name.

## Enable a Feature Toggle {#enable-a-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to enable feature toggles](./feature-toggles-api-v2.md#enable-env) instead.
:::


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

## Disable a Feature Toggle {#disable-a-feature-toggle}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to disable feature toggles](./feature-toggles-api-v2.md#disable-env) instead.
:::

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

## Mark a Feature Toggle as "stale" {#mark-a-feature-toggle-as-stale}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to patch a feature toggle and mark it as stale](./feature-toggles-api-v2.md#patch-toggle) instead.
:::


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

## Mark a Feature Toggle as "active" {#mark-a-feature-toggle-as-active}

:::caution Deprecation notice
This endpoint is deprecated. Please use the [project-based endpoint to patch a feature toggle and mark it as not stale](./feature-toggles-api-v2.md#patch-toggle) instead.
:::

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
