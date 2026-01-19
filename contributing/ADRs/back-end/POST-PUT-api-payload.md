---
title: "ADR: POST/PUT API payload"
---

## Background

Whenever we receive a payload in our backend for POST or PUT requests we need to take into account backwards compatibility. When we add a new field to an existing API payload, clients using the previous version of the payload will not know about that new field. This means that we need to make sure that the new field is optional. If we make the field required, clients using the previous version of the payload will override the value of the new field with an empty value or null.

### Example: adding new setting field to project settings

Project settings on Unleash 5.3:
```shell
curl --location --request PUT 'http://localhost:4242/api/admin/projects/default' \
--header 'Authorization: INSERT_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "default",
  "name": "Default",
  "description": "Default project",
  "defaultStickiness": "default",
  "mode": "open"
}'
```

New version of project settings (Unleash 5.6):

```shell
curl --location --request PUT 'http://localhost:4242/api/admin/projects/default' \
--header 'Authorization: INSERT_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": "default",
  "name": "Default",
  "description": "Default project",
  "defaultStickiness": "default",
  "featureLimit": 2
}'
```

Pay attention to the new field feature limit. If a customer updates Unleash to 5.6 but their integration still does not send that field, it may result in the unwanted behavior of setting that field to empty in the database, in case the server assumes that not sending the field means setting it to empty / `null`.

This bug can easily be an oversight but can be prevented by following some rules when designing the API payload.

## Decision

When receiving a body from a request we need to take into account 3 possible cases:
1. The field has a value
2. The field is `undefined` or not part of the payload
3. The field is `null`

- If the field has a value, we need to update or set that value in the DB.
- If the field is `undefined` or not part of the payload, we need to leave the value in the DB as it is.
- If the field is `null`, we need to remove the value from the DB (set it as `null` on the DB).
