---
id: proxy-javascript
title: JavaScript Proxy SDK
---

This guide shows you how to use feature toggles in a single-page app with the [Unleash Proxy](/sdks/unleash-proxy) and the [Unleash front-end API](../reference/front-end-api). You can also check out the source code for the [JavaScript Proxy SDK](https://github.com/unleash/unleash-proxy-client-js) on GitHub for more details around the SDK.

## Introduction {#introduction}

The JavaScript proxy client is a tiny Unleash client written in JavaScript without any external dependencies (except from browser APIs). This client stores toggles relevant for the current user in `localStorage` and synchronizes with Unleash (the proxy _or_ the Unleash front-end API) in the background. Because toggles are stored in the user's browser, the client can use them to bootstrap itself the next time the user visits the same web page.

> We are looking in to also [supporting react-native](https://github.com/Unleash/unleash/issues/785) with this SDK. Reach out if you want to help us validate the implementation.

## How to use the JavaScript Proxy SDK

## Step 1: Install

```shell npm2yarn
npm install unleash-proxy-client
```

## Step 2: Initialize the SDK

```js
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-client-key',
  appName: 'my-webapp',
});

// Use `updateContext` to set Unleash context fields.
unleash.updateContext({ userId: '1233' });

// Start the background polling
unleash.start();
```

### Option A: Connecting to the Unleash proxy

:::tip Prerequisites

To connect to an Unleash proxy, you need to have an instance of the proxy running.

:::

Add the proxy's URL and a [proxy client key](../reference/api-tokens-and-client-keys.mdx#proxy-client-keys). The [_configuration_ section of the Unleash proxy docs](unleash-proxy.md#configuration-variables) contain more info on how to configure client keys for your proxy.

### Option B: Connecting directly to Unleash

Use the url to your Unleash instance's front-end API (`<unleash-url>/api/frontend`) as the `url` parameter. For the `clientKey` parameter, use a `FRONTEND` token generated from your Unleash instance. Refer to the [_how to create API tokens_](/user_guide/api-token) guide for the necessary steps.

You might also need to set up cross-origin resource sharing (CORS) for your instance. Visit the [CORS section of the front-end API guide](../reference/front-end-api.md#cors) for more information on setting up CORS.

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
