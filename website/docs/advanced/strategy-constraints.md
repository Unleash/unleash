---
id: strategy_constraints
title: Strategy Constraints
---

<div class="alert alert--info" role="alert">
  Strategy constraints are part of Unleash Pro and Enterprise.
</div>
<BR />

Strategy constraints allow you to set preconditions on activation strategies that must be satisfied for the activation strategy to take effect. For example, you might want a strategy to only trigger if a user belongs to a specific group or is in a specific country.

Constraints use fields from the [Unleash Context](../user_guide/unleash_context) to determine whether a strategy should apply or not. You can constrain on both standard context fields and on custom context fields.

To be able to constrain on a field, it must be listed under the Context Field menu. If a field isn't listed, you can add it. See [the section on defining your own custom fields](#define-your-own-custom-fields) for more info.

## How to add strategy constraints

To add a strategy constraint, you'll need a feature toggle with a defined strategy.

Then, use the "add constraint" button in the UI, choose your context field, and the appropriate values that you wish to constrain it to.

![A feature toggle strategy view showing a button labeled with add constraints.](/img/add-constraint.png)


### Constraining on standard context fields

To constrain on a standard context field, choose the field you wish to constrain on. If the context field you want to constrain on isn't listed, you'll need to add it manually via the Context Field menu. Follow the procedure as if you were [defining custom context fields](#define-your-own-custom-fields), but give it a name that matches the desired field in the Unleash Context. Note that context fields are case-sensitive.

### Constraining on custom context fields {#constrain-on-custom-context-fields}

If you need context data that isn't available in the default Unleash Context, you can also constrain on custom context fields. A common use case is a multi-tenant service where you want to use a tenant identifier to control the feature rollout. This would allow you to decide which users should get access to your new feature based on the tenant.

![A toggle with the gradual rollout strategy. The toggle is constrained on the custom content field \"region\" and set to only activate if the region is Africa or Europe.](/img/custom-constraints.png)

#### Defining custom fields {#define-your-own-custom-fields}

> Starting with Unleash-enterprise version 3.2.28 customers can define their custom context fields via the user interface.

You can also define custom context fields to use with strategy constraints. We have seen customers use multiple variants of custom context fields to control their feature rollout, such as:

- `region`
- `country`
- `customerType`
- `tenantId`

Combining strategy constraints with the [gradual rollout strategy](../user_guide/activation_strategy#gradual-rollout) would allow you to do a gradual rollout to a specific segment of your user base.

##### Step 1: Navigate to “Context Fields“ {#step-1-navigate-to-context-fields}

Locate “context fields in the menu"

![The top Unleash navigation menu with the \"advanced\" section expanded. The dropdown shows a number of options, including one called \"context fields\", which is highlighted by an overlaid arrow.](/img/context-fields.png)

##### Step 2: Define new context field {#step-2-define-new-context-field}

Next you can define your new context field. The minimum requirement is to give it a unique _name_. In addition, you can give it a description and define [_legal values_](#what-is-legal-values).

![A form to define new context fields. It has fields labeled \"name\", \"description\", and \"legal values\".](/img/new_context_field.png)

###### What are “legal values”? {#what-is-legal-values}

To constrain what values a user can enter for a context field in the Unleash Admin UI, you can use _legal values_. This is a set of predefined values that show up as a dropdown

A context field's _legal values_ are a set of predefined values that you can

define all possible values for that context field. These values appear in the Unleash Admin UI to guide users when working with context fields to make sure they only use legal values.

![A modal to define constraints. The \"region\" context field is selected and a dropdown is showing the legal values defined for that field: Africa, Asia, Europe, North-America.](/img/constraints_legal_values.png)

### [Deprecated]: Constrain on a specific environment {#constrain-on-a-specific-environment}

Before Unleash 4.3, using strategy constraints was the recommended way to have different toggle configurations per environment. Now that Unleash has environment support built in, we no longer recommend you use strategy constraints for this. Instead, see the [environments documentation](../user_guide/environments).
