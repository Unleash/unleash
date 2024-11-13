---
title: Activation Strategies
---

An activation strategy determines who should get a feature. An activation strategy is assigned to one [feature flag](/reference/feature-toggles) in one [environment](/reference/environment). For a feature flag to be enabled in a given context, such as for a user or application, at least one of the feature flag's activation strategies must resolve to true.

You can copy strategies from one environment to the other, but the different strategy configurations do not stay in sync. The `default` activation strategy is a gradual rollout to 100% of users, which means that the flag is enabled for everyone. You can use rollout percentage, strategy constraints, targeting, and strategy variants to further define your strategies. You can also define custom activation strategies.

It is powerful to be able to turn a feature on and off instantaneously, without redeploying the application. Activation strategies let you enable a feature only for a specified audience. Different strategies use different parameters. Predefined strategies are bundled with Unleash. The recommended strategy is the gradual rollout strategy with 100% rollout, which basically means that the feature should be enabled to everyone.

## Activation strategy implemenation

However, while activation strategies are defined on the server, the server does not implement_the strategies. Instead, activation strategy implementation is done client-side. This means that it is _the client_ that decides whether a feature should be enabled or not.

All [server-side client SDKs](../reference/sdks#server-side-sdks) and [Unleash Edge](../reference/unleash-edge) implement the default strategies (and allow you to add your own [custom strategy implementations](../reference/custom-activation-strategies#implementation)). The [front-end client SDKs](../reference/sdks#front-end-sdks) do not do the evaluation themselves, instead relying on the [Unleash Edge](../reference/unleash-edge) to take care of the implementation and evaluation. Some activation strategies require the client to provide the current [Unleash context](unleash-context) to the flag evaluation function for the evaluation to be done correctly.

## Strategy constraints

An activation strategy can have as many constraints as you want. When an activation strategy has multiple constraints, then **every constraint **must be satisfied for the strategy to be evaluated. So if you have two constraints: one that says users must have an “@mycompany.com” email address and one that says users must have signed up for a beta program, then the strategy would only be evaluated for users with @mycompany.com emails that have signed up for the program.

Strategies and constraints
Feature flag strategies are permissive: As long as one strategy resolves to true, the feature is considered enabled. On the other hand, constraints are restrictive: for a given strategy, all constraints must be met for it to resolve to true.

We can exemplify this difference with the logical operators AND and OR:

For a feature flag, if Strategy1 OR Strategy2 OR .. OR StrategyN is true, then the feature is enabled.
For a strategy, it can be evaluated if and only if Constraint1 AND Constraint2 AND .. AND ConstraintN are met.
Note that even if all the constraints are met, the strategy itself might not resolve to true: that will depend on the strategy and the provided context.

You can define constraints on whatever properties you want in your Unleash context.

Constraints are applied to individual strategies and do not stay in sync with each other. When you need to have the same constraints applied to multiple strategies and need those constraints to stay in sync, use segments.

## Multiple activation strategies

You can apply as many activation strategies to a feature flag as needed. When a flag has multiple strategies, Unleash evaluates each strategy in isolation. If any one of the strategies resolves to true, the flag is enabled in the given context.

As an example, consider a case where you want to roll a feature out to 75% of your users. However, you also want to make sure that you and your product lead get access to the feature. To achieve this, you would apply a **gradual rollout** strategy and set it to 75%. Additionally, you would add a **user IDs** strategy and add `engineer@mycompany.com` and `productlead@mycompany.com`.

![A feature flag with two active strategies: a user ID strategy and a gradual rollout strategy. The strategies are configured as described in the preceding paragraph.](/img/control_rollout_multiple_strategies.png)

## Predefined strategy types

:::caution
[Predefined strategy type](/reference/predefined-strategy-types), such as UserIDs, IPs, and Hosts are deprecated. Please use the default strategy with strategy constraints to achieve your desired targeting.
:::

