---
title: How to use custom activation strategies
---

In this example we want to define an activation strategy offers a scheduled release of a feature toggle. This means that we want the feature toggle to be activated after a given date and time.

## Define custom strategy {#define-custom-strategy}

First we need to "define" our new strategy. To add a new "Strategy", open the Strategies tab from the sidebar.

![A strategy creation form. It has fields labeled "strategy name" — "TimeStamp" — and "description" — "activate toggle after a given timestamp". It also has fields for a parameter named "enableAfter". The parameter is of type "string" and the parameter description is "Expected format: YYYY-MM-DD HH:MM". The parameter is required.](/img/timestamp_create_strategy.png)

We name our strategy `TimeStamp` and add one required parameter of type string, which we call `enableAfter`.

## Use custom strategy {#use-custom-strategy}

After we have created the strategy definition, we can now decide to use that activation strategy for our feature toggle.

![The strategy configuration screen for the custom "TimeStamp" strategy. The "enableAfter" field says "2021-12-25 00:00".](/img/timestamp_use_strategy.png)

In the example we want to use our custom strategy for the feature toggle named `demo.TimeStampRollout`.

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
