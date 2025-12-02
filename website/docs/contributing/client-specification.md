---
id: client-specification
title: Client Specification
---

# Client Specification 1.0

This document attempts to guide developers in implementing an Unleash Client SDK.

## System Overview

Unleash is composed of three parts:

- **Unleash API** - The service holding all feature flags and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **Unleash UI** - The dashboard used to manage feature flags, define new strategies, look at metrics, etc.
- **Unleash SDK** - Used by clients to check if a feature is enabled or disabled. The SDK also collects metrics and sends them to the Unleash API. Activation Strategies are also implemented in the SDK. Unleash currently provides official SDKs for Java and Node.js

![system_overview](/img/unleash-diagram.png 'System Overview')

To be super fast, the client SDK caches all feature flags and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a flag is on or off because it is just a simple function operating on local state, without the need to poll data from the database.

## The Basics

All client implementations should strive to have a consistent and straightforward user API. It should be a simple method, called isEnabled, to check if a feature flag is enabled or not. The method should return a `boolean` value, true or false.

```javascript
unleash.isEnabled('myAwesomeFlag');
```

The basic `isEnabled` method should also accept a default value. This should be used if the client does not know anything about a particular flag. If the user does not specify a default value, false should be returned for unknown feature flags.

**Calling unleash with default value:**

```javascript
boolean value = unleash.isEnabled("unknownFeatureFlag", false);
//value==false because default value was used.
```

### Implementation of isEnabled

A feature flag is defined as:

```json
{
  "name": "Feature.B",
  "description": "lorem ipsum",
  "enabled": true,
  "strategies": [
    {
      "name": "ActiveForUserWithId",
      "parameters": {
        "userIdList": "123,221,998"
      }
    },
    {
      "name": "GradualRolloutRandom",
      "parameters": {
        "percentage": "10"
      }
    }
  ],
  "strategy": "ActiveForUserWithId",
  "parameters": {
    "userIdList": "123,221,998"
  }
}
```

A simple demo of the `isEnabled` function in JavaScript style (most of the implementation will likely be more functional):

```javascript
function isEnabled(name, unleashContext = {}, defaultValue = false) {
  const flag = toggleRepository.get(name);
  let enabled = false;

  if (!flag) {
    return defaultValue;
  } else if (!flag.isEnabled) {
    return false;
  } else {
    for (let i = 0; i < flag.strategies.length; i++) {
      let strategyDef = flag.strategies[i];
      let strategyImpl = strategyImplRepository.get(strategyDef.name);
      if (strategyImpl.isEnabled(flag.parameters, unleashContext)) {
        return true;
      }
    }
    return false;
  }
}
```

## Activation Strategies

Activation strategies are defined and configured in the unleash-service. It is up to the client to provide the actual implementation of each activation strategy.

Unleash also ships with a few built-in strategies, and expects client SDK's to implement these. Read more about these [activation strategies](concepts/activation-strategies.md). For the built-in strategies to work as expected the client should also allow the user to define an [unleash-context](concepts/unleash-context.md). The context should be possible to pass in as part of the `isEnabled` call.

### Extension points

Client implementation should also provide a defined interface to make it easier for the user to implement their own activation strategies, and register those in the Unleash client.

## Fetching feature flags (polling)

The client implementation should fetch flags in the background as regular polling. In a thread-based environment, such as Java, this needs to be done in a separate thread. The default poll interval should be **15 seconds**, and it should also be configurable.

## Client registration
On start-up, the clients should register with the Unleash server. The registration request must include the required fields specified in the [API documentation](/api/register-client-application).

## Metrics

Clients are expected to send metrics back to Unleash API at regular intervals. The metrics are a list of used flags and how many times they evaluated to yes or no in at the time of requesting the metrics. Read more about how to send metrics in the [Metrics API](/api/register-client-metrics) documentation.

## Backup Feature Flags

The SDK also persists the latest known state to a local file on the instance where the client is running. It will store a local copy every time the client receives changes from the API. Having a local backup of the latest known state minimises the consequences of clients not being able to talk to the Unleash API on startup. This is necessary due to network unreliability.
