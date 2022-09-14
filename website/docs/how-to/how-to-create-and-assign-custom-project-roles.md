---
title: How to create and assign custom project roles
---

import VideoContent from '@site/src/components/VideoContent.jsx'

:::info availability

Custom project roles were introduced in **Unleash 4.6** and are only available in Unleash Enterprise.

:::


This guide takes you through [how to create](#creating-custom-project-roles "how to create custom project roles") and [assign](#assigning-custom-project-roles "how to assign custom project roles") [custom project roles](../user_guide/rbac.md#custom-project-roles). Custom project roles allow you to fine-tune access rights and permissions within your projects.

<VideoContent videoUrls={["https://www.youtube.com/embed/2BlckVMHxgE" , "https://www.youtube.com/embed/IqaD8iGxkwk"]}>

The guides on this page are also available in video format! Does a minute or two of watching someone walk through the steps sound better to you than following steps with static screenshots? If so, check out these video walkthroughs instead 🍿

</VideoContent>

## Creating custom project roles

It takes about three steps to create custom project roles:

1. Navigate to the custom project roles page by using the admin menu (the gear symbol) and navigating to users.
    ![A visual representation of the current step: the Unleash Admin UI with the steps highlighted.](/img/create-cpr-step-1.png)
2. Navigate to the "Project roles" tab.
    ![The admin/roles screen, with the project roles tab highlighted. The page shows a table of project roles with their descriptions.](/img/create-cpr-step-2.png)
3. Use the "New project role" button to open the role creation form.
    ![The visual position of the 'new project role' button on the page.](/img/create-cpr-step-3.png)
4. Give the role a name, an optional description, and the set of permissions you'd like it to have. For a full overview of all the options, consult the [custom project roles reference documentation](../user_guide/rbac.md#custom-project-roles).
    ![The project role creation form filled in with details for a "developer" role. To the left is the equivalent cURL command you could run if you wanted to use the API instead of the form.](/img/create-cpr-step-4.png)

## Assigning custom project roles

Custom project role creation is a pretty straightforward process and requires around three steps, outlined below.

To assign a custom project role to a user:
1. Navigate to the project you want to assign the user a role in.
    ![The steps to navigate to a project: use the 'projects' navigation item and select your project.](/img/assign-cpr-step-1.png)
2. Navigate to the project's _access_ tab.
    ![A project overview with the 'access' tab highlighted.](/img/assign-cpr-step-2.png)
3. This step depends on whether the user has already been added to the project or not:
    - If the user has already been added to the project, click on the edit icon coresponding with its line and from the overlay that will show up select the new role you want to assign it from the dropdown and save the changes.
        ![A list of users with access to the current project. To the right of each user is a dropdown input labeled role.](/img/assign-cpr-step-3a.png)
    - If the user _hasn't_ been added to the project, add them using the button 'Assing user/group'. From the overlay that will show up select the user, assign it a role and save the changes. Now you should be able to see the new user in the table.
        ![Adding a user to a project. The add user form is filled out with data for an "Alexis". The Role input is open and the custom "Developer" role is highlighted.](/img/assign-cpr-step-3b.png)
