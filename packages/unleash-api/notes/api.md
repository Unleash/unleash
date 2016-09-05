# API

## Fetch features:

This endpoint is the one all clients should use to fetch all available feature-toggles 
from the unleash-server. The response returns all active-toggles and the active 
strategy configuration. A feature-toggle will have at-least one strategy. A 
strategy will have a 'name' and 'parameters'.  

GET: http://unleash.host.com/features

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
**Important:**

_strategy_ and _paramters_ are deprecated fields and will go away in the next version, 2. 
They are kept for backward compatibility with older unleash-clients. _version_ property indicates 
the json-response version, making it easier for clients to parse the response. 


## Fetch a feature

GET: http://unleash.host.com/features/[featureName]

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

_Notice that you will not get a version property when fetching a specific feature toggle by name_.  

