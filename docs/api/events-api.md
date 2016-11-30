# Events API

`GET: http://unleash.host.com/api/events`

Used to fetch all changes in the unleash system.

Defined event types:

- feature-created
- feature-updated
- feature-archived
- feature-revived
- strategy-created
- strategy-deleted

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