---
id: node_sdk
title: Node SDK
---

In this guide we explain how to use feature toggles in a Node application using Unleash-hosted. We will be using the open source Unleash [Node.js Client SDK](https://github.com/Unleash/unleash-client-node).

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

## Step 1: Install the client SDK {#step-1-install-the-client-sdk}

First we must install Node.js dependency:

```shell npm2yarn
npm install unleash-client
```

## Step 2: Initialize the client SDK {#step-2-initialize-the-client-sdk}

Next we must initialize the client SDK in the application:

```js
const unleash = require('unleash-client');

unleash.initialize({
  url: 'https://YOUR-API-URL',
  appName: 'my-node-name',
  environment: process.env.APP_ENV,
  customHeaders: { Authorization: 'SOME-SECRET' },
});
```

The example code above will initialize the client SDK, and connect to the Unleash-hosted demo instance. It also uses the API token for the demo instance. You should change the URL and the Authorization header (API token) with the correct values for your instance, which you may locate under “Instance admin” in the menu.

Please also pay attention to the “environment” option. Setting this will allow you to use [strategy constraints](/advanced/strategy_constraints) which enables different roll-out strategies per environment.

## Step 3: Use the feature toggle {#step-3-use-the-feature-toggle}

Now that we have initialized the client SDK in our application we can start using feature toggles defined in Unleash in our application. To achieve this we have the “isEnabled” method available, which will allow us to check the value of a feature toggle. This method will return **true** or **false** based on whether the feature should be enabled or disabled for the current request.

```javascript
setInterval(() => {
  if (unleash.isEnabled('DemoToggle')) {
    console.log('Toggle enabled');
  } else {
    console.log('Toggle disabled');
  }
}, 1000);
```

Please note that in the above example we put the isEnabled-evaluation inside the setInterval method. This is required in the small example to make sure that the feature toggle is not evaluated, and application exits, before the client SDK have been able to synchronize with the Unleash-hosted API. State is kept in memory by the client SDK (and synchronizes with the Unleash-hosted API in the background). This is done to prefer performance over update speed. You can read more about the [Unleash architecture](https://www.unleash-hosted.com/articles/our-unique-architecture).

It can also be nice to notice that if you use an undefined feature toggle the Unleash SDK will return false instead of crashing your application. The SDK will also report metrics back to Unleash-hosted on feature toggle usage, which makes it \_possible to spot toggles not yet defined. And this is a very neat way to help you debug if something does not work as expected.

_Note that you can also wait until the Unleash SDK has fully syncrhonized similar to familiar "on-ready" hooks in other APIs. See [block until Unleashed is synchronized](https://github.com/Unleash/unleash-client-node#block-until-unleash-sdk-has-synchronized) for how to do this._

## Step 4: Provide the Unleash-context {#step-4-provide-the-unleash-context}

It is the client SDK that computes whether a feature toggle should be considered enabled or disabled for a specific request. This is the job of the activation strategies, which are implemented in the client SDK.

An activation strategy is an implementation of rules based on data, which you provide as part of the Unleash Context.

You provide the Unleash context as part of the second argument to the isEnabled call:

```javascript
const context = {
  userId: '123',
  sessionId: '123123-123-123',
  remoteAddress: '127.0.0.1',
};

const enabled = isEnabled('app.demo', context);
```
