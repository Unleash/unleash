### Fetching Feature Toggles

`GET: http://unleash.host.com/api/client/features`

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

`GET: http://unleash.host.com/api/client/features/:featureName`

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
