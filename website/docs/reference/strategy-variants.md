---
title: Strategy Variants
---

import VideoContent from '@site/src/components/VideoContent.jsx'

:::info Availability

**Strategy variants** were first introduced in Unleash 5.4.
:::


<VideoContent videoUrls={["https://www.youtube.com/embed/M0oyGHtva0o"]}/>

Gradual rollout strategies in Unleash can have _strategy variants_. _Strategy variants_ allow each matching activation strategy to return not just simple enabled/disabled status, but
also attach any custom data or even multiple data items.

## What are strategy variants?

Whenever you create a feature activation strategy, you can assign it one or more values called _variants_.
This is commonly done in cases where you want to serve your users additional information related to the matching strategy.
Also it's possible to assign multiple variants to one strategy to see which performs better.

A variant has four components that define it:
- a **name**:

    This must be unique among the strategy's variants. When working with a feature with variants in a client, you will typically use the variant's name to find out which variant it is.

- a **weight**:

    The weight is the likelihood of any one user getting this specific variant. See the [weights section](#variant-weight) for more info.

- an optional **payload**:

    A variant can also have an associated payload. Use this to deliver more data or context. See the [payload section](#variant-payload) for a more details.


![A form for adding new strategy variants. It has fields for name, weight, payload.](/img/strategy-variant-creation-form.png 'Creating a new strategy variant')

### Variant weight

A variant's weight determines how likely it is that a user will receive that variant. It is a numeric value between 0 and 100 (inclusive) with one decimal's worth of precision.

When you have multiple variants, the sum of all their weights must add up to exactly 100. Depending on the [weight type](#weight-types), Unleash may automatically determine the weight of the new variant and balance it out with the other variants.

#### Weight types and calculation

There are two kinds of variant weight types: _variable_ and _fixed_. Unleash requires you to always have _at least_ one variable weight variant.

The default weight type is _variable_. Variable weight variants will adjust their weight based on the number of other variable weight variants and whatever weight is not used up by fixed weight variants.

_Fixed_ weight variants have a set weight which will not change. All fixed weight variants' weights can not add up to more than 100.

To calculate what the weight of a variable weight variant is, Unleash first subtracts the sum of fixed weights from 100 and then distributes the remaining weight evenly among the variable weight variants.

For instance, if you have three variable weight variants and two fixed weight variants weighted at 25 and 15 respectively, Unleash will:
1. Subtract the fixed weight from the total available: 100 - 40 = 60
2. Divide the remainder by the number of variable weight variants: 60 / 3 = 20
3. Assign each variable weight variant the same (up to rounding differences) weight: 20%

In the example above, 60 divides cleanly by three. In cases where the remainder doesn't divide evenly among the variable weight variants, Unleash will distribute it as evenly as it can to one decimal's precision. If you have three variable weight variants, they will be weighted at 33.4, 33.3, and 33.3 respectively, so that it adds up to 100.0.

### Variant payload

Each variant can have an associated payload. Use this to add more context or data to a payload that you can access on the client, such as a customized message or other information.

Unleash currently supports these payload types:

- JSON
- CSV
- String

### Variant stickiness

When you have only one variant in a strategy, stickiness does not matter. If you decide to add multiple variants to the strategy, then variant stickiness is derived from the strategy stickiness.
Strategy stickiness is calculated on the received user and context, as described in [the stickiness chapter](./stickiness.md). This ensures that the same user will consistently see the same variant. If no context data is provided, the traffic will be spread randomly for each request.

If you would like to reassign users to different variants using existing stickiness parameter then you can change the groupId of the strategy. This will provide different input to the stickiness calculation.

### Strategy variants vs feature flag variants

Strategy variants take precedence over the [feature flag variants](./feature-toggle-variants.md). If your matching activation strategy doesn't have any variants configured you will fall back to the [feature flag variants](./feature-toggle-variants.md).
Since strategy variants are part of activation strategies they have full access to constraints and segments. Feature variants are much more limited since they only allow simple overrides.

## How do I configure strategy variants

In the Unleash UI, you can configure variants by navigating to the gradual strategy view, and then choosing the 'Variants' section.

![strategy_variants](/img/strategy-variants.png 'Strategy Variants')

## The `disabled` variant

When your matching strategy has no variants or when your flag has no variants or when a flag is disabled for a user, Unleash will return variant data that looks like this:

```json
{
  "name": "disabled",
  "enabled": false
}
```

This is a fallback variant that Unleash uses to represent the lack of a variant.

Note: The actual representation of the built-in fallback variant in the client SDK will vary slightly, to honor best practices in various languages.

## Strategy variants and strategies order

When you add multiple activation strategies, each having its own variants defined, the order of strategies matters. Unleash chooses the first matching strategy.
It is common to define your specific activation strategies with explicit constraints and segments first. The specific strategies can be followed by a
broad activation strategy with multiple percentage based variants.

In the example below we configure fixed title for the internal users based on the `clientId` constraint. In the second strategy we split titles between all other users
based on the 50%/50% split.
![strategy_variants example](/img/strategy-variants-example.png 'Strategy Variants example')

## Client SDK Support {#client-sdk-support}

To make use of strategy variants, you need to use a compatible client. Client SDK with variant support:

- [unleash-client-node](https://github.com/Unleash/unleash-client-node) (from v4.1.0)
- [unleash-client-java](https://github.com/Unleash/unleash-client-java) (from v8.3.0)
- [unleash-client-go](https://github.com/Unleash/unleash-client-go) (from v3.8.0)
- [unleash-client-python](https://github.com/Unleash/unleash-client-python) (from v5.8.0)
- [unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby) (from v4.5.0)
- [unleash-client-dotnet](https://github.com/Unleash/unleash-client-dotnet) (from v3.3.0)
- [unleash-client-php](https://github.com/Unleash/unleash-client-php) (from v1.13.0)
- Client SDKs talking to [unleash-proxy](https://github.com/Unleash/unleash-proxy) (from v0.17.0)
- Client SDKs talking to Frontend API in [unleash-server](https://github.com/Unleash/unleash) (from v5.4.0)
- Unleash Playground in [unleash-server](https://github.com/Unleash/unleash) (from v5.4.0)


If you would like to give feedback on this feature, experience issues or have questions, please feel free to open an issue on [GitHub](https://github.com/Unleash/unleash/).
