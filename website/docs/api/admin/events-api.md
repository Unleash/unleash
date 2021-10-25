---
id: events
title: /api/admin/events
---

> In order to access the admin API endpoints you need to identify yourself. Unless you're using the `none` authentication method, you'll need to [create an ADMIN token](/user_guide/api-token) and add an Authorization header using the token.

# Events API

`GET: http://unleash.host.com/api/admin/events`

Used to fetch all changes in the unleash system.

Defined event types:

- feature-created
- feature-updated
- feature-archived
- feature-revived
- strategy-created
- strategy-deleted
- tag-created
- tag-deleted
- tag-type-created
- tag-type-updated
- tag-type-deleted
- application-created

**Response**

```json
{
  "version": 1,
  "events": [
    {
      "id": 454,
      "type": "feature-updated",
      "createdBy": "unknown",
      "createdAt": "2016-08-24T11:22:01.354Z",
      "data": {
        "name": "eid.bankid.mobile",
        "description": "",
        "strategy": "default",
        "enabled": true,
        "parameters": {}
      },
      "diffs": [{ "kind": "E", "path": ["enabled"], "lhs": false, "rhs": true }]
    }
  ]
}
```
