---
id: activation_strategy
title: Activation Strategies
---

It is powerful to be able to turn a feature on and off instantaneously, without redeploying the application. The next level of control comes when you are able to enable a feature for specific users or enable it for a small subset of users. We achieve this level of control with the help of activation strategies. The most straightforward strategy is the “default” strategy, which basically means that the feature should be enabled to everyone.

The definition of an activation strategy lives in the Unleash API and can be created via the Unleash UI. The implementation of activation strategies lives in various client implementations.

Unleash comes with a few common activation strategies. Some of them require the client to provide the [unleash-context](./unleash-context.md), which gives the necessary context for Unleash.

## default

It is the simplest activation strategy and basically means "active for everyone".

## userWithId

Active for users with a `userId` defined in the `userIds` list. Typically I want to enable a new feature only for myself in production before I enable it for everyone else. To achieve this, we can use the “UserWithIdStrategy”. This strategy allows you to specify a list of user IDs that you want to expose the new feature for. (A user id may, of course, be an email if that is more appropriate in your system.)

**Parameters**

- userIds - _List of user IDs you want the feature toggle to be enabled for_

## flexibleRollout

A flexible rollout strategy which combines all gradual rollout strategies in to a single strategy (and will in time replace them). This strategy have different options for how you want to handle the stickiness, and have sane default mode.

**Parameters**

- **stickiness** is used to define how we guarantee consistency for gradual rollout. The same userId and the same rollout percentage should give predictable results. Configuration that should be supported:
  - **default** - Unleash chooses the first value present on the context in defined order userId, sessionId, random.
  - **userId** - guaranteed to be sticky on userId. If userId not present the behavior would be false
  - **sessionId** - guaranteed to be sticky on sessionId. If sessionId not present the behavior would be false.
  - **random** - no stickiness guaranteed. For every isEnabled call it will yield a random true/false based on the selected rollout percentage.
- **groupId** is used to ensure that different toggles will **hash differently** for the same user. The groupId defaults to _feature toggle name_, but the use can override it to _correlate rollout_ of multiple feature toggles.
- **rollout** The percentage (0-100) you want to enable the feature toggle for.

## gradualRolloutUserId

The `gradualRolloutUserId` strategy gradually activates a feature toggle for logged in users. Stickiness is based on the user ID. The strategy guarantees that the same user gets the same experience every time across devices. It also assures that a user which is among the first 10% will also be among the first 20% of the users. That way, we ensure the users get the same experience, even if we gradually increase the number of users exposed to a particular feature. To achieve this, we hash the user ID and normalize the hash value to a number between 1 and 100 with a simple modulo operator.

![hash_and_normalise](assets/hash_and_normalise.png)

Starting from v3.x all clients should use the 32-bit [MurmurHash3](https://en.wikipedia.org/wiki/MurmurHash) algorithm to normalize values. ([issue 247](https://github.com/Unleash/unleash/issues/247))

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._
- groupId - _Used to define an activation group, which allows you to correlate rollout across feature toggles._

## gradualRolloutSessionId

Similar to `gradualRolloutUserId` strategy, this strategy gradually activates a feature toggle, with the exception being that the stickiness is based on the session IDs. This makes it possible to target all users (not just logged in users), guaranteeing that a user will get the same experience within a session.

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._
- groupId - _Used to define an activation group, which allows you to correlate rollout across feature toggles._

## gradualRolloutRandom

The `gradualRolloutRandom` strategy randomly activates a feature toggle and has no stickiness. We have found this rollout strategy very useful in some scenarios, especially when we enable a feature which is not visible to the user. It is also the strategy we use to sample metrics and error reports.

**Parameters**

- percentage - _The percentage (0-100) you want to enable the feature toggle for._

## remoteAddress

The remote address strategy activates a feature toggle for remote addresses defined in the IP list. We occasionally use this strategy to enable a feature only for IPs in our office network.

**Parameters**

- IPs - _List of IPs to enable the feature for._

## applicationHostname

The application hostname strategy activates a feature toggle for client instances with a hostName in the `hostNames` list.

**Parameters**

- hostNames - _List of hostnames to enable the feature toggle for._
