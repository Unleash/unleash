---
id: unleash-proxy
title: Unleash Proxy
---

> The unleash-proxy is compatible with all Unleash Enterprise versions and Unleash Open-Source v4. You should reach out to **support@getunleash.io** if you want the Unleash Team to host the Unleash Proxy for you.

A lot of our users wanted to use feature toggles in their single-page and native applications. To solve this in a performant and privacy concerned way we built The Unleash Proxy

The Unleash Proxy sits between the Unleash API and the application. It provides a simple and super-fast API, as it has all the data it needs available in memory.

The proxy solves three important aspects:

- **Performance** – The proxy will cache all toggles in memory, and will be running on the edge, close to your end-users. A single instance will be able to handle thousands of request/sec, and you can scale it easily by adding additional instances.
- **Security** – The proxy evaluates the feature flags for the user on the server-side, and exposes results for feature flags that are enabled for a specific user (flags not enabled for that specific user are _not_ exposed).
- **Privacy** – If you run the proxy yourself (we can host it as well though) we will not see your end users. This means that you still have full control of your end-users, the way it should be!

![The Unleash Proxy](/img/The-unleash-proxy.png)

_The Unleash Proxy uses the Unleash SDK and exposes a simple API_. The Proxy will synchronize with the Unleash API in the background and provide a simple HTTP API for clients.
### Health endpoint

The proxy will try to synchronize with the Unleash API at startup, until it has successfully done that the proxy will return `HTTP 503 - Not Read?` for all request. You can use the health endpoint to validate that the proxy is ready to recieve requests:

```bash
curl http://localhost:3000/proxy/health -I
```

```bash
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: ETag
Content-Type: text/html; charset=utf-8
Content-Length: 2
ETag: W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"
Date: Fri, 04 Jun 2021 10:38:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```


## Custom activation strategies

The Unleash Proxy can load [custom activation strategies](../advanced/custom-activation-strategy.md) for front-end client SDKs ([Android](../sdks/android-proxy.md), [JavaScript](../sdks/proxy-javascript.md), [React](../sdks/proxy-react.md), [iOS](../sdks/proxy-ios.md)). For a step-by-step guide, refer to the [_how to use custom strategies_ guide](../how-to/how-to-use-custom-strategies.md#step-3-b).

To load custom strategies, use either of these two options:
- the **`customStrategies`** option: use this if you're running the Unleash Proxy via Node directly.
- the **`UNLEASH_CUSTOM_STRATEGIES_FILE`** environment variable: use this if you're running the proxy as a container.

Both options take a list of file paths to JavaScript files that export custom strategy implementations.

### Custom activation strategy files format

Each strategy file must export a list of instantiated strategies. A file can export as many strategies as you'd like.

Here's an example file that exports two custom strategies:

``` js
const { Strategy } = require('unleash-client');

class MyCustomStrategy extends Strategy {
  // ... strategy implementation
}

class MyOtherCustomStrategy extends Strategy {
  // ... strategy implementation
}

// export strategies
module.exports = [
    new MyCustomStrategy(),
    new MyOtherCustomStrategy()
];
```

Refer the [custom activation strategy documentation](../advanced/custom-activation-strategy.md#implementation) for more details on how to implement a custom activation strategy.

## Unleash Proxy API {#unleash-proxy-api}

The Unleash Proxy has a very simple API. It takes the [Unleash Context](../user_guide/unleash_context) as input and will return the feature toggles relevant for that specific context.

![The Unleash Proxy](/img/The-Unleash-Proxy-API.png)

### Payload

The `proxy` endpoint returns information about toggles enabled for the current user. The payload is a JSON object with a `toggles` property, which contains a list of toggles.


```json
{
  "toggles": [
    {
      "name": "demo",
      "enabled": true,
      "variant": {
        "name": "disabled",
        "enabled": false
      }
    },
    {
      "name": "demoApp.step1",
      "enabled": true,
      "variant": {
        "name": "disabled",
        "enabled": false
      }
    }
  ]
}
```

#### Toggle data

The data for a toggle without [variants](../advanced/feature-toggle-variants.md) looks like this:

``` json
{
  "name": "basic-toggle",
  "enabled": true,
  "variant": {
    "name": "disabled",
    "enabled": false
  }
}
```

- **`name`**: the name of the feature.
- **`enabled`**: whether the toggle is enabled or not. Will always be `true`.
- **`variant`**: describes whether the toggle has variants and, if it does, what variant is active for this user. If a toggle doesn't have any variants, it will always be `{"name": "disabled", "enabled": false}`.

:::note
Unleash uses a fallback variant called "disabled" to indicate that a toggle has no variants. However, you are free to create a variant called "disabled" yourself. In that case you can tell them apart by checking the variant's `enabled` property: if the toggle has no variants, `enabled` will be `false`. If the toggle is the "disabled" variant that you created, it will have `enabled` set to `true`.
:::


If a toggle has variants, then the variant object can also contain an optional `payload` property. The `payload` will contain data about the variant's payload: what type it is, and what the content is. To learn more about variants and their payloads, check [the feature toggle variants documentation](../advanced/feature-toggle-variants.md).

Variant toggles without payloads look will have their name listed and the `enabled` property set to `true`:

``` json
{
  "name": "toggle-with-variants",
  "enabled": true,
  "variant": {
    "name": "simple",
    "enabled": true
  }
}

```

If the variant has a payload, the optional `payload` property will list the payload's type and it's content in a stringified form:

``` json
{
  "name": "toggle-with-variants",
  "enabled": true,
  "variant": {
    "name": "with-payload-string",
    "payload": {
      "type": "string",
      "value": "this string is the variant's payload"
    },
    "enabled": true
  }
}
```

For the `variant` property:
- **`name`**: is the name of the variant, as shown in the Admin UI.
- **`enabled`**: indicates whether the variant is enabled or not. If the toggle has variants, this is always `true`.
- **`payload`** (optional): Only present if the variant has a payload. Describes the payload's type and content.

If the variant has a payload, the `payload` object contains:
- **`type`**: the type of the variant's payload
- **`value`**: the value of the variant's payload

The `value` will always be the payload's content as a string, escaped as necessary. For instance, a variant with a JSON payload would look like this:

``` json
{
  "name": "toggle-with-variants",
  "enabled": true,
  "variant": {
    "name": "with-payload-json",
    "payload": {
      "type": "json",
      "value": "{\"description\": \"this is data delivered as a json string\"}"
    },
    "enabled": true
  }
}
```

## We care about Privacy! {#we-care-about-privacy}

The Unleash Proxy is important because you should not expose your entire set of toggle configurations to your end users. Single page apps work in the context of a specific user. The proxy allows you to only provide data that relates to that one user: _The proxy will only return the evaluated toggles (with variants) that should be enabled for that specific user in that specific context._

Most of our customers prefer to run The Unleash Proxy themselves. PS! We actually prefer this as we don’t want to see your users. Running it is pretty simple, it is either a small Node.js process you start or a docker image you use. (We can of course host the proxy for you also.)



## How to connect to the Proxy? {#how-to-connect-to-the-proxy}

The Unleash Proxy takes the heavy lifting of evaluating toggles and only returns enabled toggles and their values to the client. This means that you would get away with a simple http-client in many common use-cases.

However in some settings you would like a bit more logic around it to make it as fast as possible, and keep up to date with changes.

- [JavaScript Proxy SDK](/sdks/proxy-javascript)
- [React Proxy SDK](/sdks/proxy-react)
- [Android Proxy SDK](/sdks/android_proxy_sdk)
- [iOS Proxy SDK](/sdks/proxy-ios)

The proxy is also ideal fit for serverless functions such as AWS Lambda. In that scenario the proxy can run on a small container near the serverless function, preferably in the same VPC, giving the lambda extremely fast access to feature flags, at a predictable cost.

## Configuration options

Regardless of how you choose to run the it, the proxy will need access to these three variables:

- **`unleashUrl`** / **`UNLEASH_URL`**

  The URL of your Unleash instance's API. For instance, to connect to the [Unleash demo app](https://app.unleash-hosted.com/demo/), you would use `https://app.unleash-hosted.com/demo/api/`

- **`unleashApiToken`** / **`UNLEASH_API_TOKEN`**

  The API token to connect to your Unleash project. For more information on how these work and how to create them, check out the [API token documentation](../user_guide/token.md).

- **`clientKeys`** / **`UNLEASH_PROXY_CLIENT_KEYS`**

  A list of client keys that the proxy will accept. For the proxy to accept an incoming request, the client must use one of these keys for authorization. In client SDKs, this is usually known as a `clientKey` or a `clientSecret`. If you query the proxy directly via HTTP, this is the `authorization` header.

  When using an environment variable to set the proxy secrets, the value should be a comma-separated list of strings, such as `secret-one,secret-two`.

There are many more configuration options available. You'll find all [available options on github](https://github.com/Unleash/unleash-proxy#available-options).

## Bootstrapping the Unleash Proxy {#bootstrap}

## Scaling the Unleash Proxy

## Hosting the Unleash Proxy

## Proxy connection

{ how to connect the proxy, what setups are possible etc. }
See #bootstrap
