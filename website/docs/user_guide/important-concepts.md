---
id: important-concepts
title: Important Concepts
---

There are some concepts it's important to understand in order to work effectively with Unleash:

## Activation strategies

Feature toggles can have multiple activation strategies. An activation strategy will only run when a feature toggle is enabled and provides a way to control WHO will get access to the feature.

Activation strategies compound, and every single strategy will be evaluated. If any one of them returns true, the user will receive access to the feature.

> Unless you add activation strategies on toggle creation, the toggle will be created with the default strategy. The default strategy says that the toggle is either 100% off or 100% on for all users. This means that any other strategies you add will have no effect. If you want to use strategies to control rollout you need to remove the default strategy.

Unleash comes with a set of built-in strategies, but you can also build your own [custom strategies](../advanced/custom-activation-strategy.md).

[You can read more about activation strategies here.](./activation_strategy)

## Local evaluation

All our SDKs perform local evaluation of feature toggles, which means that they download the configuration from unleash and cache the configuration in memory in your application. This is done in order to avoid adding network latency to user interactions, making it unnoticable for users that you are using feature flagging, in addition to the added benefit that none of your data leaves your application - enforcing privacy by design.

[Read more about our unique architecture here.](https://www.getunleash.io/blog/our-unique-architecture)

## Unleash Context

Since the SDKs perform local evaluation, some of the parameters needed for evaluation must be supplied through the Unleash Context. The unleash context allows you to pass in userIds, sessionIds or other relevant information that is needed in order to perform the evaluation. If, for example, you want to enable a feature for a set of specific userIds, you would need to provide the current userId in the unleash context in order for the evaluation to enable the feature.

[You can read more about the unleash context here.](./unleash_context)

## API architecture

The Unleash API is split into two. One API is for the clients connecting to unleash. It is located under the path /api/client. This provides access to retrieving saved feature toggle configurations, metrics and registering the application.

The second API is the admin API, which is utilised in order to control any CRUD aspect of unleash resources. The split ensures a second layer of security that ensures that in the case you should loose your client api key, attackers will only have read-only access to your feature toggle configurations.

This ensures that we can have different data responses for the client API endpoints which will include less metadata, and be cached more heavily - optimising the SDK endpoints for best performance.

[Read more about unleash API here.](../api)

## Feature toggle types

Unleash categorizes feature toggles into five distinct types. This categorization makes it easier for you to see what the purpose of a toggle is and helps Unleash with [managing technical debt](/user_guide/technical_debt). A feature toggle's type has no effect on how the toggle behaves or how you can configure it.

[Read more about feature toggle types here.](../advanced/feature-toggle-types.md)
