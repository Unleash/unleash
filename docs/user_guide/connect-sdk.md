---
id: connect_sdk
title: Connect your SDK
---

In order to connect your application to Unleash you need to use a client SDK for your programming language. Unleash-hosted instances will always be a protected instance, you will therefore have to specify a client secret as the authorization header when you are connecting your client SDK.

On this page you find examples for connecting your application to the demo instance. If you are connecting to your own private instance you will have to remember to replace the client secret and the API url given in the examples.

We have examples for all official client SDKs:

- Java SDK
- Node.js SDK
- .NET SDK
- Go SDK
- Ruby SDK
- Python SDK

When you get access to your instance – we will provide you with your Client secret and your API url for your instance.

## Demo instance secrets
Our demo instance has the following settings – use these in case you would like to connect your test-app to our demo environment.

### Client secret
```sh
56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d
```

### API url:
```sh
https://app.unleash-hosted.com/demo/api/
```

### Test with curl:
```sh
curl https://app.unleash-hosted.com/demo/api/client/features \     
-H "Authorization: 56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d";
```

## Java SDK
```java
UnleashConfig unleashConfig = UnleashConfig.builder()
        .appName("my.java-app")
        .instanceId("your-instance-1")
        .unleashAPI("<API url>")
        .customHttpHeader("Authorization", "<client secret>")
        .build();

    Unleash unleash = new DefaultUnleash(config);
```      
Read more at [github.com/Unleash/unleash-client-java](https://github.com/Unleash/unleash-client-java)

## Node.js SDK

```js
const unleash = require('unleash-client');
    
unleash.initialize({
  url: '<API url>',
  appName: 'my-node-name',
  instanceId: 'my-unique-instance-id',
  customHeaders: {'Authorization': '<Client secret>'}
});
```
Read more at [github.com/Unleash/unleash-client-node](https://github.com/Unleash/unleash-client-node)
 
## Go SDK
```golang
import (
  "github.com/Unleash/unleash-client-go/v3"
)

func init() {
  unleash.Initialize(
    unleash.WithAppName("my-node-app"),
    unleash.WithUrl("<API url>"),
    unleash.WithCustomHeaders(http.Header{"Authorization": {"<Client secret>"}}),
  )
}
```
Read more at [github.com/Unleash/unleash-client-go](https://github.com/Unleash/unleash-client-go)

## Ruby SDK
```ruby


    require 'unleash'
  
    @unleash = Unleash::Client.new(
      url: '<API url>',
      app_name: 'simple-test',
      custom_http_headers = {'Authorization': '<Client secret>'},
    )
```    
Read more at [github.com/Unleash/unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby)

## Python SDK
```python

    from UnleashClient import UnleashClient
  
    client = UnleashClient(
        url="<API url>",
        app_name="my-python-app",
        custom_headers={'Authorization': '<Client secret>'})
    
    client.initialize_client()
  
    client.is_enabled("unleash.beta.variants")
```

Read more at [github.com/Unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)

## .NET SDK
```csharp
    var settings = new UnleashSettings()
    {
        AppName = "dotnet-test",
        InstanceTag = "instance z",
        UnleashApi = new Uri("<API url>"),
        SendMetricsInterval = TimeSpan.FromSeconds(20),
        CustomHttpHeaders = new Dictionary<string, string>()
        {
            {"Authorization","<Client secret>" }
        }
    };
  
    var unleash = new DefaultUnleash(settings);
```
Read more at [https://github.com/Unleash/unleash-client-dotnet](https://github.com/Unleash/unleash-client-dotnet)
