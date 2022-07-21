---
title: How to create and manage user groups
---

:::info availability User groups are available to Unleash Enterprise users since **Unleash 4.14**. :::

This guide takes you through how use user groups to manage permissions on your projects. User groups allow you to manage large groups of users more easily than assigning roles directly to those users.

## Creating user groups

1. Navigate to groups by using the admin menu (the gear icon) and selecting the groups option.

![A visual representation of the current step: the Unleash Admin UI with the steps highlighted to navigate to groups.](/img/create-ug-step-1.png)

2. Navigate to new group

![A visual representation of the current step: the groups screen with the new group button highlighted.](/img/create-ug-step-2.png).

3. Give the group a name and an optional description and select the users you'd like to be in the group.

![A visual representation of the current step: the new group screen with the users drop down open and highlighted.](/img/create-ug-step-3.png).

4. Review the details of the group. Each group must contain at least one user with the Owner role, the owner(s) will have permissions to change group membership, so remember to include yourself if you want to manage this group later. If you're happy with the group details, click save. The group is now created.

![A visual representation of the current step: the new group screen with the users selected and the save button highlighted.](/img/create-ug-step-4.png).

## Managing users within a group

1. Navigate to groups by using the admin menu (the gear icon) and selecting the groups option.

![A visual representation of the current step: the Unleash Admin UI with the steps highlighted to navigate to groups.](/img/create-ug-step-1.png)

2. Click the card of the group you want to edit, you can click anywhere on the card.

![A visual representation of the current step: the manage groups with a pointer to a group card.](/img/edit-ug-step-2.png)

3. Remove users by clicking the bin icon.

![A visual representation of the current step: the manage group page with the remove user button highlighted.](/img/remove-user-from-group-step-1.png)

4. Confirm the remove

![A visual representation of the current step: the manage group page with the confirm user removal dialog shown.](/img/remove-user-from-group-step-2.png)

5. Add users by clicking the add button

![A visual representation of the current step: the groups page shown with the add user button highlighted.](/img/add-user-to-group-step-1.png)

6. Find the user you'd like to add to the group and click add

![A visual representation of the current step: the groups page shown with a user selected.](/img/add-user-to-group-step-2.png)

7. Assign the user a role in the group, every group needs to have at least one owner, and click save

![A visual representation of the current step: the groups page shown with the user role highlighted.](/img/add-user-to-group-step-3.png)

## Assigning groups to projects

1. Click projects

![A visual representation of the current step: the landing page with the projects navigation link highlighted.](/img/add-group-to-project-step-1.png)

2. Select the project you want to manage

![A visual representation of the current step: the projects page with a project highlighted.](/img/add-group-to-project-step-2.png)

3. Click the access tab and then click assign user/group (note that this is only for enterprise, otherwise this button will be called "assign user")

![A visual representation of the current step: steps to access.](/img/add-group-to-project-step-3.png)

4. Find your group in the drop down

5. Select the role that the group should have in this project, this role will be passed transitively to users in that group. You can review the list of permissions that the group users will gain by having this role. Note that groups never reduce permissions, so if the user is present in another group and that group has a role on the same project, the user may have more permissions than seen in the side pane.
