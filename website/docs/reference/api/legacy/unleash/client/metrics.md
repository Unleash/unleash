---
id: metrics
title: /api/client/metrics
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />


### Send metrics {#send-metrics}

`POST: http://unleash.host.com/api/client/metrics`

Register a metrics payload with a timed bucket.

```json
{
  "appName": "appName",
  "instanceId": "instanceId",
  "bucket": {
    "start": "2016-11-03T07:16:43.572Z",
    "stop": "2016-11-03T07:16:53.572Z",
    "toggles": {
      "toggle-name-1": {
        "yes": 123,
        "no": 321
      },
      "toggle-name-2": {
        "yes": 111,
        "no": 0
      }
    }
  }
}
```
