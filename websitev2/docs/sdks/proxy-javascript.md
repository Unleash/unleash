---
id: proxy-javascript
title: JavaScript Proxy SDK
---

In this guide we explain how to use feature toggles in a Single Page App via [The Unleash Proxy](/sdks/unleash-proxy). You can also checkout the source code for the [JavaScript Proxy SDK](https://github.com/unleash/unleash-proxy-client-js).

### Introduction {#introduction}

For single-page apps we have a tiny proxy-client in JavaScript, without any external dependencies, except from browser APIs. This client will store toggles relevant for the current user in local-storage and synchronize with the Unleash Proxy in the background. This means we can bootstrap the toggles for a specific use the next time the user visits the web-page.

> We are looking in to also [supporting react-native](https://github.com/Unleash/unleash/issues/785) with this SDK. Reach out if you want to help us validate the implementation.

**Step 1: Install**

```
npm install unleash-proxy-client --save
```

**Step 2: Initialize the SDK**

You need to have a Unleash-hosted instance, and the proxy need to be enabled. In addition you will need a proxy-specific clientKey in order to connect to the Unleash-hosted Proxy.

```js
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'https://eu.unleash-hosted.com/hosted/proxy',
  clientKey: 'your-proxy-key',
  appName: 'my-webapp',
});

// Used to set the context fields, shared with the Unleash Proxy
unleash.updateContext({ userId: '1233' });

// Start the background polling
unleash.start();
```

**Step 3: Check if feature toggle is enabled**

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

**Listen for updates via the EventEmitter**

The client is also an event emitter. This means that your code can subscribe to updates from the client. This is a neat way to update a single page app when toggle state updates.

```js
unleash.on('update', () => {
  const myToggle = unleash.isEnabled('proxy.demo');
  //do something useful
});
```
