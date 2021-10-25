---
id: strategies
title: /api/admin/strategies
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

### Fetch Strategies {#fetch-strategies}

`GET: http://unleash.host.com/api/admin/strategies`

Used to fetch all defined strategies and their defined parameters.

**Response**

```json
{
  "version": 1,
  "strategies": [
    {
      "name": "default",
      "description": "Default on/off strategy.",
      "parameters": []
    },
    {
      "name": "userWithId",
      "description": "Active for userId specified in the comma seperated 'userIds' parameter.",
      "parameters": [
        {
          "name": "userIds",
          "type": "list",
          "description": "List of unique userIds the feature should be active for.",
          "required": true
        }
      ]
    },
    {
      "name": "gradualRollout",
      "description": "Gradual rollout to logged in users",
      "parameters": [
        {
          "name": "percentage",
          "type": "percentage",
          "description": "How many percent should the new feature be active for.",
          "required": false
        },
        {
          "name": "group",
          "type": "string",
          "description": "Group key to use when hasing the userId. Makes sure that the same user get different value for different groups",
          "required": false
        }
      ]
    }
  ]
}
```

### Create strategy {#create-strategy}

`POST: http://unleash.host.com/api/admin/strategies`

**Body**

```json
{
    "name": "gradualRollout",
    "description": "Gradual rollout to logged in users",
    "parameters": [
        {
            "name": "percentage",
            "type": "percentage",
            "description": "How many percent should the new feature be active for.",
            "required": false
        },
        {
            "name": "group",
            "type": "string",
            "description": "Group key to use when hasing the userId. Makes sure that the same user get different value for different groups",
            "required": false
        }
    ]
},
```

Used to create a new Strategy. Name is required and must be unique. It is also required to have a parameters array, but it can be empty.

### Update strategy {#update-strategy}

`PUT: http://unleash.host.com/api/admin/strategies/:name`

**Body**

```json
{
    "name": "gradualRollout",
    "description": "Gradual rollout to logged in users with updated desc",
    "parameters": [
        {
            "name": "percentage",
            "type": "percentage",
            "description": "How many percent should the new feature be active for.",
            "required": false
        },
        {
            "name": "group",
            "type": "string",
            "description": "Group key to use when hasing the userId. Makes sure that the same user get different value for different groups",
            "required": false
        }
    ]
},
```

Used to update a Strategy definition. Name can't be changed. **PS! I can be dangerous to change an implemented strategy as the implementation also might need to be changed**

### Deprecate strategy {#deprecate-strategy}

`POST: https://unleash.host.com/api/admin/strategies/:name/deprecate`

Used to deprecate a strategy definition. This will set the deprecated flag to true. If the strategy is already deprecated, this will be a noop.

#### Errors {#errors}

_404 NOT FOUND_ - if `:name` does not exist

### Reactivate strategy {#reactivate-strategy}

`POST: https://unleash.host.com/api/admin/strategies/:name/reactivate`

Used to reactivate a deprecated strategy definition. This will set the deprecated flag back to false. If the strategy is not deprecated this is a noop and will still return 200.

#### Errors {#errors-1}

_404 NOT FOUND_ - if `:name` does not exist
