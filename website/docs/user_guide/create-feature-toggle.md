---
id: create_feature_toggle
title: How to create a feature toggle
---

[Feature toggles](../reference/feature-toggles.mdx) are the foundation of Unleash. They are at the core of everything we do and are a fundamental building block in any feature management system. This guide shows you how to create feature toggles in Unleash and how to add any optional constraints, segments, variants, and more. Links to learn more about these concepts will be scattered throughout the text.

You can perform every action both via the UI and the admin API. This guide includes screenshots to highlight the relevant UI controls and links to the relevant API methods for each step.

This guide is split into three sections:

1. [Prerequisites](#prerequisites): you need these before you can create a toggle.
2. [Required steps](#required-steps): all the required steps to create a toggle and activate it in production.
3. [Optional steps](#optional-steps): optional steps you can take to further target and configure your feature toggle and its audience.

## Prerequisites

To be able to create a feature toggle in an Unleash system you will need:

- A running Unleash instance
- A project to hold the toggle
- A user with an **editor** or **admin** role OR a user with the following permissions inside the target project:
  - create feature toggles
  - create/edit variants
  - create activation strategies (for the right environment)
  - update activation strategies (for the right environment)
  - enable/disable toggles (for the right environment)

:::info roles

Refer to [the documentation on role-based access control](./rbac.md) for more information about the available roles and their permissions.

:::

## Required steps

This section takes you through the required steps to create and activate a feature toggle. It assumes that you have all the prerequisites from the previous section done.

### Step 1: Create a toggle {#step-1}

:::tip API: create a toggle

Use the [Admin API endpoint for creating a feature toggle](../api/admin/feature-toggles-api-v2.md#create-toggle). The payload accepts all the same fields as the Admin UI form. The Admin UI also displays the corresponding cURL command when you use the form.

:::

In the project that you want to create the toggle in, use the "new feature toggle" button and fill the form out with your desired configuration. Refer to the [feature toggle reference documentation](../reference/feature-toggles.mdx) for the full list of configuration options and explanations.

![](/img/create-toggle-new-toggle.png)

### Step 2: Add a strategy {#step-2}

:::tip API: Add a strategy

Use the [API for adding a strategy to a feature toggle](../api/admin/feature-toggles-api-v2.md#add-strategy). You can find the configuration options for each strategy in the [activation strategy reference documentation](../user_guide/activation-strategies.md).

:::

Decide which environment you want to enable the toggle in. Select that environment and add an activation strategy. Different activation strategies will act differently as described in the [activation strategy documentation](../user_guide/activation-strategies.md). The configuration for each strategy differs accordingly. After selecting a strategy, complete the steps to configure it.

![](/img/create-toggle-add-strategy.png)

### Step 3: Enable the toggle {#step-3}

:::tip API: Enable a toggle

Use the [API for enabling an environment for a toggle](../api/admin/feature-toggles-api-v2.md#enable-env) and specify the environment you'd like to enable.

:::

Use the environments toggles to switch on the environment that you chose above. Depending on the activation strategy you added in the previous step, the toggle should now evaluate to true or false depending on the Unleash context you provide it.

![](/img/create-toggle-enable-env.png)

## Optional steps

These optional steps allow you to further configure your feature toggles to add optional payloads, variants for A/B testing, more detailed user targeting and exceptions/overrides.

### Add constraints and segmentation

Constraints and segmentation allow you to set filters on your strategies, so that they will only be evaluated for users and applications that match the specified preconditions. Refer to the [strategy constraints](../advanced/strategy-constraints.md 'strategy constraints reference documentation') and [segments reference documentation](../reference/segments.mdx) for more information.

To add constraints and segmentation, use the "edit strategy" button for the desired strategy.

![](/img/create-toggle-edit-strategy.png)

#### Constraints

:::info

Constraints aren't fixed and can be changed later to further narrow your audience. You can add them either when you add a strategy to a toggle or at any point thereafter.

:::

:::tip API: Add constraints

You can either [add constraints when you add the strategy](../api/admin/feature-toggles-api-v2.md#add-strategy) or [PUT](../api/admin/feature-toggles-api-v2.md#update-strategy 'PUT an activation strategy') or [PATCH the strategy afterwards](../api/admin/feature-toggles-api-v2.md#put-strategy)

:::

In the strategy configuration screen for the strategy that you want to configure, use the "add constraint" button to add a strategy constraint.

![](/img/create-toggle-add-constraint.png)

#### Segments

:::info

This can be done after you have created a strategy.

:::

:::tip API: add segments

Use the [API for adding segments to a strategy](../api/admin/segments.mdx#replace-activation-strategy-segments) to add segments to your strategy.

:::

In the strategy configuration screen for the strategy that you want to configure, use the "select segments" dropdown to add segments.

![](/img/create-toggle-add-segment.png)

### Add variants

:::info

This can be done at any point after you've created your toggle.

:::

:::tip API: add variants

Use the [update variants endpoint](../api/admin/feature-toggles-api-v2.md#update-variants). The payload should be your desired variant configuration.

:::

[Variants](../advanced/feature-toggle-variants.md) give you the ability to further target your users and split them into groups of your choosing, such as for A/B testing. On the toggle overview page, select the variants tab. Use the "new variant" button to add the variants that you want.

![](/img/create-toggle-add-variants.png)
