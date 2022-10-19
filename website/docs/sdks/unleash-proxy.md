---
id: unleash-proxy
title: Unleash Proxy
---

> The unleash-proxy is compatible with all Unleash Enterprise versions and Unleash Open-Source v4. You should reach out to **support@getunleash.io** if you want the Unleash Team to host the Unleash Proxy for you.

:::tip

Looking for how to run the Unleash proxy? Check out the [_How to run the Unleash Proxy_ guide](../how-to/how-to-run-the-unleash-proxy.mdx)!

:::

A lot of our users wanted to use feature toggles in their single-page and native applications. To solve this in a performant and privacy-focused way we built the Unleash proxy.

The Unleash Proxy sits between the Unleash API and the application. It provides a simple and super-fast API, as it has all the data it needs available in memory.

The proxy solves three important aspects:

- **Performance** – The proxy will cache all toggles in memory, and will be running on the edge, close to your end-users. A single instance will be able to handle thousands of request/sec, and you can scale it easily by adding additional instances.
- **Security** – The proxy evaluates the feature flags for the user on the server-side, and exposes results for feature flags that are enabled for a specific user (flags not enabled for that specific user are _not_ exposed).
- **Privacy** – If you run the proxy yourself (we can host it as well though) we will not see your end users. This means that you still have full control of your end-users, the way it should be!

![The Unleash Proxy](/img/The-unleash-proxy.png)

_The Unleash Proxy uses the Unleash SDK and exposes a simple API_. The Proxy will synchronize with the Unleash API in the background and provide a simple HTTP API for clients.

## Configuration

:::info

You **must configure** these three variables for the proxy to start successfully:

- `unleashUrl` / `UNLEASH_URL`

- `unleashApiToken` / `UNLEASH_API_TOKEN`

- `clientKeys` / `UNLEASH_PROXY_CLIENT_KEYS`

:::

The Proxy has a large number of configuration options that you can use to adjust it to your specific use case. The table below lists all the available options.

| Option | Environment Variable | Default value | Required | Description |
| --- | --- | --- | :-: | --- |
| `clientKeys` | `UNLEASH_PROXY_CLIENT_KEYS` | n/a | yes | List of [client keys](../reference/api-tokens-and-client-keys.mdx#proxy-client-keys) that the proxy should accept. When querying the proxy, Proxy SDKs must set the request's _client keys header_ to one of these values. The default client keys header is `Authorization`. When using an environment variable to set the proxy secrets, the value should be a comma-separated list of strings, such as `secret-one,secret-two`. |
| `clientKeysHeaderName` | `CLIENT_KEY_HEADER_NAME` | `"authorization"` | no | The name of the HTTP header to use for client keys. Incoming requests must set the value of this header to one of the Proxy's `clientKeys` to be authorized successfully. |
| `customStrategies` | `UNLEASH_CUSTOM_STRATEGIES_FILE` | `[]` | no | Use this option to inject implementation of custom activation strategies. If you are using `UNLEASH_CUSTOM_STRATEGIES_FILE`: provide a valid path to a JavaScript file which exports an array of custom activation strategies. |
| `enableOAS` | `ENABLE_OAS` | `false` | no | Set to `true` to expose the proxy's OpenAPI spec at `/docs/openapi.json` and an interactive Swagger interface at `/docs/openapi`. Read more in the [OpenAPI section](#openapi). |
| `environment` | `UNLEASH_ENVIRONMENT` | `undefined` | no | If set this will be the `environment` used by the proxy in the Unleash Context. It will not be possible for proxy SDKs to override the environment if set. |
| `logLevel` | `LOG_LEVEL ` | `"warn"` | no | Used to set `logLevel`. Supported options: `"debug"`, `"info"`, `"warn"`, `"error"` and `"fatal"` |
| `logger` | n/a | `SimpleLogger` | no | Register a custom logger. |
| `metricsInterval` | `UNLEASH_METRICS_INTERVAL` | `30000` | no | How often the proxy should send usage metrics back to Unleash, defined in ms. |
| `namePrefix` | `UNLEASH_NAME_PREFIX` | `undefined` | no | If set, the Proxy will only fetch toggles whose name start with the provided prefix. |
| `projectName` | `UNLEASH_PROJECT_NAME` | `undefined` | no | If set, the Proxy will only fetch toggles belonging to the project with this ID. |
| `proxyBasePath` | `PROXY_BASE_PATH` | `""` | no | The base path to run the proxy from. "/proxy" will be added at the end. For instance, if `proxyBasePath` is `"base/path"`, the proxy will run at `/base/path/proxy`. |
| `proxyPort` | `PORT` | `3000` | no | The port to run the proxy on. |
| `proxySecrets` | `UNLEASH_PROXY_SECRETS` | n/a | no | Deprecated alias for `clientKeys`. Please use `clientKeys` instead. |
| `refreshInterval` | `UNLEASH_FETCH_INTERVAL` | `5000` | no | How often the proxy should query Unleash for updates, defined in ms. |
| `tags` | `UNLEASH_TAGS` | `undefined` | no | If set, the proxy will only fetch feature toggles with these [tags](../advanced/tags.md). The format should be `tagName:tagValue,tagName2:tagValue2` |
| `trustProxy` | `TRUST_PROXY ` | `false` | no | If enabled, the Unleash Proxy will know that it is itself sitting behind a proxy and that the `X-Forwarded-*` header fields (which otherwise may be easily spoofed) can be trusted. The proxy will automatically enrich the IP address in the Unleash Context. Can be `true/false` (trust all proxies) or a string (trust only given IP/CIDR (e.g. `'127.0.0.1'`)). If it is a string, it can also be a list of comma separated values (e.g. `'127.0.0.1,192.168.1.1/24'` |
| `unleashApiToken` | `UNLEASH_API_TOKEN` | n/a | yes | The [client API token](../reference/api-tokens-and-client-keys.mdx#client-tokens) for connecting to Unleash API. |
| `unleashAppName` | `UNLEASH_APP_NAME` | `"unleash-proxy" ` | no | The application name to use when registering with Unleash |
| `unleashInstanceId` | `UNLEASH_INSTANCE_ID` | auto-generated | no | A unique(-ish) identifier for your instance. Typically a hostname, pod id or something similar. Unleash uses this to separate metrics from the client SDKs with the same `unleashAppName`. |
| `unleashUrl` | `UNLEASH_URL` | n/a | yes | The API URL of the Unleash instance you want to connect to. |

## Privacy and hosting options {#privacy-and-hosting}

<div id="we-care-about-privacy"></div>

The Unleash Proxy is important because you should not expose your entire set of toggle configurations to your end users. Single page apps work in the context of a specific user. The proxy allows you to only provide data that relates to that one user: _The proxy will only return the evaluated toggles (with variants) that should be enabled for that specific user in that specific context._

Most of our customers prefer to run the Unleash proxy themselves. We actually prefer this as we don’t want to see your users. Running it is pretty simple, it is either a small Node.js process you start or a docker image you use. (We can of course host the proxy for you also.)

For more information on the various hosting options and their tradeoffs, refer to the [proxy hosting strategies topic document](../topics/proxy-hosting.mdx).

## Health endpoint

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

:::info Limitations for hosted proxies

Custom activation strategies can **not** be used with the Unleash-hosted proxy available to Pro and Enterprise customers.

:::

The Unleash Proxy can load [custom activation strategies](../advanced/custom-activation-strategy.md) for front-end client SDKs ([Android](../sdks/android-proxy.md), [JavaScript](../sdks/proxy-javascript.md), [React](../sdks/proxy-react.md), [iOS](../sdks/proxy-ios.md)). For a step-by-step guide, refer to the [_how to use custom strategies_ guide](../how-to/how-to-use-custom-strategies.md#step-3-b).

To load custom strategies, use either of these two options:

- the **`customStrategies`** option: use this if you're running the Unleash Proxy via Node directly.
- the **`UNLEASH_CUSTOM_STRATEGIES_FILE`** environment variable: use this if you're running the proxy as a container.

Both options take a list of file paths to JavaScript files that export custom strategy implementations.

### Custom activation strategy files format

Each strategy file must export a list of instantiated strategies. A file can export as many strategies as you'd like.

Here's an example file that exports two custom strategies:

```js
const { Strategy } = require('unleash-client');

class MyCustomStrategy extends Strategy {
  // ... strategy implementation
}

class MyOtherCustomStrategy extends Strategy {
  // ... strategy implementation
}

// export strategies
module.exports = [new MyCustomStrategy(), new MyOtherCustomStrategy()];
```

Refer the [custom activation strategy documentation](../advanced/custom-activation-strategy.md#implementation) for more details on how to implement a custom activation strategy.

## Unleash Proxy API {#unleash-proxy-api}

The Unleash Proxy has a very simple API. It takes the [Unleash Context](../user_guide/unleash_context) as input and will return the feature toggles relevant for that specific context.

![The Unleash Proxy](/img/The-Unleash-Proxy-API.png)

### OpenAPI integration and API documentation {#openapi}

:::info

Availability The OpenAPI integration is available in versions 0.9 and later of the Unleash proxy.

:::

The proxy can optionally expose a runtime-generated OpenAPI JSON spec and a corresponding OpenAPI UI for its API. The OpenAPI UI page is an interactive page where you can discover and test the API endpoints the proxy exposes. The JSON spec can be used to generate an OpenAPI client with OpenAPI tooling such as the [OpenAPI generator](https://openapi-generator.tech/).

To enable the JSON spec and UI, set `ENABLE_OAS` (environment variable) or `enableOAS` (in-code configuration variable) to `true`.

The spec and UI can then be found at `<base url>/docs/openapi.json` and `<base url>/docs/openapi` respectively.

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

```json
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

:::note The "disabled" variant

Unleash uses a fallback variant called "disabled" to indicate that a toggle has no variants. However, you are free to create a variant called "disabled" yourself. In that case you can tell them apart by checking the variant's `enabled` property: if the toggle has no variants, `enabled` will be `false`. If the toggle is the "disabled" variant that you created, it will have `enabled` set to `true`.

:::

If a toggle has variants, then the variant object can also contain an optional `payload` property. The `payload` will contain data about the variant's payload: what type it is, and what the content is. To learn more about variants and their payloads, check [the feature toggle variants documentation](../advanced/feature-toggle-variants.md).

Variant toggles without payloads look will have their name listed and the `enabled` property set to `true`:

```json
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

```json
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

```json
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

## How to connect to the Proxy? {#how-to-connect-to-the-proxy}

The Unleash Proxy takes the heavy lifting of evaluating toggles and only returns enabled toggles and their values to the client. This means that you would get away with a simple http-client in many common use-cases.

However in some settings you would like a bit more logic around it to make it as fast as possible, and keep up to date with changes.

- [Android Proxy SDK](sdks/android-proxy.md)
- [iOS Proxy SDK](sdks/proxy-ios.md)
- [Javascript Proxy SDK](sdks/proxy-javascript.md)
- [React Proxy SDK](sdks/proxy-react.md)
- [Svelte Proxy SDK](sdks/proxy-svelte.md)
- [Vue Proxy SDK](sdks/proxy-vue.md)

The proxy is also ideal fit for serverless functions such as AWS Lambda. In that scenario the proxy can run on a small container near the serverless function, preferably in the same VPC, giving the lambda extremely fast access to feature flags, at a predictable cost.
