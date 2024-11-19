---
title: Activation Strategies
---

import VideoContent from '@site/src/components/VideoContent.jsx'

## Overview 

An activation strategy determines who should get a feature. They allow you to enable and disable features for certain users without having to redeploy your application. For example, you can release features only to users with a specific user ID, email, IP address, and more. You can implement gradual rollouts to specific user segments, for example, those on a specific subscription plan or region. You can also use them to schedule feature releases or make features available for a limited time.

An activation strategy is assigned to one [feature flag](/reference/feature-toggles) in one [environment](/reference/environments). A feature flag is enabled in a given context (for example, user or application) if at least one of its activation strategies resolves to true.

You can copy activation strategies from one environment to the other, but the different strategy configurations do not stay in sync. The default activation strategy is a 100% gradual rollout, enabling the flag for all users. You can refine this using [rollout percentage](#rollout-percentage), [targeting](#targeting), and [variants](/reference/strategy-variants).

Feature flags can have multiple activation strategies. Unleash evaluates each strategy independently, enabling the flag if any resolves to true. This behavior is equivalent to the OR logical operator.

For example, to roll out a feature to 75% of users while granting access to internal users, you can add two activation strategies as follows: 
1. Gradual rollout to 75%.
2. Gradual rollout to 100% with a constraint on the email address.
   
![A feature flag with two strategies](/img/activation-strategies-example.png)

## Rollout percentage

The rollout percentage determines the proportion of users exposed to a feature. It uses a normalized [MurmurHash](https://en.wikipedia.org/wiki/MurmurHash) of a user’s unique ID, ensuring consistent and random feature distribution. [Stickiness](/reference/stickiness) maintains a stable user experience across sessions.

## Targeting

Segmentation and constraints allow you to define conditions for your activation strategies so that they will only be evaluated for users and applications that match those criteria. Constraints are individual conditional statements, while [segments](/reference/segments) are a reusable set of constraints that you can apply to multiple strategies.

### Constraints

:::note Availability

**Version**: `4.16+`

:::

Constraints are conditional rules that determine whether a strategy applies, based on fields from the [Unleash context](/reference/unleash-context). Constraints can reference both [standard context fields](../reference/unleash-context#structure) and [custom context fields](../reference/unleash-context#custom-context-fields).

An activation strategy can have as many constraints as needed. When an activation strategy has multiple constraints, then every constraint must be evaluated to true for the strategy to be evaluated. This behavior is equivalent to the AND logical operator. For example, if you have two constraints: one where the user email must have the domain "@mycompany.com" and one where the user must have signed up for a beta program, then the strategy would only be evaluated for users with "@mycompany.com" emails that have signed up for the beta program.

<VideoContent videoUrls={["https://www.youtube.com/embed/kqtqMFhLRBE"]}/>

#### Constraint structure

A constraint has three parts:
- a **context field**: The [context field](/reference/unleash-context) to use for evaluation.
- an **operator**: One of the [constraint operators](#strategy-constraint-operators).
- **values**: A value or list of values to use in the evaluation of the constraint.

These parts turn the constraint into an expression that evaluates to true or false. Here are a few example constraints:

| Context field   | Operator        | Values                       | Description                                                                                                                                         |
|-----------------|-----------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `userId`        | `STR_ENDS_WITH` | `@example.com, @mycompany.com` | Evaluates to `true` for users whose user IDs end with `@example.com` or `@mycompany.com`.                                                           |
| `currentTime`   | `DATE_AFTER`    | `2022-06-05 21:43:22Z`         | Evaluates to `true` if the current time is after `2022-06-05 21:43:22Z`.                                                                            |
| `plan` | `IN`       | `Premium`, `Plus`                         | Evaluates to `true` if the [custom context field](../reference/unleash-context#custom-context-fields) `plan` is either 'Premium' or 'Plus'. |

#### Constraint operators

Constraint operators help you define the conditional statements that get evaluated as part of the constraint. [Basic operators](#basic-operators) are available in all versions and SDKs. All other operators require Unleash version 4.9+ and [SDK compatibility](/reference/sdks#strategy-constraints).

All constraints can be negated. For example: 

| Operator      | Value |  Context field | Result |
|-----------|--------------------------------------------------------------------|--|--------|
| `STR_ENDS_WITH`  | "@user.com" | "hello@user.com" | true |
| NOT `STR_ENDS_WITH`  | "@user.com" | "hello@user.com" | false |

##### Basic operators

| Operator      | Description
|-----------|--------------------------------------------------------------------------------|
| `IN`  | The context field is equal to any of the provided values; case sensitive. |
| `NOT_IN`  | The context field is not equal to any of the values provided; case sensitive. |

#### Numeric operators

Numeric operators compare the numeric value of context fields with your provided value. Numeric operators only accept single values.

| Operator      | The context field is                                           |
|-----------|--------------------------------------------------------------------------------|
| `NUM_EQ`  | The context field is equal to the provided value. |
| `NUM_GT`  | The context field is strictly greater than the provided value.   |
| `NUM_GTE` | The context field is greater than or equal to the provided value. |
| `NUM_LT`  | The context field is strictly less than the provided value.       |
| `NUM_LTE` | The context field is less than or equal to the provided value.    |


##### Date and time operators

All date and time operators require the `currentTime` context field, and the `currentTime` context field can only be used with date and time operators. With these operators, you can enable a feature before or after a specified time or make it available for a specific time span by combining the two operators.

Date and time operators only support single values.

| Operator          | Description |
|---------------|--------------------------------|
| `DATE_AFTER`  | `currentTime` is a date after the provided value. |
| `DATE_BEFORE` | `currentTime` is a date before the provided date. |

##### String operators

String operators accept multiple values and can be set to be case-sensitive or case-insensitive.

| Operator              | Description |
|-------------------|------------------------------------------------|
| `STR_CONTAINS`    | The context field contains any of the provided string values.       |
| `STR_ENDS_WITH`   | The context field ends with any of the provided string values.     |
| `STR_STARTS_WITH` | The context field starts with any of the provided string values.    |


##### Versioning (SemVer) operators

SemVer operators are used to compare version numbers such as application versions or dependency versions. SemVer operators only support single values.

The value must start with and contain at least major, minor, and patch versions. For example, `1.2.3`. Optionally, you can also define pre-release version information by adding a hyphen and series of full-stop separated identifiers after the patch version. For example, `1.2.3-rc.2`. Values with pre-release versions are considered less than versions without a pre-release in accordance with [the SemVer specification, item 11](https://semver.org/#spec-item-11).

| Operator        | Description           |
|-------------|----------------------------------------------|
| `SEMVER_EQ` | The context field is equal to the provided value.              |
| `SEMVER_GT` | The context field is strictly greater than the provided value. |
| `SEMVER_LT` | The context field is strictly less than the provided value.    |

#### Best practices

Server-side SDKs fetch the full feature flag configuration from Unleash, so every value that you add to that constraint value list increases the payload size.

We recommend avoiding large constraint value lists. For example, instead of adding many user IDs or emails to the constraint value list, consider what properties those users share. This typically helps define and use a [custom context field](/reference/unleash-context#custom-context-field) instead.


## Add an activation strategy with a constraint

To add an activation strategy with a constraint to a feature flag, do the following:

1. Open the Admin UI and go to the feature flag you'd like to add a strategy to.
2. Select the environment you want to configrue and click **Add strategy**.
3. In the **Targeting** tab, go to the **Constraints** section, and click **Add constraint**.
4. Select a context field to constrain on, for example, `email`
5. Set your desired operator, for example, `STR_ENDS_WITH`.
6. Enter a value that the operator should evaluate, such as `@user.com`, and click **Add values**. Then click **Done**.
7. Click **Save strategy**.

## Client-side implementation

Activation strategies are defined on the server but implemented client-side. The client determines whether a feature should be enabled based on the activation strategies.

All [server-side client SDKs](../reference/sdks#server-side-sdks) and [Unleash Edge](../reference/unleash-edge) implement the default activation strategy. The [front-end client SDKs](../reference/sdks#front-end-sdks) do not perform evaluations themselves. Instead, they rely on [Unleash Edge](../reference/unleash-edge) to handle the implementation and evaluation.

When using strategies with constraints, the client must provide the current [Unleash context](unleash-context) to the flag evaluation function for the evaluation to be done correctly. All official Unleash client SDKs support the option to pass dynamic context values to the `isEnabled()` function (or the SDK's equivalent).

If the constraint uses a standard Unleash context field, set the context field to the required value. If the constraint uses a custom context field, use the Unleash context's `properties` field. Use the name of the custom context field as a key and set the value to your desired string.

Unleash SDKs expect all context values to be strings. If you use an operator that acts on non-string values, such as [numeric operators](#numeric-operators) or [date and time operators](#date-and-time-operators), the SDKs attempt to convert the string into the expected type. If the conversion fails, the constraint evaluates to `false`.

## Predefined strategy types

:::caution
[Predefined strategy types](/reference/predefined-strategy-types), such as UserIDs, IPs, and Hosts are deprecated. Please use the default strategy with constraints to achieve your desired targeting.
:::

# Custom activation strategies

:::caution
[Custom activation strategies](/reference/custom-activation-strategies) are deprecated. Please use the default strategy with constraints.
:::