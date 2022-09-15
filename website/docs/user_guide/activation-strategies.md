---
id: activation_strategy
title: Activation Strategies
---

It is powerful to be able to turn a feature on and off instantaneously, without redeploying the application. The next level of control comes when you are able to enable a feature for specific users or enable it for a small subset of users. We achieve this level of control with the help of activation strategies. The most straightforward strategy is the standard strategy, which basically means that the feature should be enabled to everyone.

Unleash comes with a number of built-in strategies (described below) and also lets you add your own [custom activation strategies](../advanced/custom-activation-strategy.md) if you need more control. However, while activation strategies are _defined_ on the server, the server does not _implement_ the strategies. Instead, activation strategy implementation is done client-side. This means that it is _the client_ that decides whether a feature should be enabled or not.

All [server-side client SDKs](../sdks/index.md#server-side-sdks) and the [Unleash Proxy](../sdks/unleash-proxy.md) implement the default strategies (and allow you to add your own [custom strategy implementations](../advanced/custom-activation-strategy.md#implementation)). The [front-end client SDKs](../sdks/index.md#front-end-sdks) do not do the evaluation themselves, instead relying on the [Unleash Proxy](../sdks/unleash-proxy.md) to take care of the implementation and evaluation.

Some activation strategies require the client to provide the current [Unleash context](unleash-context.md) to the toggle evaluation function for the evaluation to be done correctly.

The following activation strategies are bundled with Unleash and always available:

- [Standard](#standard)
- [UserIDs](#userids)
- [Gradual Rollout](#gradual-rollout)
- [IPs](#ips)
- [Hostnames](#hostnames)

## Standard {#standard}

A basic strategy that means "active for everyone".

This strategy has the following modelling name in the code:

- **default**

## UserIDs {#userids}

Active for users with a `userId` defined in the `userIds` list. A typical use case is to enable a feature for a few specific devs or key persons before enabling the feature for everyone else. This strategy allows you to specify a list of user IDs that you want to expose the new feature for. (A user id may, of course, be an email if that is more appropriate in your system.)

**Parameters**

- userIds - _List of user IDs you want the feature toggle to be enabled for_

This strategy has the following modelling name in the code:

- **userWithId**

## Gradual Rollout {#gradual-rollout}

A flexible rollout strategy which combines all gradual rollout strategies in to a single strategy. This strategy allows you to customize what parameter should be sticky, and defaults to userId or sessionId.

**Parameters**

- **stickiness** is used to define how we guarantee consistency for a gradual rollout. The same userId and the same rollout percentage should give predictable results. Configuration that should be supported:
  - **default** - Unleash chooses the first value present on the context in defined order userId, sessionId, random.
  - **userId** - guaranteed to be sticky on userId. If userId not present the behavior would be false
  - **sessionId** - guaranteed to be sticky on sessionId. If sessionId not present the behavior would be false.
  - **random** - no stickiness guaranteed. For every isEnabled call it will yield a random true/false based on the selected rollout percentage.
- **groupId** is used to ensure that different toggles will **hash differently** for the same user. The groupId defaults to _feature toggle name_, but the user can override it to _correlate rollout_ of multiple feature toggles.
- **rollout** The percentage (0-100) you want to enable the feature toggle for.

This strategy has the following modelling name in the code:

- **flexibleRollout**

### Custom stickiness (beta) {#custom-stickiness}

:::note
This feature is currently in beta and is not yet supported by all our SDKs. Check out the [SDK compatibility table](../sdks/index.md#server-side-sdk-compatibility-table) to see what SDKs support it at the moment.

:::

By enabling the stickiness option on a custom context field you can use the custom context field to group users with the gradual rollout strategy. This will guarantee a consistent behavior for specific values of this context field.

## IPs {#ips}

The remote address strategy activates a feature toggle for remote addresses defined in the IP list. We occasionally use this strategy to enable a feature only for IPs in our office network.

**Parameters**

- IPs - _List of IPs to enable the feature for._

This strategy has the following modelling name in the code:

- **remoteAddress**

## Hostnames {#hostnames}

The application hostname strategy activates a feature toggle for client instances with a hostName in the `hostNames` list.

**Parameters**

- hostNames - _List of hostnames to enable the feature toggle for._

This strategy has the following modelling name in the code:

- **applicationHostname**

## Multiple activation strategies {#multiple-activation-strategies}

You can apply as many activation strategies to a toggle as you want. When a toggle has multiple strategies, Unleash will check each strategy in isolation. If any one of the strategies would enable the toggle for the current user, then the toggle is enabled.

As an example, consider a case where you want to roll a feature out to 75% of your users. However, you also want to make sure that you and your product lead get access to the feature. To achieve this, you would apply a **gradual rollout** strategy and set it to 75%. Additionally, you would add a **user IDs** strategy and add `engineer@mycompany.com` and `productlead@mycompany.com`.

![A feature toggle with two active strategies: a user ID strategy and a gradual rollout strategy. The strategies are configured as described in the preceding paragraph.](/img/control_rollout_multiple_strategies.png)

## Deprecated strategies

### gradualRolloutUserId (DEPRECATED from v4) - Use Gradual rollout instead {#gradualrolloutuserid-deprecated-from-v4---use-gradual-rollout-instead}

The `gradualRolloutUserId` strategy gradually activates a feature toggle for logged-in users. Stickiness is based on the user ID. The strategy guarantees that the same user gets the same experience every time across devices. It also assures that a user which is among the first 10% will also be among the first 20% of the users. That way, we ensure the users get the same experience, even if we gradually increase the number of users exposed to a particular feature. To achieve this, we hash the user ID and normalize the hash value to a number between 1 and 100 with a simple modulo operator.

![hash_and_normalise](/img/hash_and_normalise.png)

Starting from v3.x all clients should use the 32-bit [MurmurHash3](https://en.wikipedia.org/wiki/MurmurHash) algorithm to normalize values. ([issue 247](https://github.com/Unleash/unleash/issues/247))

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._
- groupId - _Used to define an activation group, which allows you to correlate rollout across feature toggles._

### gradualRolloutSessionId (DEPRECATED from v4) - Use Gradual rollout instead {#gradualrolloutsessionid-deprecated-from-v4---use-gradual-rollout-instead}

Similar to `gradualRolloutUserId` strategy, this strategy gradually activates a feature toggle, with the exception being that the stickiness is based on the session IDs. This makes it possible to target all users (not just logged-in users), guaranteeing that a user will get the same experience within a session.

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._
- groupId - _Used to define an activation group, which allows you to correlate rollout across feature toggles._

### gradualRolloutRandom (DEPRECATED from v4) - Use Gradual rollout instead {#gradualrolloutrandom-deprecated-from-v4---use-gradual-rollout-instead}

The `gradualRolloutRandom` strategy randomly activates a feature toggle and has no stickiness. We have found this rollout strategy very useful in some scenarios, especially when we enable a feature which is not visible to the user. It is also the strategy we use to sample metrics and error reports.

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._
