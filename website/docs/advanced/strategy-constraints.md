---
id: strategy_constraints
title: Strategy Constraints
---

:::info Availability
Strategy constraints are available to Unleash Pro and Enterprise users.
:::

Strategy constraints allow you to set preconditions on activation strategies that must be satisfied for the activation strategy to take effect. For example, you might want a strategy to only trigger if a user belongs to a specific group or is in a specific country.

Constraints use fields from the [Unleash Context](../user_guide/unleash_context) to determine whether a strategy should apply or not. You can constrain on both [standard context fields](../user_guide/unleash_context#structure) and on [custom context fields](../user_guide/unleash_context#custom-context-fields). A common use for using custom context fields is a multi-tenant service where you want to use a tenant identifier to control the feature rollout. This would allow you to decide which users should get access to your new feature based on the tenant. Other commonly seen custom context fields include fields for region, country, and customer type.


Combining strategy constraints with the [gradual rollout strategy](../user_guide/activation_strategy#gradual-rollout) allows you to do a gradual rollout to a specific segment of your user base.

![A toggle with the gradual rollout strategy. The toggle is constrained on the custom content field "region" and set to only activate if the region is Africa or Europe.](/img/custom-constraints.png)

## Constraint structure

Each strategy constraint has three parts:

- **Context field**: The context field to evaluate.
- **Operator**: Either `IN` or `NOT_IN`.
- **Values**: The list of values that trigger this constraint.

The **context field** is the field that you want to use for constraining this strategy. The **values** field is a list of values that the constraint should either allow or deny. The **operator** determines whether the values are allowed or denied.

For instance, to constrain the strategy to only users with IDs `id-123` and `id-456`: select `userId` as the context field, use the `IN` operator, and set values to `id-123, id-456`. The strategy will then be evaluated only for these two users.

If, on the other hand, you would like to ensure the strategy is never evaluated for the same users, you would use the same configuration as above, but set the operator to `NOT_IN`. This would mean that the strategy is evaluated for all users _not_ listed in the values.

## Interacting with strategy constraints in the client SDKs {#sdks}

:::note
This section gives a brief overview over to use the client SDKs to interact with strategy constraints. The exact steps will vary depending on which client you are using, so make sure to consult the documentation for your specific client SDK.
:::

For the [Unleash client SDKs](../sdks/index.md) to use a strategy constraint during strategy evaluation, they must also receive the current Unleash context.


In the

Refer to the individual SDK's docs for exact examples, but the gist of it is that the context field must be filled out, either as a constant or as a custom field (`properties`), and that you must pass the unleash context to the evaluation.

## Prerequisites

To be able to constrain on a field, it must be listed under the Context Field menu. If a field isn't listed, you can add it yourself. See [the how-to guide for creating your own custom fields](../how-to/how-to-define-custom-context-fields.md) for more info.


## [Deprecated]: Constrain on a specific environment {#constrain-on-a-specific-environment}

Before Unleash 4.3, using strategy constraints was the recommended way to have different toggle configurations per environment. Now that Unleash has environment support built in, we no longer recommend you use strategy constraints for this. Instead, see the [environments documentation](../user_guide/environments).
