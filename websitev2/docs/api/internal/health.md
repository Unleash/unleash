---
id: health
title: /health
---

# Health API

`GET http://unleash.host.com/health`

Used to check the health of the running Unleash instance. This endpoint has two possible responses:

`Status: 200`

```json
{
  "health": "GOOD"
}
```

This response means everything is OK. Unleash is able to talk to the PostgreSQL

`Status: 500`

```json
{
  "health": "BAD"
}
```

This response indicates that Unleash is not able to talk to PostgreSQL and will not be able to serve requests.
