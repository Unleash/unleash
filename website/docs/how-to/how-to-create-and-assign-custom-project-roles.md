---
title: How to create and assign custom project roles
---
:::info availability
Custom project roles were introduced in **Unleash 4.6** and are only available in Unleash Enterprise.
:::

This guide takes you through [how to create](#creating-custom-project-roles "how to create custom project roles") and [assign](#assigning-custom-project-roles "how to assign custom project roles") [custom project roles](../user_guide/rbac.md#custom-project-roles). Custom project roles are scoped to projects.

## Creating custom project roles

To create custom project roles follow the steps below:
1. Navigate to the custom project roles page (at `/admin/roles`) by clicking ... [fill in steps!]
2. Use the "new project role" button to open the role creation form
3. Give the role a name, an optional description, and the set of permissions you'd like it to have. For a full overview of all the options, consult the [custom project roles reference documentation](../user_guide/rbac.md#custom-project-roles).

## Assigning custom project roles

To assign a custom project role to a user, follow these steps in the project you want the role to be applied in.
1. Navigate to the project's access page
2. This step depends on whether the user has already been added to the project or not:
    - If the user you want to give the role isn't already in the list of users, add them via the 'add user' form. Select the role you want to give them from the role field.
    - If the user has already been added to the project, select the desired role from the dropdown.
