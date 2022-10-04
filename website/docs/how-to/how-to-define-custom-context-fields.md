---
title: How to define custom context fields
---

:::info Availability


Before Unleash 4.16, custom context fields were only available to Unleash Pro and Enterprise users. From 4.16 onwards, they're **available to everyone**. They were introduced in Unleash 3.2.28.

:::

This guide shows you how to create [custom context field for the Unleash Context](../user_guide/unleash-context.md#custom-context-fields). You can use custom context fields for [strategy constraints](../advanced/strategy-constraints.md) and for [custom stickiness calculations](../advanced/stickiness.md#custom-stickiness). If there are [standard Unleash Context fields](../user_guide/unleash-context.md#structure) missing from the context fields page, you can use the same steps to add them too.

## Step 1: Navigate to the context field creation form {#step-1-navigate-to-context-fields}

In the Unleash Admin UI, navigate to the _context fields_  page:
1. Click the "Configure" button in the top menu to open the configuration dropdown menu.
2. Click the "Context fields" menu item.

    ![A visual representation of the tutorial steps described in the preceding paragraph, showing the interaction points in the admin UI in order.](/img/context-fields.png)

3. On the context fields page, click the "add new context field" button.

    ![The "context fields" page with the "add new context field" button highlighted.]( /img/context-field-create-button.png)

## Step 2: Define the new context field {#step-2-define-new-context-field}

Define the custom context field by filling out the form. You must at least the field a unique _name_. Everything else is optional. Refer to the [custom context field reference guide](../user_guide/unleash-context.md#custom-context-fields) for a full overview of the parameters and their functions and requirements.

When you are satisfied with the context field's values, use the "create" button to submit the form and save the context field.

![A "create context field" form. It contains data for a custom context field called "region". Its description is "allows you to constrain on specific regions" and its legal values are "Africa", "Asia", "Europe", and "North America". Its custom stickiness value is not shown.](/img/new_context_field.png)
