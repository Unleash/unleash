---
title: How to create a feature flag
description: 'This guide shows you how to create feature flags in Unleash and how to add constraints, segments, variants, and more.'
slug: /how-to-create-feature-flag
---

[Feature flags](../reference/feature-toggles) are the foundation of Unleash. They are at the core of everything we do and are a fundamental building block in any feature management system. This guide shows you how to create feature flags in Unleash and how to add any optional constraints, segments, variants, and more. Links to learn more about these concepts will be scattered throughout the text.

You can perform every action both via the UI and the admin API. This guide includes screenshots to highlight the relevant UI controls and links to the relevant API methods for each step.

This guide is split into three sections:

1. [Prerequisites](#prerequisites): you need these before you can create a flag.
2. [Required steps](#required-steps): all the required steps to create a flag and activate it in production.
3. [Optional steps](#optional-steps): optional steps you can take to further target and configure your feature flag and its audience.

## Prerequisites

To perform all the steps in this guide, you will need:

- A running Unleash instance
- A project to hold the flag
- A user with an **editor** or **admin** role OR a user with the following permissions inside the target project:
  - **[project-level permissions](../reference/rbac#project-permissions)**
    - create feature flags
  - **[environment-level permissions](../reference/rbac#environment-permissions)**
    - create/edit variants[^1]
    - create activation strategies
    - update activation strategies
    - enable/disable flags

:::info roles

Refer to [the documentation on role-based access control](../reference/rbac) for more information about the available roles and their permissions.

:::

## Required steps

This section takes you through the required steps to create and activate a feature flag. It assumes that you have all the prerequisites from the previous section done.

### Step 1: Create a flag {#step-1}

:::tip API: create a flag

Use the [Admin API endpoint for creating a feature flag](/reference/api/legacy/unleash/admin/features-v2#create-toggle). The payload accepts all the same fields as the Admin UI form. The Admin UI also displays the corresponding cURL command when you use the form.

:::

In the project that you want to create the flag in, use the "new feature flag" button and fill the form out with your desired configuration. Refer to the [feature flag reference documentation](../reference/feature-toggles) for the full list of configuration options and explanations.

![](/img/create-toggle-new-toggle.png)

### Step 2: Add a strategy {#step-2}

:::tip API: Add a strategy

Use the [API for adding a strategy to a feature flag](/reference/api/legacy/unleash/admin/features-v2#add-strategy). You can find the configuration options for each strategy in the [activation strategy reference documentation](../reference/activation-strategies).

:::

Decide which environment you want to enable the flag in. Select that environment and add an activation strategy. Different activation strategies will act differently as described in the [activation strategy documentation](../reference/activation-strategies). The configuration for each strategy differs accordingly. After selecting a strategy, complete the steps to configure it.

![](/img/create-toggle-add-strategy.png)

### Step 3: Enable the flag {#step-3}

:::tip API: Enable a flag

Use the [API for enabling an environment for a flag](/reference/api/legacy/unleash/admin/features-v2#enable-env) and specify the environment you'd like to enable.

:::

Use the environments flags to switch on the environment that you chose above. Depending on the activation strategy you added in the previous step, the flag should now evaluate to true or false depending on the Unleash context you provide it.

![](/img/create-toggle-enable-env.png)

## Optional steps

These optional steps allow you to further configure your feature flags to add optional payloads, variants for A/B testing, more detailed user targeting and exceptions/overrides.

### Add constraints and segmentation

Constraints and segmentation allow you to set filters on your strategies, so that they will only be evaluated for users and applications that match the specified preconditions. Refer to the [strategy constraints](../reference/activation-strategies#constraints) and [segments reference documentation](../reference/segments) for more information.

To add constraints and segmentation, use the "edit strategy" button for the desired strategy.

![](/img/create-toggle-edit-strategy.png)

#### Constraints

:::info

Constraints aren't fixed and can be changed later to further narrow your audience. You can add them either when you add a strategy to a flag or at any point thereafter.

:::

:::tip API: Add constraints

You can either [add constraints when you add the strategy](/reference/api/unleash/add-feature-strategy) or [PUT](/reference/api/unleash/update-feature-strategy) or [PATCH](/reference/api/unleash/patch-feature-strategy) the strategy later.

:::

In the strategy configuration screen for the strategy that you want to configure, use the "add constraint" button to add a strategy constraint.

![](/img/create-toggle-add-constraint.png)

#### Segments

:::info

This can be done after you have created a strategy.

:::

:::tip API: add segments

Use the [API for adding segments to a strategy](/reference/api/unleash/update-feature-strategy-segments) to add segments to your strategy.

:::

In the strategy configuration screen for the strategy that you want to configure, use the "select segments" dropdown to add segments.

![](/img/create-toggle-add-segment.png)

### Add variants

:::info

This can be done at any point, during or after the creation of your flag.

:::

[Variants](../reference/strategy-variants) give you the ability to further target your users and split them into groups of your choosing, such as for A/B testing. On the flag overview page, select the variants tab. Use the "new variant" button to add the variants that you want.
