---
id: proxy-javascript
title: JavaScript Proxy SDK
---

In this guide we explain how to use feature toggles in a Single Page App via [Unleash Proxy](/sdks/unleash-proxy) or directly to Unleash (since _v4.16_). You can also checkout the source code for the [JavaScript Proxy SDK](https://github.com/unleash/unleash-proxy-client-js).

## Introduction {#introduction}

For single-page apps we have a tiny proxy-client in JavaScript, without any external dependencies, except from browser APIs. This client will store toggles relevant for the current user in local-storage and synchronize with the Unleash in the background. This means we can bootstrap the toggles for a specific use the next time the user visits the web-page.

> We are looking in to also [supporting react-native](https://github.com/Unleash/unleash/issues/785) with this SDK. Reach out if you want to help us validate the implementation.

## How to use the JavaScript Proxy SDK

### Step 1: Install

```shell npm2yarn
npm install unleash-proxy-client
```

### Step 2: Initialize the SDK

```js
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-secret-key',
  appName: 'my-webapp',
});

// Used to set the context fields, shared with Unleash Proxy
unleash.updateContext({ userId: '1233' });

// Start the background polling
unleash.start();
```

#### Option A: With Unleash Proxy

You need to have an Unleash Proxy server running. Fill `url` and a proxy-specific `clientKey` in order to connect. For more on how to set up client keys, [consult the Unleash Proxy docs](unleash-proxy.md#configuration-variables).

#### Option B: Directly to Unleash (since _Unleash v4.16_)

Use the url to your Unleash instance's direct access API (<unleash-url>/api/frontend) as the `url` parameter. For the `clientKey` parameter, use a `FRONTEND` token generated from your Unleash instance. Refer to the 
[_how to create API tokens_](/user_guide/api-token) guide for the necessary steps. 

You might also need to set up cross-origin resource sharing (CORS) for your instance. Visit the [CORS section of the direct access API guide](../reference/frontend-api.mdx#cors) for more information on setting up CORS.

### Step 3: Check if feature toggle is enabled

```js
unleash.isEnabled('proxy.demo');
```

...or get toggle variant:

```js
const variant = unleash.getVariant('proxy.demo');
if (variant.name === 'blue') {
  // something with variant blue...
}
```

## Listen for updates via the EventEmitter

The client is also an event emitter. This means that your code can subscribe to updates from the client. This is a neat way to update a single page app when toggle state updates.

```js
unleash.on('update', () => {
  const myToggle = unleash.isEnabled('proxy.demo');
  //do something useful
});
```
