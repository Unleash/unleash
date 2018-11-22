---
id: register
title: /api/client/register
---

### Client registration

`POST: http://unleash.host.com/api/client/register`

Registers a client instance with the unleash server. The client should send all fields specified.

```json
{
  "appName": "appName",
  "instanceId": "instanceId",
  "sdkVersion": "unleash-client-java:2.2.0",
  "strategies": ["default", "some-strategy-1"],
  "started": "2016-11-03T07:16:43.572Z",
  "interval": 10000
}
```

**Fields:**

- **appName** - Name of the application seen by unleash-server
- **instanceId** - Instance id for this application (typically hostname, podId or similar)
- **sdkVersion** - Optional field that describes the sdk version (name:version)
- **strategies** - List of strategies implemented by this application
- **started** - When this client started. Should be reported as [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) time.
- **interval** - At which interval, in milliseconds, will this client be expected to send metrics
