---
id: tags
title: /api/admin/tags
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### Create a new tag {#create-a-new-tag}

`POST https://unleash.host.com/api/admin/tags`

Creates a new tag without connecting it to any other object, can be helpful to build an autocomplete list.

**Body**

```json
{
  "value": "MyTag",
  "type": "simple"
}
```

### Notes {#notes}

- `type` must exist in tag-types

### List tags {#list-tags}

`GET https://unleash.host.com/api/admin/tags`

This endpoint is the one all admin UIs should use to fetch all available tags from the _unleash_server_. The response returns all tags.

**Example response:**

```json
{
  "version": 1,
  "tags": [
    {
      "value": "Team-Red",
      "type": "simple"
    },
    {
      "value": "Team-Green",
      "type": "simple"
    },
    {
      "value": "DecemberExperiment",
      "type": "simple"
    },
    {
      "value": "#team-alert-channel",
      "type": "slack"
    }
  ]
}
```

### List tags by type {#list-tags-by-type}

`GET: https://unleash.host.com/api/admin/tags/:type`

Lists all tags of `:type`. If none exist, returns the empty list

**Example response to query for https://unleash.host.com/api/admin/tags/simple**

```json
{
  "version": 1,
  "tags": [
    {
      "value": "Team-Red",
      "type": "simple"
    },
    {
      "value": "Team-Green",
      "type": "simple"
    },
    {
      "value": "DecemberExperiment",
      "type": "simple"
    }
  ]
}
```

### Get a single tag {#get-a-single-tag}

`GET https://unleash.host.com/api/admin/tags/:type/:value`

Gets the tag defined by the `type, value` tuple

### Delete a tag {#delete-a-tag}

`DELETE https://unleash.host.com/api/admin/tags/:type/:value`

Deletes the tag defined by the `type, value` tuple; all features tagged with this tag will lose the tag.

### Fetching Tag types {#fetching-tag-types}

`GET: https://unleash.host.com/api/admin/tag-types`

Used to fetch all types the server knows about. This endpoint is the one all admin UI should use to fetch all available tag types from the _unleash-server_. The response returns all tag types. Any server will have _at least_ one configured tag type (the `simple` type). A tag type will be a map of `type`, `description`, `icon`

**Example response:**

```json
{
  "version": 1,
  "tagTypes": [
    {
      "name": "simple",
      "description": "Arbitrary tags. Used to simplify filtering of features",
      "icon": "#"
    }
  ]
}
```

### Get a single tag type {#get-a-single-tag-type}

`GET: https://unleash.host.com/api/admin/tag-types/simple`

Used to fetch details about a specific tag-type. This is mostly provided to make it easy to debug the API and should not be used by the client implementations.

**Example response:**

```json
{
  "version": 1,
  "tagType": {
    "name": "simple",
    "description": "Some description",
    "icon": "Some icon",
    "createdAt": "2021-01-07T10:00:00Z"
  }
}
```

### Create a new tag type {#create-a-new-tag-type}

`POST: https://unleash.host.com/api/admin/tag-types`

Used to register a new tag type. This endpoint should be used to inform the server about a new type of tags.

**Body:**

```json
{
  "name": "tagtype",
  "description": "Purpose of tag type",
  "icon": "Either an URL to icon or a simple prefix string for tag"
}
```

**Notes:**

- if `name` is not unique, will return 409 CONFLICT, if you'd like to update an existing tag through admin-api look at [Update tag type](#Update-tag-type).

Returns 201-CREATED if the tag type was created successfully

### Update tag type {#update-tag-type}

`PUT: https://unleash.host.com/api/admin/tag-types/:typeName`

**Body:**

```json
{
  "description": "New description",
  "icon": "New icon"
}
```

### Deleting a tag type {#deleting-a-tag-type}

`DELETE: https://unleash.host.com/api/admin/tag-types/:typeName`

Returns 200 if the type was not in use and the type was deleted. If the type was in use, will return a _409 CONFLICT_
