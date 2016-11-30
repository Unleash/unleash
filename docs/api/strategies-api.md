## Strategies API

### Fetch Strategies 
`GET: http://unleash.host.com/api/strategies`

Used to fetch all defined strategies and their defined paramters. 

**Response**

 ```json
{
    "version": 1,
    "strategies": [
        {
        "name": "default",
        "description": "Default on/off strategy.",
            "parametersTemplate": null
        },
        {
            "name": "ActiveForUserWithEmail",
            "description": "A comma separated list of email adresses this feature should be active for.",
            "parametersTemplate": {
                "emails": "string"
            }
        },
        {
            "name": "Accounts",
            "description": "Enable for user accounts",
            "parametersTemplate": {
                "Accountname": "string"
            }
        }
]}
```

### Create strategy

`POST: http://unleash.host.com/api/strategies`

**Body**

```json
{
    "name": "ActiveForUserWithEmail",
    "description": "A comma separated list of email adresses this feature should be active for.",
    "parametersTemplate": {
        "emails": "string"
    }
}
```

Used to create a new Strategy. Name must be unique. 