---
title: How to create and assign custom project roles
---
:::info availability
Custom project roles were introduced in **Unleash 4.6** and are only available in Unleash Enterprise.
:::

This guide takes you through [how to create](#creating-custom-project-roles "how to create custom project roles") and [assign](#assigning-custom-project-roles "how to assign custom project roles") [custom project roles](../user_guide/rbac.md#custom-project-roles).

## Creating custom project roles

To create custom project roles:

1. Navigate to the custom project roles page by using the admin menu (the gear symbol) and navigating to users.
    ![A visual representation of the current step: the Unleash Admin UI with the steps highlighted.](/img/create-cpr-step-1.png)
2. Navigate to the "project roles" tab.
    ![The admin/roles screen, with the project roles tab highlighted. The page shows a table of project roles with their descriptions.](/img/create-cpr-step-2.png)
3. Use the "new project role" button to open the role creation form.
    ![The visual position of the 'new project role' button on the page.](/img/create-cpr-step-3.png)
4. Give the role a name, an optional description, and the set of permissions you'd like it to have. For a full overview of all the options, consult the [custom project roles reference documentation](../user_guide/rbac.md#custom-project-roles).
    ![The project role creation form filled in with details for a "developer" role. To the left is the equivalent cURL command you could run if you wanted to use the API instead of the form.](/img/create-cpr-step-4.png)

## Assigning custom project roles

To assign a custom project role to a user:
1. Navigate to the project you want to assign the user a role in.
    ![The steps to navigate to a project: use the 'projects' navigation item and select your project.](/img/assign-cpr-step-1.png)
2. Navigate to the project's _access_ page.
    ![A project overview with the 'access' tab highlighted.](/img/assign-cpr-step-2.png)
3. This step depends on whether the user has already been added to the project or not:
    - If the user has already been added to the project, select the new role you want to give them from the dropdown menu next to their name.
        ![A list of users with access to the current project. To the right of each user is a dropdown input labeled role.](/img/assign-cpr-step-3a.png)
    - If the user _hasn't_ been added to the project, add them via the 'add user' form. Select the role you want to give them from the role field.
        ![Adding a user to a project. The add user form is filled out with data for an "Alexis". The Role input is open and the custom "Developer" role is highlighted.](/img/assign-cpr-step-3b.png)
