---
id: create_feature_toggle
title: How to create a feature toggle
---

import ApiRequest from '@site/src/components/ApiRequest'


:::info Placeholders
Placeholders in the code samples in this document are delimited by angle brackets (i.e. `<placeholder-name>`). You will need to replace them with the values that are correct in _your_ situation for the code samples to run properly.
:::

Feature toggles are the foundation of Unleash. They are at the core of everything we do and is a fundamental building block in any feature management system. This guide shows you how to create feature toggles in Unleash including how to add any optional constraints, segments, variants, and more. Links to learn more about the concepts will be scattered throughout the text.

The guide below is split into three sections:
1. [Prerequisites](#prerequisites): you need this before you can create a toggle.
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

### Step 1: Create a feature {#step-1}

In the project that you want to create the toggle in, use the "new feature toggle" button and fill the form out with your desired configuration. Refer to the [feature toggle reference documentation](../reference/feature-toggles.mdx) for the full list of configuration options and explanations.

API equivalent: [use the API to create a feature toggle](../api/admin/feature-toggles-api-v2.md#create-toggle)


### Step 2: Add a strategy {#step-2}

Decide which environment you want to enable the toggle in. Select that environment and add an activation strategy. Different activation strategies will act differently as described in the [activation strategy documentation](../user_guide/activation-strategies.md).

API equivalent: [use the API to add a strategy to a feature toggle](../api/admin/feature-toggles-api-v2.md#add-strategy)

### Step 3: Enable the toggle {#step-3}

Use the environments toggles to switch on the environment that you chose above. Depending on the activation strategy you added in the previous step, the toggle should now evaluate to true or false depending on the Unleash context you provide it. To try

API equivalent: [use the API to enable an environment for a toggle](../api/admin/feature-toggles-api-v2.md#enable-env)

## Optional steps

These optional steps allow you to further configure your feature toggles to add optional payloads, variants for A/B testing, more detailed user targeting and exceptions/overrides.

### Add constraints and segmentation
This can be done at any point after you've added a strategy to your toggle.

API: either [add constraints when you add the strategy](../api/admin/feature-toggles-api-v2.md#add-strategy) or [PUT](../api/admin/feature-toggles-api-v2.md#update-strategy "PUT an activation strategy") [PATCH the strategy afterwards](../api/admin/feature-toggles-api-v2.md#put-strategy)

### Add variants

API: [update variants endpoint](../user_guide/activation-strategies.md#update-variants)
