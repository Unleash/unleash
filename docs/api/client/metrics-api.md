# This document describes the client metrics endpoints

### Client registration

`POST: http://unleash.host.com/api/client/register`

Register a client instance with the unleash server. The client should send all fields specified. 

```json
{
    "appName": "appName",
    "instanceId": "instanceId",
    "strategies": ["default", "some-strategy-1"],
    "started": "2016-11-03T07:16:43.572Z",
    "interval": 10000,
}
```


**Fields:**

* **appName** - Name of the application seen by unleash-server
* **instanceId** - Instance id for this application (typically hostname, podId or similar)
* **strategies** - List of strategies implemented by this application
* **started** - When this client started. Should be reported as UTC time.
* **interval** - At wich interval will this client be expected to send metrics? 

### Send metrics

`POST http://unleash.host.com/api/client/metrics`

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
    },
}
```
