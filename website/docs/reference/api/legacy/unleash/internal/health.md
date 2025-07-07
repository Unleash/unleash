---
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

This response means Unleash server is up.

`Status: 500`

This response indicates that Unleash server is unhealthy.
