---
title: Activation Strategies
---

import VideoContent from '@site/src/components/VideoContent.jsx'

## Overview 

An activation strategy determines who should get a feature. They allow you to enable and disable features for certain users without having to redeploy your application. For example, you can release features only to users with a specific user ID, email, IP address, and more. They allow you to implement gradual rollouts to specific user segments, for example, those on a specific subscription plan or region. You can also use them to schedule feature releases or make features available for a limited time.

An activation strategy is assigned to one [feature flag](/reference/feature-toggles) in one [environment](/reference/environments). For a feature flag to be enabled in a given context, such as for a user or application, at least one of the feature flag's activation strategies must resolve to true.

You can copy activation strategies from one environment to the other, but the different strategy configurations do not stay in sync. The `default` activation strategy is a gradual rollout to 100% of users, which means that the flag is enabled for everyone. You can use rollout percentage, [constraints](#constraints), targeting, and strategy variants to further define your activation strategies.

![A feature flag with two strategies](/img/activation-strategies-example.png)


## Constraints

:::note Availability

**Version**: `4.16+`

:::

Constraints are conditional statements that must be satisfied for an activation strategy to be evaluated for a feature flag. Constraints use fields from the [Unleash context](/reference/unleash-context) to determine whether a strategy should apply or not. You can constrain both on [standard context fields](../reference/unleash-context#structure) and on [custom context fields](../reference/unleash-context#custom-context-fields).

An activation strategy can have as many constraints as needed. When an activation strategy has multiple constraints, then every constraint must be evaluated to true for the strategy to be evaluated. It behaves equivalent to the AND logical operator. For example, if you have two constraints: one where the user email must have the domain "@mycompany.com" and one where the user must have signed up for a beta program, then the strategy would only be evaluated for users with "@mycompany.com" emails that have signed up for the beta program.

Constraints are applied to individual strategies and do not stay in sync with each other. To apply the same set of constraints to multiple strategies and keep them in sync, use [segments](/reference/segments).

<VideoContent videoUrls={["https://www.youtube.com/embed/kqtqMFhLRBE"]}/>

### Constraint structure

Each constraint has three parts:
- a **context field**: The [context field](/reference/unleash-context) to use for evaluation.
- an **operator**: One of the [constraint operators](#strategy-constraint-operators).
- **values**: A value or list of values to use in the evaluation of the constraint.

These parts turn the constraint into an expression that evaluates to true or false. Here are a few example constraints:

| Context field   | Operator        | Values                       | Description                                                                                                                                         |
|-----------------|-----------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `userId`        | `STR_ENDS_WITH` | `@example.com, @mycompany.com` | Evaluates to `true` for users whose user IDs end with `@example.com` or `@mycompany.com`.                                                           |
| `currentTime`   | `DATE_AFTER`    | `2022-06-05 21:43:22Z`         | Evaluates to `true` if the current time is after `2022-06-05 21:43:22Z`.                                                                            |
| `plan` | `IN`       | `Premium`, `Plus`                         | Evaluates to `true` if the [custom context field](../reference/unleash-context#custom-context-fields) `plan` is either 'Premium' or 'Plus'. |

### Constraint operators

Constraint operators help you define the conditional statements that get evaluated as part of the constraint. [Basic operators](#basic-operators) are available in all versions and SDKs. All other operators require Unleash version 4.9+ and [SDK compatibility](/reference/sdks#strategy-constraints).

All constraints can be negated. For example: 

| Operator      | Value |  Context field | Result |
|-----------|--------------------------------------------------------------------|--|--------|
| `STR_ENDS_WITH`  | "@user.com" | "hello@user.com" | true |
| NOT `STR_ENDS_WITH`  | "@user.com" | "hello@user.com" | false |

#### Basic operators

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


#### Date and time operators

All date and time operators require `currentTime` context field. Similarly, the `currentTime` context field can only be used with date and time operators. With the date and time operators, you can enable a feature before or after a specified time or make it available for a specific time span by combining the two operators.

Date and time operators only support single values.

| Operator          | Description |
|---------------|--------------------------------|
| `DATE_AFTER`  | `currentTime` is a date after the provided value. |
| `DATE_BEFORE` | `currentTime` is a date before the provided date. |

#### String operators

String operators accept multiple values and can be set to be case-sensitive or case-insensitive.

| Operator              | Description |
|-------------------|------------------------------------------------|
| `STR_CONTAINS`    | The context field contains any of the provided string values.       |
| `STR_ENDS_WITH`   | The context field ends with any of the provided strings values.     |
| `STR_STARTS_WITH` | The context field starts with any of the provided string values.    |


#### Versioning (SemVer) operators

SemVer operators are used to compare version numbers such as application versions or dependency versions. SemVer operators only support single values.

The value must start with and contain at least major, minor, and patch versions. For example, `1.2.3`. Optionally, you can also define pre-release version information by adding a hyphen and series of full-stop separated identifiers after the patch version. For example, `1.2.3-rc.2`. Values with pre-release versions are considered less than versions without a pre-release in accordance with [the SemVer specification, item 11](https://semver.org/#spec-item-11).

| Operator        | Description           |
|-------------|----------------------------------------------|
| `SEMVER_EQ` | The context field is equal to the provided value.              |
| `SEMVER_GT` | The context field is strictly greater than the provided value. |
| `SEMVER_LT` | The context field is strictly less than the provided value.    |

### Best practices

Server-side SDKs fetch the full feature flag configuration from Unleash, so every value that you add to that constraint value list increases the payload size. Therefore, we recommend avoiding large constraint value lists.

For example, if you considered adding hundreds of user IDs or emails to the constraint value list, consider what properties those users share. This typically helps define and use a custom property instead.

## Multiple activation strategies

You can apply as many activation strategies to a feature flag as needed. When a flag has multiple strategies, Unleash evaluates each strategy in isolation. If any one of the strategies resolves to true, the flag is enabled in the given context. This behaviour is equivalent to the OR logical operator.

As an example, consider a case where you want to roll a feature out to 75% of your users. However, you also want to make sure that you and your product lead get access to the feature. To achieve this, you would apply a **gradual rollout** strategy and set it to 75%. Additionally, you would add a **user IDs** strategy and add `engineer@mycompany.com` and `productlead@mycompany.com`.

![A feature flag with two active strategies: a user ID strategy and a gradual rollout strategy. The strategies are configured as described in the preceding paragraph.](/img/control_rollout_multiple_strategies.png)

## Add an activation strategy with a constraint

To add an activation strategy with a constraint to a feature flag, do the following:

1. Open the Admin UI and open the feature flag you'd like to add a strategy to.
2. Click **Add strategy**.
3. In the **Targeting** tab, go to the **Constraints** section, and click **Add constraint**.
4. Select a context field to constrain on, for example, `email`
5. Set your desired operator, for example, `STR_ENDS_WITH`.
6. Enter the values that the operator should evaluate, such as `@user.com`.
7. Click **Save strategy**.


## Add a custom context field

To add a custom context field in the Admin UI, do the following:

1. Go to **Configure** > **Context fields** and click **New context field**. 
2. Enter a context name.
3. In **Legal value**, enter a value you want the field to support and click **Add**. You can add additional values if needed.
4. Optionally, enable [custom stickeness](/reference/stickiness#custom-stickiness) if you'd like to use this field to group users for a gradual rollout strategy.
5. Click **Create context**.

## Client-side implementation

While activation strategies are defined on the server, the server does not implement the strategies. Instead, activation strategy implementation is done client-side. This means that it is the client that decides whether a feature should be enabled or not.

All [server-side client SDKs](../reference/sdks#server-side-sdks) and [Unleash Edge](../reference/unleash-edge) implement the default activation strategy. The [front-end client SDKs](../reference/sdks#front-end-sdks) do not do the evaluation themselves, instead relying on the [Unleash Edge](../reference/unleash-edge) to take care of the implementation and evaluation.

When using strategies with constraints, the client must provide the current [Unleash context](unleash-context) to the flag evaluation function for the evaluation to be done correctly. All official Unleash client SDKs support the option to pass dynamic context values to the `isEnabled()` function (or the SDK's equivalent).

If the constraint uses a standard Unleash Context field, set the context field to the value you wish to give it.

If the constraint uses a custom context field, use the Unleash Context's properties field. Use the name of the custom context field as a key and set the value to your desired string.

Unleash SDKs expect all context values to be strings. If you use an operator that acts on non-string values, such as [numeric operators](#numeric-operators) or [date and time operators](#date-and-time-operators), the SDK will attempt to convert the string into the expected type. If the conversion fails, the constraint will evaluate to `false`.

If you set a context field to a value that the SDKs cannot parse correctly for a chosen constraint operator, the constraint will evaluate to false. In other words: if you have a constraint operator that expects a number, such as NUM_GT, but you set the corresponding context field to a string value, then the expression will be false: "some string" is not greater than 5. This value can still be negated as explained in the section on negating values.

## Predefined strategy types

:::caution
[Predefined strategy type](/reference/predefined-strategy-types), such as UserIDs, IPs, and Hosts are deprecated. Please use the default strategy with constraints to achieve your desired targeting.
:::

# Custom activation strategies

:::caution
[Custom activation strategies](/reference/custom-activation-strategies) are deprecated. Please use the default strategy with constraints.
:::