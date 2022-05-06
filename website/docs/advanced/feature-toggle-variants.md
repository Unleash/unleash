---
id: toggle_variants
title: Feature Toggle Variants
---
<div class="alert alert--info" role="alert">
  <em>Feature toggle variants</em> were introduced in <em>Unleash v3.2.0</em>.
</div>
<br/>

Every toggle in Unleash can have something called _variants_. Where _feature toggles_ allow you to decide which users get access to a feature, _toggle variants_ allow you to further split those users into segments. Say, for instance, that you're testing out a new feature, such as an alternate sign-up form. The feature toggle would expose the form only to a select group of users. The variants could decide whether the user sees a blue or a green submit button on that form.

Variants facilitate A/B testing and experimentation by letting you create controlled and measurable experiments. Check [our blog post on using Unleash for A/B/n experiments](https://www.getunleash.io/blog/a-b-n-experiments-in-3-simple-steps) for some more insights into how you can set it up.

## What are variants?

Whenever you create a feature toggle, you can assign it any number of _variants_. This is commonly done in cases where you want to serve your users different versions of a feature to see which performs better.

A variant has four components that define it:
- a **name**:

    This must be unique among the toggle's variants. When working with a toggle with variants in a client, you will typically use the variant's name to find out which variant it is.

- a **weight**:

    The weight is the likelihood of any one user getting this specific variant. See the [weights section](#variant-weight) for more info.

- an optional **payload**:

    A variant can also have an associated payload. Use this to deliver more data or context. See the [payload section](#variant-payload) for a more details.


- an optional **override**

    Overrides let you specify that certain users (as identified either by their user ID or by another [custom stickiness](stickiness) value) will always get this variant, regardless of the variant's weight.

![A form for adding new variants. It has fields for name, weight, payload, and overrides.](/img/variant-creation-form.png 'Creating a new toggle variant')

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

#### Overrides

:::note
Overrides are intended to be used for one-off cases and during development and may not be suitable for other use cases.
:::

The weighting system automatically assigns users to a specific group for you. If you want to make sure that a specific user or group of users receives a certain variant, though, you can use the override functionality to achieve that.

When adding an override, you choose a [field from the Unleash Context](../user_guide/unleash_context) and specify that if a context contains one of a given list of values, then the current variant should always activate.

You can use both standard and custom context fields when creating overrides.

Each variant can have multiple overrides, so you can use any number of context fields you want to create overrides. When using multiple overrides, each user only has to match one of them. In other words, if you use the following overrides, the users with IDs *aa599* and *aa65* **and** any users who use the client with ID _123abc_ will receive the specified variant:
- `userId`: aa599, aa65
- `clientId`: 123abc


Note that if multiple variants use overrides that affect the same user, then Unleash can not guarantee which override will take effect. We recommend that you do not use multiple overrides that can conflict in this way, as it will probably not do what you expect.

### Variant payload

Each variant can have an associated payload. Use this to add more context or data to a payload that you can access on the client, such as a customized message or other information.

Unleash currently supports these payload types:

- JSON
- CSV
- String

### Variant stickiness

Variant stickiness is calculated on the received user and context, as described in [the stickiness chapter](stickiness). This ensures that the same user will consistently see the same variant barring overrides and weight changes. If no context data is provided, the traffic will be spread randomly for each request.


## How do I configure variants

In the Unleash UI, you can configure variants by navigating to the feature view, and then choosing the 'Variants' tab.

![toggle_variants](/img/variants.png 'Feature Toggle Variants')

## The `disabled` variant

When a toggle has no variants or when a toggle is disabled for a user, Unleash will return it with variant data that looks like this:

```json
{
  "name": "disabled",
  "enabled": false
}
```

This is a fallback variant that Unleash uses to represent the lack of a variant.

Note: The actual representation of the built-in fallback variant in the client SDK will vary slightly, to honor best practices in various languages.

## Client SDK Support {#client-sdk-support}

To make use of toggle variants, you need to use a compatible client. Client SDK with variant support:

- [unleash-client-node](https://github.com/Unleash/unleash-client-node) (from v3.2.0)
- [unleash-client-java](https://github.com/Unleash/unleash-client-java) (from v3.2.0)
- [unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby) (from v0.1.6)
- [unleash-client-python](https://github.com/Unleash/unleash-client-python) (from v3.3.0)
- [unleash-client-dotnet](https://github.com/Unleash/unleash-client-dotnet) (from v1.3.6)
- [unleash-client-go](https://github.com/Unleash/unleash-client-go) (from v3 branch)
- [unleash-client-php](https://github.com/Unleash/unleash-client-php) (from v1.0.0)

If you would like to give feedback on this feature, experience issues or have questions, please feel free to open an issue on [GitHub](https://github.com/Unleash/unleash/).
