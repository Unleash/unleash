---
title: How to use custom activation strategies
---

This guide takes you through how to use [custom activation strategies](../advanced/custom-activation-strategy.md) with Unleash. We'll go through how you define them in the admin UI and look at an implementation example in a [client SDK](../sdks/index.md).

In this example we want to define an activation strategy offers a scheduled release of a feature toggle. This means that we want the feature toggle to be activated after a given date and time.

## Step 1: Define your custom strategy {#step-1}

First we need to "define" our new strategy. To add a new "Strategy", open the Strategies tab from the sidebar.

![A strategy creation form. It has fields labeled "strategy name" — "TimeStamp" — and "description" — "activate toggle after a given timestamp". It also has fields for a parameter named "enableAfter". The parameter is of type "string" and the parameter description is "Expected format: YYYY-MM-DD HH:MM". The parameter is required.](/img/timestamp_create_strategy.png)

We name our strategy `TimeStamp` and add one required parameter of type string, which we call `enableAfter`.

## Step 2: Apply your custom strategy to a feature toggle {#step-2}

In the example we want to use our custom strategy for the feature toggle named `demo.TimeStampRollout`.

## Step 3 Option A: Implement the strategy for a server SDK {#step-3-a}
## Step 3 Option B: Implement the strategy for a front-end SDK {#step-3-b}
### The Unleash Proxy
## Client implementation {#client-implementation}

All official client SDK's for Unleash provides abstractions for you to implement support for custom strategies.

> Before you have provided support for the custom strategy; the client will return false, because it does not understand the activation strategy.

In Node.js the implementation for the `TimeStampStrategy` would be:

```javascript
class TimeStampStrategy extends Strategy {
  constructor() {
    super('TimeStamp');
  }

  isEnabled(parameters, context) {
    return Date.parse(parameters.enableAfter) < Date.now();
  }
}
```

In the example implementation we make use of the library called moment to parse the timestamp and verify that current time is after the specified `enabledAfter` parameter.

All parameter injected to the strategy are handled as `string` objects. This means that the strategies needs to parse it to a more suitable format. In this example we just parse it directly to a `Date` type and do the comparison directly. You might want to also consider timezone in a real implementation.

We also have to remember to register the custom strategy when initializing the Unleash client. Full working code example:

```javascript
const { Strategy, initialize, isEnabled } = require('unleash-client');

class TimeStampStrategy extends Strategy {
  constructor() {
    super('TimeStamp');
  }

  isEnabled(parameters, context) {
    return Date.parse(parameters.enableAfter) < Date.now();
  }
}

const instance = initialize({
  url: 'http://unleash.herokuapp.com/api/',
  appName: 'unleash-demo',
  instanceId: '1',
  strategies: [new TimeStampStrategy()],
});

instance.on('ready', () => {
  setInterval(() => {
    console.log(isEnabled('demo.TimeStampRollout'));
  }, 1000);
});
```
