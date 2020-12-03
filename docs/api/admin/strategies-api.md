---
id: strategies
title: /api/admin/strategies
---

> In order to access the admin api endpoints you need to identify yourself. If you are using the `unsecure` authententication method, you may use [basic authenticaion](https://en.wikipedia.org/wiki/Basic_access_authentication) to ientify yourself.

### Fetch Strategies

`GET: http://unleash.host.com/api/admin/strategies`

Used to fetch all defined strategies and their defined paramters.

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

### Create strategy

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

### Update strategy

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

Used to update a Strategy definition. Name can't be changed. **PS! I can be dangerous to change a implemnted strategy as the implementation also might need to be changed**
