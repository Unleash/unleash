---
title: How to add strategy constraints
---

:::info Availability 

Strategy constraints are available to Unleash Pro and Enterprise users. 

:::

This guide shows you how to add [strategy constraints](../advanced/strategy-constraints.md) to your feature toggles via the admin UI. For information on how to interact with strategy constraints from an [Unleash client SDK](../sdks/index.md), visit the specific SDKs documentation or see [the relevant section in the strategy constraints documentation](../advanced/strategy-constraints.md#sdks 'strategy constraints documentation, section on interacting with constraints from client SDKs').

## Prerequisites

You'll need to have an existing feature toggle with a defined strategy to add a constraint. The rest of this guide assumes you have a specific strategy that you're working with.
@Thomas you need to review all the text from bellow - maybe we need to add one more image to show how that to get to these screens you need to edit strategy?
## Step 1: Open the constraints menu {#step-1}

When you edit a strategy you will see the button labeled "Add custom constraint". Pressing the button you will see the options to create a constraint.

![A feature toggle strategy view showing a button labeled with add constraints.](/img/add-constraint.png)

## Step 2: Configure the constraint {#step-2}

Refer to [the _constraint structure_ section of the strategy constraints reference](../advanced/strategy-constraints.md#constraint-structure) for a thorough explanation of the fields.

Step 1: From the "Context Field" dropdown, select the context field you would like to constrain the strategy on and choose the operator you need.
Step 2: Based on the context field you selected above you can now define the values for this constraint
Step 3: You need to save this constraint before to save the strategy 

![A strategy constraint form with a constraint set to "region". The "values" input is a dropdown menu containing the options "Africa", "Asia", "Europe", and "North America", as defined in the preceding paragraph.](/img/constraints-add-to-strategy.png)

## Step 3: Add additional constraints {#step-3}

To add additional constraints:

1. Repeat [step one](#step-1 'step 1: open the constraints menu') to edit a strategy and to see the option to add a custom constraint.
2. Use the "Add custom constraint" button to add a new constraint.

   ![The add constraint modal menu with an existing constraint. There is a button labeled "add constraint" that is being highlighted by an arrow.](/img/constraints-add-additional.png)

3. Follow [step two](#step-2 'step 2: configure the constraint') for the new constraint.

## How to update existing constraints

You can update any existing constraint by doing one of the following:

- Edit the strategy that has the constraint you want to update and then using the constraint's "edit" button you see all the options availabe to edit that constraint.
