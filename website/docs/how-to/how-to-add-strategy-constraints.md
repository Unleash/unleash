---
title: How to add strategy constraints
---

:::info Availability
Strategy constraints are available to Unleash Pro and Enterprise users.
:::

This guide shows you how to add [strategy constraints](../advanced/strategy-constraints.md) to your feature toggles via the admin UI. For information on how to interact with strategy constraints from an [Unleash client SDK](../sdks/index.md), visit the specific SDKs documentation or see [the relevant section in the strategy constraints documentation](../advanced/strategy-constraints.md#sdks "strategy constraints documentation, section on interacting with constraints from client SDKs").

## Prerequisites

You'll need to have an existing feature toggle with a defined strategy to add a constraint. The rest of this guide assumes you have a specific strategy that you're working with.

## Step 1: Open the constraints menu {#step-1}

Every strategy will have button labeled "add constraints" when viewed in the admin UI. Interact with this to open the constraints menu.

![A feature toggle strategy view showing a button labeled with add constraints.](/img/add-constraint.png)

## Step 2: Configure the constraint {#step-2}

Refer to [the _constraint structure_ section of the strategy constraints reference](../advanced/strategy-constraints.md#constraint-structure) for a thorough explanation of the fields.

From the "Context Field" dropdown, select the context field you would like to constrain the strategy on.

![A strategy constraint form with a constraint set to "region". The "values" input is a dropdown menu containing the options "Africa", "Asia", "Europe", and "North America", as defined in the preceding paragraph.](/img/constraints_legal_values.png)

## Step 3: Add additional constraints {#step-3}

To add additional constraints:
1. Repeat [step one](#step-1 "step 1: open the constraints menu") to open the constraints menu.
2. Use the "Add constraint" button to add a new constraint.

    ![The add constraint modal menu with an existing constraint. There is a button labeled "add constraint" that is being highlighted by an arrow.](/img/constraints-add-additional.png)

3. Follow [step two](#step-2 "step 2: configure the constraint") for the new constraint.

## How to update existing constraints

You can update any existing constraint by doing one of the following:

- Open the "add constraints" menu and modify existing constraints.
- Using the constraint's "edit" button to bring up the constraints menu.
