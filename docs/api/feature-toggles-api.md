### Fetching Feature Toggles

`GET: http://unleash.host.com/api/features`

**HEADERS:**

* UNLEASH-APPNAME: appName
* UNLEASH-INSTANCEID: instanceId

This endpoint is the one all clients should use to fetch all available feature toggles 
from the _unleash-server_. The response returns all active feature toggles and their 
current strategy configuration. A feature toggle will have _at least_ one configured strategy. 
A strategy will have a `name` and `parameters` map.

> _Note:_ Clients should perfer the `strategies` property. 
> Legacy properties (`strategy` & `parameters`) will be kept until **version 2** of the format.   

This endpoint should never return anything besides a valid *20X or 304-response*. It will also 
include a `Etag`-header. The value of this header can be used by clients as the value of 
the `If-None-Match`-header in the request to prevent a data transfer if the clients already
has the latest response locally.

**Example response:**
```json
{
  "version": 1,
  "features": [
    {
      "name": "Feature.A",
      "description": "lorem ipsum",
      "enabled": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "strategy": "default",
      "parameters": {}
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
      "strategy": "ActiveForUserWithId",
      "parameters": {
        "userIdList": "123,221,998"
      }
    }
  ]
}
```

`GET: http://unleash.host.com/api/features/:featureName`

Used to fetch details about a specific featureToggle. This is mostly provded to make it easy to 
debug the API and should not be used by the client implementations.

> _Notice_: You will not get a version property when fetching a specific feature toggle by name.  

```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ],
  "strategy": "default",
  "parameters": {}
}
```


### Create a new Feature Toggle

`POST: http://unleash.host.com/api/features/`

**Body:**
 ```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ]
}
```

Used by the admin-dashboard to create a new feature toggles. The name **must be unique**, 
otherwise you will get a _403-response_.  

Returns 200-respose if the feature toggle was created successfully. 

### Update a Feature Toggle

`PUT: http://unleash.host.com/api/features/:toggleName`

**Body:**
 ```json
{
  "name": "Feature.A",
  "description": "lorem ipsum..",
  "enabled": false,
  "strategies": [
    {
      "name": "default",
      "parameters": {}
    }
  ]
}
```

Used by the admin dashboard to update a feature toggles. The name has to match an 
existing features toggle. 

Returns 200-respose if the feature toggle was updated successfully. 

### Archive a Feature Toggle

`DELETE: http://unleash.host.com/api/features/:toggleName`

Used to archive a feature toggle. A feature toggle can never be totally be deleted, 
but can be archived. This is a design decision to make sure that a old feature 
toggle suddnely reapear by some one else reusing the same name.

## Archive

### Fetch archived toggles

`GET http://unleash.host.com/api/archive/features`

Used to fetch list of archived feature toggles

**Example response:**
```json
{
  "version": 1,
  "features": [
    {
      "name": "Feature.A",
      "description": "lorem ipsum",
      "enabled": false,
      "strategies": [
        {
          "name": "default",
          "parameters": {}
        }
      ],
      "strategy": "default",
      "parameters": {}
    }
  ]
}
```

### Revive feature toggle

`POST http://unleash.host.com/api/archive/revive`

**Body:**
 ```json
{
  "name": "Feature.A"
}
```

Used to revive a feature toggle. 
