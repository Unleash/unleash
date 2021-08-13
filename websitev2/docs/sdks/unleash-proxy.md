---
id: unleash-proxy
title: Unleash Proxy
---

> The unleash-proxy is compatible with all Unleash Enterprise versions and Unleash Open-Source v4. You should reach out to **support@getunleash.io** if you want the Unleash Team to host the Unleash Proxy for you.

A lot of our users wanted to use feature toggles in their single-page and native applications. To solve this in a preformat and privacy concerned way we built The Unleash Proxy

The Unleash Proxy sits between the Unleash API and the application. It provides a simple and super-fast API, as it has all the data it needs available in memory.

The proxy solves three important aspects:

- **Performance** – The proxy will cache all toggles in memory, and will be running on the edge, close to your end-users. A single instance will be able to handle thousands of request/sec, and you can scale it easily by adding additional instances.
- **Security** – The proxy evaluates the feature flags for the user on the server-side, and only exposes the results of enabled feature flags for a specific user.
- **Privacy** – If you run the proxy yourself (we can host it as well though) we will not see your end users. This means that you still have full control of your end-users, the way it should be!

![The Unleash Proxy](/img/The-unleash-proxy.png)

_The Unleash Proxy uses the Unleash SDK and exposes a simple API_. The Proxy will synchronize with the Unleash API in the background and provide a simple HTTP API for clients.

### How to Run the Unleash Proxy

The Unleash Proxy is Open Source and [available on github](https://github.com/Unleash/unleash-proxy). You can either run it as a docker image or as part of a [node.js express application](https://github.com/Unleash/unleash-proxy#run-with-nodejs).

The easies way to run Unleash is via Docker. We have published a [docker image on docker hub](https://hub.docker.com/r/unleashorg/unleash-proxy).

**Step 1: Pull**

```bash
docker pull unleashorg/unleash-proxy
```

**Step 2: Start**

```bash
docker run \
   -e UNLEASH_PROXY_SECRETS=some-secret \
   -e UNLEASH_URL='https://app.unleash-hosted.com/demo/api/' \
   -e UNLEASH_API_TOKEN=56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d \
   -p 3000:3000 \
   unleashorg/unleash-proxy
```

You should see the following output:

```bash
Unleash-proxy is listening on port 3000!
```

**Step 3: verify**

In order to verify the proxy you can use curl and see that you get a few evaluated feature toggles back:

```bash
curl http://localhost:3000/proxy -H "Authorization: some-secret"
```

Expected output would be something like:

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

**Health endpoint**

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

There are multiple more configuration options available. You find all [available options on github](https://github.com/Unleash/unleash-proxy#available-options).

### Unleash Proxy API {#unleash-proxy-api}

The Unleash Proxy has a very simple API. It takes the [Unleash Context](../user_guide/unleash_context) as input and will return the feature toggles relevant for that specific context.

![The Unleash Proxy](/img/The-Unleash-Proxy-API.png).

### We care about Privacy! {#we-care-about-privacy}

The Unleash Proxy is important because you should not expose your entire toggle configurations to your end users! Single page apps works in context of a specific user. The proxy will only return the evaluated toggles (with variants) that should be enabled for those specific users in that specific context.

Most of our customers prefer to run The Unleash Proxy themselves. PS! We actually prefer this as we don’t want to see your users. Running it is pretty simple, it is either a small Node.js process you start or a docker image you use. (We can of course host the proxy for you also.)

### How to connect to the Proxy? {#how-to-connect-to-the-proxy}

The Unleash Proxy takes the heavy lifting of evaluating toggles and only returns enabled toggles and their values to the client. This means that you would get away with a simple http-client in many common use-cases.

However in some settings you would like a bit more logic around it to make it as fast as possible, and keep up to date with changes.

- [JavaScript Proxy SDK](/sdks/proxy-javascript)
- [Android Proxy SDK](/sdks/android_proxy_sdk)
- [iOS Proxy SDK](/sdks/proxy-ios)
- React SDK (coming soon)
- React Native SDK (coming soon)

The proxy is also ideal fit for serverless functions such as AWS Lambda. In that scenario the proxy can run on a small container near the serverless function, preferably in the same VPC, giving the lambda extremely fast access to feature flags, at a predictable cost.
