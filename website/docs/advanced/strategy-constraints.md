---
id: strategy_constraints
title: Strategy Constraints
---

:::info Availability
Strategy constraints are available to Unleash Pro and Enterprise users.
:::

:::tip
This page explains what strategy constraints are in Unleash and how they work. If you want to know *how you add* strategy constraints to an activation strategy, see [the corresponding how-to guide](../how-to/how-to-add-strategy-constraints.md "how to add strategy constraints").
:::

**Strategy constraints** allow you to set preconditions on activation strategies that must be satisfied for the activation strategy to take effect. For example, you might want a strategy to only trigger if a user belongs to a specific group or is in a specific country.

Constraints use fields from the [Unleash Context](../user_guide/unleash_context) to determine whether a strategy should apply or not. You can constrain on both [standard context fields](../user_guide/unleash_context#structure) and on [custom context fields](../user_guide/unleash_context#custom-context-fields). A common use for using custom context fields is a multi-tenant service where you want to use a tenant identifier to control the feature rollout. This would allow you to decide which users should get access to your new feature based on the tenant. Other commonly seen custom context fields include fields for region, country, and customer type.


Combining strategy constraints with the [gradual rollout strategy](../user_guide/activation_strategy#gradual-rollout) allows you to do a gradual rollout to a specific segment of your user base.

![A toggle with the gradual rollout strategy. The toggle is constrained on the custom content field "region" and set to only activate if the region is Africa or Europe.](/img/custom-constraints.png)

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

Unleash currently supports 15 different constraint operators.
The operators can be grouped into four different categories based on their method of comparison.

Each operator forms a predicate together with the provided context field.

Each operator forms an expression of the form `<your context field> <operator> <value>`

### Negation / inverse values

All operators can be **negated**, meaning that they get their opposite value. Constraints are evaluated to either `true` or `false`. Negating an operator would turn a `true` into a `false` and a `false` value into a `true` value.

For instance, using the numeric equivalence operator `NUM_EQ`, the following truth table shows the how value negation affects the result:

| Expression   | Value   | Negated |
|--------------|---------|---------|
| 4 `NUM_EQ` 4 | `true`  | `false` |
| 4 `NUM_EQ` 5 | `false` | `true`  |


### Numeric operators

| Name      | `true` if `<contextField>` is ...                                            |
|-----------|-----------------------------------------------------------------------------|
| `NUM_EQ`  | **equal** to the provided value; the mathematical `=` operator                 |
| `NUM_GT`  | **strictly greater than** the provided value; the mathematical `>` operator    |
| `NUM_GTE` | **greater than or equal to** the provided value; the mathematical `⩾` operator |
| `NUM_LT`  | **strictly less than** the provided value; the mathematical `<` operator       |
| `NUM_LTE` | **less than or equal to** the provided value; the mathematical `⩽` operator    |

You can read more about [numeric equality](https://en.wikipedia.org/wiki/Equality_(mathematics) "Mathematical equality at Wikipedia") or [numeric inequality operators at Wikipedia](https://en.wikipedia.org/wiki/Inequality_(mathematics)).

### Date and time operators

:::info Context field availability
The date and time operators are **only available on the `currentTime`** context field.
:::

With the date and time operators, you can enable a feature before and/or after a specified time.
They compare the [Unleash context's](../user_guide/unleash_context) `currentTime` property.

You can combine the two constraint operators by setting two separate constraints on a single strategy to create a time span.
In that case the strategy will be evaluated from `DATE_AFTER` and until `DATE_BEFORE`.

| Name          | `true` if `currentTime` is ... |
|---------------|--------------------------------|
| `DATE_AFTER`  | **after** the provided date       |
| `DATE_BEFORE` | **before** the provided date      |

### String operators

String operators are all multi-value and most can be either case sensitive or insensitive

:::note Legacy note
For legacy reasons / backwards compatibility, `IN` and `NOT_IN` are always case sensitive.

`IN` and `NOT_IN` are also each other's inverses.
:::

In the below table, `<contextField>` is used to indicate that the value of ...

| Name              | Available since | `true` if `<contextField>` ...                 |
|-------------------|-----------------|------------------------------------------------|
| `IN`              | 3.3             | is **equal** to any of the provided values     |
| `NOT_IN`          | 3.3             | is **not equal** to any of the provided values |
| `STR_CONTAINS`    | 4.9             | **contains** any of the provided strings       |
| `STR_ENDS_WITH`   | 4.9             | **ends** with any of the provided strings      |
| `STR_STARTS_WITH` | 4.9             | **starts** with any of the provided strings    |


### Versioning (semver) operators

Versions with pre-release indicators (e.g. `4.8.0-rc.2`) are considered less than versions without (e.g. `4.8.0`) in accordance with [the SemVer specification](https://semver.org/#spec-item-11).

| Name        | `true` if `<contextField>` is ...            |
|-------------|----------------------------------------------|
| `SEMVER_EQ` | **equal** to the provided value              |
| `SEMVER_GT` | **strictly greater than** the provided value |
| `SEMVER_LT` | **strictly less than** the provided value    |


## Interacting with strategy constraints in the client SDKs {#sdks}

:::note
This section gives a brief overview over to use the client SDKs to interact with strategy constraints. The exact steps will vary depending on which client you are using, so make sure to consult the documentation for your specific client SDK.
:::

Strategy constraints require [the Unleash Context](../user_guide/unleash_context) to work. All official [Unleash client SDKs](../sdks/index.md) support the option to pass [dynamic context values](../user_guide/unleash_context#structure "Unleash Context, section: structure") to the `isEnabled` function (or the SDKs equivalent).

If the strategy constraint uses a [**standard Unleash Context field**](../user_guide/unleash_context#structure), set the context field to the value you wish to give it.

If the strategy constraint uses a [**custom context field**](../user_guide/unleash_context#custom-context-fields), use the Unleash Context's `properties` field. Use the name of the custom context field as a key and set the value to your desired string.

## Prerequisites

To be able to constrain on a field, it must be listed under the Context Field menu. If a field isn't listed, you can add it yourself. See [the how-to guide for creating your own custom fields](../how-to/how-to-define-custom-context-fields.md) for more info.


## [Deprecated]: Constrain on a specific environment {#constrain-on-a-specific-environment}

Before Unleash 4.3, using strategy constraints was the recommended way to have different toggle configurations per environment. Now that Unleash has environment support built in, we no longer recommend you use strategy constraints for this. Instead, see the [environments documentation](../user_guide/environments).

[^1]: `userScore` is not a default Unleash field, but can be added as a [custom context field](../user_guide/unleash_context#custom-context-fields).
