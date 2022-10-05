---
title: How to add strategy constraints
---

:::info Availability

Before Unleash 4.16, strategy constraints were only available to Unleash Pro and Enterprise users. From 4.16 onwards, they're **available to everyone**.

:::

This guide shows you how to add [strategy constraints](../advanced/strategy-constraints.md) to your feature toggles via the admin UI. For information on how to interact with strategy constraints from an [Unleash client SDK](../sdks/index.md), visit the specific SDKs documentation or see [the relevant section in the strategy constraints documentation](../advanced/strategy-constraints.md#sdks 'strategy constraints documentation, section on interacting with constraints from client SDKs').

## Prerequisites

You'll need to have an existing feature toggle with a defined strategy to add a constraint. The rest of this guide assumes you have a specific strategy that you're working with.

## Step 1: Open the constraints menu {#step-1}

On the strategy you're working with, find and select the "edit strategy" button.

![A feature toggle with one strategy. The "edit strategy" button is highlighted.](/img/create-toggle-edit-strategy.png)

On the "edit strategy" screen, select the "add constraint" button to open the constraints menu.

![A feature toggle strategy view showing a button labeled with add constraints.](/img/add-constraint.png)

## Step 2: Add and configure the constraint {#step-2}

Refer to [the _constraint structure_ section of the strategy constraints reference](../advanced/strategy-constraints.md#constraint-structure) for a thorough explanation of the constraint fields.

1. From the "Context Field" dropdown, **select the context field** you would like to constrain the strategy on and **choose the [constraint operator](../advanced/strategy-constraints.md#strategy-constraint-operators)** you want.
2. **Define the values** to use for this constraint. The operator you selected decides whether you can define one or multiple values and what format they can have.
3. **Save the constraint** first, and then **save the strategy**.

![A strategy constraint form with a constraint set to "region". The "values" input is a dropdown menu containing the options "Africa", "Asia", "Europe", and "North America", as defined in the preceding paragraph.](/img/constraints-add-to-strategy.png)

## How to update existing constraints

To update an existing constraint, find the constraint in the "edit strategy" screen and use the constraint's "edit" button.
