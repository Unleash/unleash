---
title: How to add strategy constraints
---

:::note Availability

**Version**: `4.16+`

:::

This guide shows you how to add [strategy constraints](../reference/strategy-constraints) to your feature flags using the Admin UI. For information on how to interact with strategy constraints from an [Unleash client SDK](../reference/sdks), visit the specific SDK's documentation or see [the relevant section in the strategy constraints documentation](../reference/strategy-constraints#sdks).

## Prerequisites

You'll need to have an existing feature flag with a defined strategy to add a constraint. The rest of this guide assumes you have a specific strategy that you're working with.

## Step 1: Open the constraints menu {#step-1}

On the strategy you're working with, find and select the "edit strategy" button.

![A feature flag with one strategy. The "edit strategy" button is highlighted.](/img/create-toggle-edit-strategy.png)

On the "edit strategy" screen, select the "add constraint" button to open the constraints menu.

![A feature flag strategy view showing a button labeled with add constraints.](/img/add-constraint.png)

## Step 2: Add and configure the constraint {#step-2}

Refer to [the _constraint structure_ section of the strategy constraints reference](../reference/strategy-constraints#constraint-structure) for a thorough explanation of the constraint fields.

1. From the "Context Field" dropdown, **select the context field** you would like to constrain the strategy on and **choose the [constraint operator](../reference/strategy-constraints#strategy-constraint-operators)** you want.
2. **Define the values** to use for this constraint. The operator you selected decides whether you can define one or multiple values and what format they can have.
3. **Save the constraint** first.

![A strategy constraint form with a constraint set to "useid". The "values" input is a text input containing the values "41", "932", "822".](/img/constraints-add-to-strategy.png)

## Step 3: Save the strategy {#step-3}

![A feature flag strategy view showing a button at the end of the form labeled with save strategy.](/img/constraints-save-strategy.png)

## How to update existing constraints

To update an existing constraint, find the constraint in the "edit strategy" screen and use the constraint's "edit" button.

![A strategy form showing an existing constraint with existing values and 2 buttons, the "edit" button is highlighted.](/img/constraints-edit.png)
