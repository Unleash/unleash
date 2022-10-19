---
id: strategy_constraints
title: Strategy Constraints
---

:::info Availability

Before Unleash 4.16, strategy constraints were only available to Unleash Pro and Enterprise users. From 4.16 onwards, they're **available to everyone**.


Unleash 4.9 introduced a more comprehensive set of constraint operators. These require that both Unleash *and* your client SDK of choice support them. See the [SDK compatibility table](../sdks/index.md#strategy-constraints) for more information. Prior to Unleash 4.9, the only available operators were `IN` and `NOT_IN`.

:::

:::caution undefined behavior

When using _advanced strategy constraints_ (any operator that isn't `IN` or `NOT_IN`), *make sure your client SDK is up to date* and supports this feature. For older versions of the client SDKs we **cannot guarantee** any specific behavior. Please see the [incompatibilities section](#incompatibilities) for more information.

:::

**Strategy constraints** are conditions that must be satisfied for an [activation strategy](../user_guide/activation_strategy) to be evaluated for a feature toggle.
With strategy constraints, you can:
- roll out a feature **only to users in a specific region**
- schedule a feature to be **released at a specific time**
- make a feature available for **a limited time only**
- release a feature to users with one of a set of **email addresses**
- ... and much more!

Strategy constraints use fields from the [Unleash Context](../user_guide/unleash_context) to determine whether a strategy should apply or not.
You can constrain both on [standard context fields](../user_guide/unleash_context#structure) and on [custom context fields](../user_guide/unleash_context#custom-context-fields).

This page explains what strategy constraints are in Unleash and how they work. If you want to know *how you add* strategy constraints to an activation strategy, see [the corresponding how-to guide](../how-to/how-to-add-strategy-constraints.md "how to add strategy constraints").

## Constraining on custom context fields

:::info Making custom context fields available
To be able to constrain on a field, it must be listed under the Context Field menu. If a field isn't listed, you can add it yourself. See [the how-to guide for creating your own custom fields](../how-to/how-to-define-custom-context-fields.md) for more info.
:::

Unleash only provides a limited set of context fields by default, and they may not fulfill all your needs.
By using [custom context fields](../user_guide/unleash_context#custom-context-fields), you can tailor strategy constraints to your specific use case, such as:
- based on tenant IDs, release a feature to only specific tenants in a multi-tenant setup
- release a feature to users in a specific region
- release a feature only to beta testers

You can also combine strategy constraints with the [gradual rollout strategy](../user_guide/activation_strategy#gradual-rollout) to do a gradual rollout to a **specific segment** of your user base.

![A toggle with the gradual rollout strategy. The toggle is constrained on the custom content field "region" and set to only activate if the region is Africa or Europe.](/img/strategy-constraints.png)

## Constraint structure

Each strategy constraint has three parts:

- a **context field**: The context field to use for evaluation.
- an **operator**: One of the [operators listed below](#strategy-constraint-operators).
- a **value**/**list of values**: A value or list of values to use in the evaluation of the constraint.

These parts turn the strategy constraint into an expression that evaluates to either `true` or `false`.

To clarify, here's a few example strategy constraints and what they do:

| Context field   | Operator        | Value(s)                       | Description                                                                                                                                         |
|-----------------|-----------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `userId`        | `STR_ENDS_WITH` | `@example.com, @mycompany.com` | Evaluates to `true` for users whose user IDs end with `@example.com` or `@mycompany.com`.                                                           |
| `currentTime`   | `DATE_AFTER`    | `2022-06-05 21:43:22Z`         | Evaluates to `true` if the current time is after `2022-06-05 21:43:22Z`.                                                                            |
| `userScore`[^1] | `NUM_GTE`       | `1000`                         | Evaluates to `true` if the [custom context field](../user_guide/unleash_context#custom-context-fields) `userScore` has a value of `1000` or higher. |

## Strategy constraint operators

:::note Placeholder context field
In this section, `<context-field>` is used as a placeholder for an arbitrary context field. With the exception of the `currentTime` field, you can use any context field in its place.
:::

Unleash currently supports 15 different constraint operators.
The operators can be grouped into four different categories based on their method of comparison.

### Constraint negation / inversion {#constraint-negation}

All constraint expressions can be **negated**, meaning that they get their opposite value. Constraints are evaluated to either `true` or `false`. Negating a constraint would turn a `true` value into a `false` and a `false` value into a `true` value.

For instance, using the numeric equivalence operator `NUM_EQ`, the following truth table shows the how value negation affects the result:

| Expression   | Value   | Negated |
|--------------|---------|---------|
| 4 `NUM_EQ` 4 | `true`  | `false` |
| 4 `NUM_EQ` 5 | `false` | `true`  |


### Numeric operators

Numeric operators compare the numeric values of context fields with your provided value.

Numeric operators only accept single values.

| Name      | `true` if `<context-field>` is ...                                              |
|-----------|--------------------------------------------------------------------------------|
| `NUM_EQ`  | **equal** to the provided value; the mathematical `=` operator                 |
| `NUM_GT`  | **strictly greater than** the provided value; the mathematical `>` operator    |
| `NUM_GTE` | **greater than or equal to** the provided value; the mathematical `⩾` operator |
| `NUM_LT`  | **strictly less than** the provided value; the mathematical `<` operator       |
| `NUM_LTE` | **less than or equal to** the provided value; the mathematical `⩽` operator    |

You can read more about [numeric equality](https://en.wikipedia.org/wiki/Equality_(mathematics) "Mathematical equality at Wikipedia") or [numeric inequality operators at Wikipedia](https://en.wikipedia.org/wiki/Inequality_(mathematics)).

### Date and time operators

:::info `currentTime` and date and time operators
The date and time operators are **only available on the `currentTime`** context field. Furthermore, the `currentTime` context field **can not be used** with any of the other operators.
:::

With the date and time operators, you can enable a feature before and/or after a specified time.
The operators compare the [Unleash context's](../user_guide/unleash_context) `currentTime` property against the provided value.

You can create a **time span** by combining the two constraint operators using two different constraints on the same strategy.
In that case the strategy will be evaluated from `DATE_AFTER` and until `DATE_BEFORE`.

Date and time operators only support single values.

| Name          | `true` if `currentTime` is ... |
|---------------|--------------------------------|
| `DATE_AFTER`  | **after** the provided date       |
| `DATE_BEFORE` | **before** the provided date      |

### String operators

String operators differ from the other categories in two different ways:
- all operators accept multiple values
- most operators also consider [letter case](https://en.wikipedia.org/wiki/Letter_case "letter case on Wikipedia") and can be set to be case-sensitive or case-insensitive

| Name              | `true` if `<context-field>` ...                | Supports case-insensitivity | Available since |
|-------------------|------------------------------------------------|-----------------------------|-----------------|
| `IN`              | is **equal** to any of the provided values     | No                          | v3.3            |
| `NOT_IN`          | is **not equal** to any of the provided values | No                          | v3.3            |
| `STR_CONTAINS`    | **contains** any of the provided strings       | Yes                         | v4.9            |
| `STR_ENDS_WITH`   | **ends** with any of the provided strings      | Yes                         | v4.9            |
| `STR_STARTS_WITH` | **starts** with any of the provided strings    | Yes                         | v4.9            |


### Versioning (SemVer) operators

The SemVer operators are used to compare version numbers such as application versions, dependency versions, etc.

The SemVer input must follow a few rules:
- The value you enter **must** start with and contain at least major, minor, and patch versions: Example: `1.2.3`
- Optionally, you can also add pre-release version information by adding a hyphen and series of dot separated identifiers after the patch version. Example: `1.2.3-rc.2`

Versions with pre-release indicators (e.g. `4.8.0-rc.2`) are considered *less than* versions without (e.g. `4.8.0`) in accordance with [the SemVer specification, item 11](https://semver.org/#spec-item-11).

You can read more about SemVer in [the full SemVer specification](https://semver.org/).

SemVer operators only support single values.

| Name        | `true` if `<context-field>` is ...           |
|-------------|----------------------------------------------|
| `SEMVER_EQ` | **equal** to the provided value              |
| `SEMVER_GT` | **strictly greater than** the provided value |
| `SEMVER_LT` | **strictly less than** the provided value    |

Additionally, you can use negation to get _less than or equal to_ and _greater than or equal to_ functionality:

| Effect                   | How                | `true` if `<context-field>` is ...              |
|--------------------------|--------------------|-------------------------------------------------|
| Greater than or equal to | Negate `SEMVER_LT` | **greater than or equal to** the provided value |
| Less than or equal to    | Negate `SEMVER_GT` | **less than or equal to** the provided value    |

"Not less than 2.0.0" _is the same as_ "greater than or equal to 2.0.0". The same applies for _less than or equal_: "Not greater than 1.9.5." _is the same as_ "less than or equal to 1.9.5".

## Interacting with strategy constraints in the client SDKs {#sdks}

:::note
This section gives a brief overview over to use the client SDKs to interact with strategy constraints. The exact steps will vary depending on which client you are using, so make sure to consult the documentation for your specific client SDK.
:::

Strategy constraints require [the Unleash Context](../user_guide/unleash_context) to work. All official [Unleash client SDKs](../sdks/index.md) support the option to pass [dynamic context values](../user_guide/unleash_context#structure "Unleash Context, section: structure") to the `isEnabled` function (or the SDK's equivalent).

If the strategy constraint uses a [**standard Unleash Context field**](../user_guide/unleash_context#structure), set the context field to the value you wish to give it.

If the strategy constraint uses a [**custom context field**](../user_guide/unleash_context#custom-context-fields), use the Unleash Context's `properties` field. Use the name of the custom context field as a key and set the value to your desired string.

If you set a context field to a value that the SDKs cannot parse correctly for a chosen constraint operator, the strategy constraint will evaluate to false.
In other words: if you have a strategy constraint operator that expects a number, such as `NUM_GT`, but you set the corresponding context field to a string value, then the expression will be false: `"some string"` is **not** greater than `5`.
This value can still be negated as explained in [the section on negating values](#constraint-negation).

## Incompatibilities and undefined behavior {#incompatibilities}

It's important that you use an up-to-date client SDK if you're using the advanced constraint operators introduced in Unleash 4.9. If your client SDK does not support the new operators, we cannot guarantee how it'll react. As a result, you may see different behavior across applications.

If you use the new constraints with old SDKs, here's how it'll affect _some_ of the SDKs (the list is not exhaustive):
- The Node.js and Go client SDKs will ignore the new constraints completely: the constraints will not affect the toggle's status.
- The Python client SDK will evaluate the toggle to false, as it cannot evaluate the constraint successfully.
- The .NET, Ruby, and PHP SDKs raise exceptions if the provided operator is not `IN` or `NOT_IN`.

Please inspect the [SDK compatibility table to see which version of your preferred SDK introduced support for this feature](../sdks/index.md#strategy-constraints).

After Unleash 4.9, we updated the [Unleash client specification](https://github.com/Unleash/client-specification). Going forward, any constraint that a client does not recognize, **must be evaluated as `false`**

## [Deprecated]: Constrain on a specific environment {#constrain-on-a-specific-environment}

Before Unleash 4.3, using strategy constraints was the recommended way to have different toggle configurations per environment. Now that Unleash has environment support built in, we no longer recommend you use strategy constraints for this. Instead, see the [environments documentation](../user_guide/environments).

[^1]: `userScore` is not a default Unleash field, but can be added as a [custom context field](../user_guide/unleash_context#custom-context-fields).
