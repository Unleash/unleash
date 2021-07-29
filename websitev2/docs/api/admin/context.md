---
id: context
title: /api/admin/context
---

> The context feature is only available as part of Unleash Enterprise. In order to access the API programmatically you need to make sure you [obtain a API token](/user_guide/api-token) with admin permissions.

### List context fields defined in Unleash {#list-context-fields-defined-in-unleash}

`GET https://unleash.host.com/api/admin/context`

Returns a list of context fields defined in Unleash.

**Example response:**

```json
[
  {
    "name": "appName",
    "description": "Allows you to constrain on application name",
    "stickiness": false,
    "sortOrder": 2,
    "createdAt": "2020-03-05T19:33:19.784Z"
  },
  {
    "name": "environment",
    "description": "Allows you to constrain on application environment",
    "stickiness": false,
    "sortOrder": 0,
    "legalValues": ["qa", "dev", "prod"],
    "createdAt": "2020-03-05T19:33:19.784Z"
  },
  {
    "name": "tenantId",
    "description": "Control rollout to your tenants",
    "stickiness": true,
    "sortOrder": 10,
    "legalValues": ["company-a, company-b"],
    "createdAt": "2020-03-05T19:33:19.784Z"
  },
  {
    "name": "userId",
    "description": "Allows you to constrain on userId",
    "stickiness": false,
    "sortOrder": 1,
    "createdAt": "2020-03-05T19:33:19.784Z"
  }
]
```

### Create a new context field {#create-a-new-context-field}

`POST https://unleash.host.com/api/admin/context`

Creates a new context field.

**Body**

```json
{
  "name": "region",
  "description": "Control rollout based on region",
  "legalValues": ["asia", "eu", "europe"],
  "stickiness": true
}
```

### Update a context field {#update-a-context-field}

`PUT https://unleash.host.com/api/context/:name`

Updates a new context field

**Body**

```json
{
  "name": "region",
  "description": "Control rollout based on region",
  "legalValues": ["asia", "eu"],
  "stickiness": true
}
```

### Delete a context field {#delete-a-context-field}

`DELETE https://unleash.host.com/api/admin/context/:name`

Deletes the context field with name=`name`.
