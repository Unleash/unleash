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


### Seen-toggles

`GET http://unleash.host.com/api/client/seen-toggles`

This enpoints returns a list of applications and what toogles 
unleash has seend for each application. It will only guarantee 
toggles reported by client applications within the last hour, but
will in most cases remember seen-toggles for applications longer

**Example response:** 

```json
[
  {
    "appName": "demo-app",
    "seenToggles": [
      "add-feature-2",
      "toggle-2",
      "toggle-3"
    ],
    "metricsCount": 127
  },
  {
    "appName": "demo-app-2",
    "seenToggles": [
      "add-feature-2",
      "toggle-2",
      "toggle-3"
    ],
    "metricsCount": 21
  }
]
```

**Fields:**

* **appName** - Name of the application seen by unleash-server
* **seenToggles** - array of toggles names seen by unleash-server for this application
* **metricsCount** - number of metrics counted across all toggles for this application.  


### Feature-Toggles metrics

`GET http://unleash.host.com/api/client/metrics/feature-toggles`

This endpoint gives _last minute_ and _last hour_ metrics for all active toggles. This is based on 
metrics reported by client applications. Yes is the number of times a given feature toggle 
was evaluated to enabled in a client applcation, and no is the number it avaluated to false. 



**Example response:** 

```json
{
  "lastHour": {
    "add-feature-2": {
      "yes": 0,
      "no": 527
    },
    "toggle-2": {
      "yes": 265,
      "no": 85
    },
    "toggle-3": {
      "yes": 257,
      "no": 93
    }
  },
  "lastMinute": {
    "add-feature-2": {
      "yes": 0,
      "no": 527
    },
    "toggle-2": {
      "yes": 265,
      "no": 85
    },
    "toggle-3": {
      "yes": 257,
      "no": 93
    }
  }
}
```

**Fields:**

* **lastHour** - Hour projection collected metrics for all feature toggles. 
* **lastMinute** - Mintue projection collected metrics for all feature toggles. 


### Applications

`GET  http://unleash.host.com/api/client/applications`

This endpoint returns a list of known applications (seen the last two days) and 
a link to follow for more datails.  


```json
{
  "applications": [
    {
      "appName": "another",
      "strategies": [
        "default",
        "other",
        "brother"
      ],
      "createdAt": "2016-12-09T14:56:36.730Z",
      "links": {
        "appDetails": "/api/client/applications/another"
      }
    },
    {
      "appName": "bow",
      "strategies": [
        "default",
        "other",
        "brother"
      ],
      "createdAt": "2016-12-09T14:56:36.730Z",
      "links": {
        "appDetails": "/api/client/applications/bow"
      }
    }
  ]
}
```

#### Query Params
You can also specify the query param: _strategyName_, which will return all applications 
implementing the given strategy.

`GET  http://unleash.host.com/api/client/applications?strategyName=someStrategyName`




### Application Details

`GET  http://unleash.host.com/api/client/applications/:appName`

This endpoint gives insight into details about a client applcation, such as instances, 
strategies implemented and seen toogles. 




```json
{
  "appName": "demo-app",
  "instances": [
    {
      "instanceId": "generated-732038-17080",
      "clientIp": "::ffff:127.0.0.1",
      "lastSeen": "2016-11-30T17:32:04.265Z",
      "createdAt": "2016-11-30T17:31:08.914Z"
    },
    {
      "instanceId": "generated-639919-11185",
      "clientIp": "::ffff:127.0.0.1",
      "lastSeen": "2016-11-30T16:04:15.991Z",
      "createdAt": "2016-11-30T10:49:11.223Z"
    },
  ],
  "strategies": [
    {
      "appName": "demo-app",
      "strategies": [
        "default",
        "extra"
      ]
    }
  ],
  "seenToggles": [
    "add-feature-2",
    "toggle-2",
    "toggle-3"
  ]
}
```

### Seen applications

`GET  http://unleash.host.com/api//client/seen-apps`

This endpoint gives insight into details about application seen per feature toggle.


```json
{
  "my-toggle": [
    {
      "appName": "my-app",
      "createdAt": "2016-12-28T10:39:24.966Z",
      "updatedAt": "2017-01-06T15:32:41.932Z",
      "description": "our main app",
      "strategies": [
        "gradualRolloutRandom",
        "abTest",
        "default",
        "betaUser",
        "userWithId",
        "byHostName",
        "gradualRolloutWithSessionId",
        "gradualRollout",
        "byRemoteAddr"
      ],
      "url": "http://example.com",
      "color": null,
      "icon": "terrain"
    },
    {
      "appName": "my-other-app",
      "createdAt": "2016-12-28T10:39:24.966Z",
      "updatedAt": "2017-01-06T15:32:41.932Z",
      "description": "our other app",
      "strategies": [
        "default",
      ],
      "url": "http://example.com",
      "color": null,
      "icon": "desktop"
    }
  ]
}
```
