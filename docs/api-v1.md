# API

## Feature Toggles

### Fetching Feature Toggles

**GET: http://unleash.host.com/features**

This endpoint is the one all clients should use to fetch all available feature-toggles 
from the unleash-server. The response returns all active-toggles and the active 
strategy configuration. A feature-toggle will have at-least one strategy. A 
strategy will have a 'name' and 'parameters'.

_Note:_ Clients should perfer the `strategies` property. Legacy props (`strategy` and `parameters`) 
will be kept until version 2 of the format.   

This endpoint should never return anything besides a valid *20X/304-response*. It will also 
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

**GET: http://unleash.host.com/features/:featureName**

Used to fetch details about a specific featureToggle. This is mostly provded to make it easy to debug the API. 

_Notice_: You will not get a version property when fetching a specific feature toggle by name.  

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

**POST: http://unleash.host.com/features/**

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

Used by the admin-dashboard to create a new feature toggles. The name has to be unique, 
otherwise you will get a _403-response_.  

Returns 200-respose if the feature toggle was created successfully. 

### Create a new Feature Toggle

**PUT: http://unleash.host.com/features/:toggleName**

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

Used by the admin-dashboard to update a feature toggles. The name has to match an existing features toggle. 

Returns 200-respose if the feature toggle was updated successfully. 


## Strategies

### Fetch Strategies 
**GET: http://unleash.host.com/strategies**

Used to fetch all defined strategies and their defined paramters. 

**Response**

 ```json
{
    version: 1,
    strategies: [
        {
        name: "default",
        description: "Default on/off strategy.",
            parametersTemplate: null
        },
        {
            name: "ActiveForUserWithEmail",
            description: "A comma separated list of email adresses this feature should be active for.",
            parametersTemplate: {
                emails: "string"
            }
        },
        {
            name: "Accounts",
            description: "Enable for user accounts",
            parametersTemplate: {
                Accountname: "string"
            }
        }
]}
```

### Create strategy

**POST: http://unleash.host.com/strategies**

**Body**

```json
{
    name: "ActiveForUserWithEmail",
    description: "A comma separated list of email adresses this feature should be active for.",
    parametersTemplate: {
        emails: "string"
    }
}
```

Used to create a new Strategy. Name must be unique. 



# Events

**GET: http://unleash.host.com/events**

Used to fetch all changes in the unleash system. 

**Response**

 ```json
{
    "version": 1,
    "events":[
        {
            "id":454,
            "type":"feature-updated",
            "createdBy":"unknown",
            "createdAt":"2016-08-24T11:22:01.354Z",
            "data": {
                "name":"eid.bankid.mobile",
                "description":"",
                "strategy":"default",
                "enabled":true,
                "parameters":{}
            },
            "diffs": [
                {"kind":"E","path":["enabled"],"lhs":false,"rhs":true}
            ]
        }
    ]
}
```
