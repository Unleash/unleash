---
title: /api/admin/features
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />

:::caution Deprecation notice

Most of this API was removed in Unleash v5 (after being deprecated since Unleash v4.3). You should use [the project-based API (/api/admin/projects/:projectId)](/reference/api/legacy/unleash/admin/features-v2.mdx) instead.

:::


## Fetching Feature Flags {#fetching-feature-toggles}

:::caution Deprecation notice

This endpoint was removed in Unleash v5. Please use the [project-based endpoint to fetch all flags](/reference/api/legacy/unleash/admin/features-v2.mdx#fetching-toggles) instead.

:::

`GET: http://unleash.host.com/api/admin/features`

This endpoint is the one all admin ui should use to fetch all available feature flags from the _unleash-server_. The response returns all active feature flags and their current strategy configuration. A feature flag will have _at least_ one configured strategy. A strategy will have a `name` and `parameters` map.

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

### Filter feature flags {#filter-feature-toggles}

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

## Fetch specific feature flag {#fetch-specific-feature-toggle}

:::caution Removal notice

This endpoint was removed in Unleash v5 (deprecated since v4). Please use the [project-based endpoint to fetch specific flags](/reference/api/legacy/unleash/admin/features-v2.mdx#get-toggle) instead.

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

## Create a new Feature Flag {#create-a-new-feature-toggle}

:::caution Removal notice

This endpoint was removed in Unleash v5 (deprecated since v4). Please use the [project-based endpoint to create feature flags](/reference/api/legacy/unleash/admin/features-v2.mdx#create-toggle) instead.

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

Used by the admin-dashboard to create a new feature flags.

**Notes:**

- _name_ **must be globally unique**, otherwise you will get a _403-response_.
- _type_ is optional. If not defined it defaults to `release`

Returns 200-response if the feature flag was created successfully.

## Update a Feature Flag {#update-a-feature-toggle}

:::caution Removal notice
This endpoint was removed in Unleash v5. Please use the [project-based endpoint to update a feature flag](/reference/api/legacy/unleash/admin/features-v2.mdx#update-toggle) instead.
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

Used by the admin dashboard to update a feature flags. The name has to match an existing features flag.

Returns 200-response if the feature flag was updated successfully.

## Tag a Feature Flag {#tag-a-feature-toggle}

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

## Remove a tag from a Feature Flag {#remove-a-tag-from-a-feature-toggle}

`DELETE https://unleash.host.com/api/admin/features/:featureName/tags/:type/:value`

Removes the specified tag from the `(type, value)` tuple from the Feature Flag's list of tags.

**Success**

    - Returns _200-OK_

**Failures**

    - Returns 404 if the tag does not exist
    - Returns 500 if the database could not be reached

## Archive a Feature Flag {#archive-a-feature-toggle}

:::caution Removal notice
This endpoint was removed in v5. Please use the [project-based endpoint to archive flags](/reference/api/legacy/unleash/admin/features-v2.mdx#archive-toggle) instead.
:::


`DELETE: http://unleash.host.com/api/admin/features/:toggleName`

Used to archive a feature flag. A feature flag can never be totally be deleted, but can be archived. This is a design decision to make sure that a old feature flag does not suddenly reappear because someone else is re-using the same name.

## Enable a Feature Flag {#enable-a-feature-toggle}

:::caution Removal notice
This endpoint was removed in v5. Please use the [project-based endpoint to enable feature flags](/reference/api/legacy/unleash/admin/features-v2.mdx#enable-env) instead.
:::


`POST: http://unleash.host.com/api/admin/features/:featureName/toggle/on`

Used to enable a feature flag. The :featureName must match an existing Feature Flag. Returns 200-response if the feature flag was enabled successfully.

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

## Disable a Feature Flag {#disable-a-feature-toggle}

:::caution Removal notice
This endpoint was removed in v5. Please use the [project-based endpoint to disable feature flags](/reference/api/legacy/unleash/admin/features-v2.mdx#disable-env) instead.
:::

`POST: http://unleash.host.com/api/admin/features/:featureName/toggle/off`

Used to disable a feature flag. The :featureName must match an existing Feature Flag. Returns 200-response if the feature flag was disabled successfully.

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

## Mark a Feature Flag as "stale" {#mark-a-feature-toggle-as-stale}

:::caution Removal notice
This endpoint was removed in v5. Please use the [project-based endpoint to patch a feature flag and mark it as stale](/reference/api/legacy/unleash/admin/features-v2.mdx#patch-toggle) instead.
:::


`POST: http://unleash.host.com/api/admin/features/:featureName/stale/on`

Used to mark a feature flag as stale (deprecated). The :featureName must match an existing Feature Flag. Returns 200-response if the feature flag was enabled successfully.

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

## Mark a Feature Flag as "active" {#mark-a-feature-toggle-as-active}

:::caution Removal notice
This endpoint was removed in v5. Please use the [project-based endpoint to patch a feature flag and mark it as not stale](/reference/api/legacy/unleash/admin/features-v2.mdx#patch-toggle) instead.
:::

`POST: http://unleash.host.com/api/admin/features/:featureName/stale/off`

Used to mark a feature flag active (remove stale marking). The :featureName must match an existing Feature Flag. Returns 200-response if the feature flag was disabled successfully.

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
