---
id: control_rollout
title: Control rollout
---

It is powerful to be able to turn a feature on and off instantaneously, without redeploying the application. The next level of control comes when you are able to enable a feature for specific users or enable it for a small subset of users.

In this guide you will learn how to control the roll-out (expose it to real users) of a new feature with the help of activation strategies.

## Built in activation strategies {#built-in-activation-strategies}

Unleash comes with a few common activation strategies. Some of them require the client to provide the unleash-context, which gives the necessary context for Unleash.

The built-in activation strategies:

- Standard
- UserIDs
- Gradual Rollout
- IPs
- Hostnames

## The standard activation strategy {#the-standard-activation-strategy}

When you create a new feature toggle you will get the standard activation strategy, if you don’t configure any specific strategies. The standard activation strategy will always evaluate to true, given that the feature toggle is enabled.

![Default activation strategy](/img/control_rollout_standard_strategy.png)

## The UserIDs strategy {#the-userids-strategy}

When we have deployed some new code to production it would be nice to enable the new feature for ourselves before we enable it to everyone else. To achieve this with Unleash, you can use the **UserIDs** activation strategy. This strategy allows you to specify a list of user IDs that you want to expose the new feature for.

A userId is how you identify users in your system (email, UUID, etc) and is provided as part of the Unleash Context to the client SDK.

![UserWithId activation strategy](/img/control_rollout_userid_strategy.png)

## Multiple activation strategies {#multiple-activation-strategies}

In order to increase the exposure of the feature which is protected with the feature toggle you can configure multiple activation strategies on the same feature toggle.

![Multiple activation strategy](/img/control_rollout_multiple_strategies.png)

In the example above we have to configure two activation strategies, **userWithId** and **flexibleRollout**. If one of them evaluates to true the feature toggle is considered enabled. In the example we have enabled the feature toggle for usersWithId (_productlead@mycompany.com and me@mycompany.com_) in addition to 75% of the traffic.

## Summary {#summary}

You use activation strategies to control who the feature toggle will be enabled for. You can configure multiple strategies for a feature toggle, and they are considered in an OR fashion, meaning if one of them evaluates to true the toggle will be enabled.

If you need to limit the exposure (AND) you should look in to [strategy constraints](advanced/strategy-constraints.md), which is the building block for that.
