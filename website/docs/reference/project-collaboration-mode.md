---
title: Project Collaboration Mode
---

:::note Availability

**Plan**: Enterprise
**Version**: 4.22+

:::

Project collaboration modes allow you to manage project visibility and interaction levels, ensuring better control and collaboration within your organization.

# Overview

The collaboration mode of a [project](../reference/projects.md) defines who within your Unleash instance can access the project. This setting also determines who can submit [change requests](../reference/change-requests.md)–a feature that provides controlled and secure updates for feature toggles.

Unleash supports three collaboration modes: **open**, **protected**, and **private**. Each mode is designed with different user roles and permissions in mind, catering to various security and collaboration requirements. Let’s explore how the three modes work.

## Open collaboration mode

All users of your Unleash instance can access the project and submit change requests. This is the default collaboration mode.


## Protected collaboration mode

All users of your Unleash instance can access the project but only admins and project members can submit change requests.


## Private collaboration mode

All project members can access the project and submit change requests. Outside of project members, only admins, editors, and users with [custom root roles](../how-to/how-to-create-and-assign-custom-root-roles.md) can access the project and submit change requests.


|           | View project    | Submit change requests                                             |   |   |
|-----------|-----------------|--------------------------------------------------------------------|---|---|
| Open      | All users       | All users                                                          |   |   |
| Protected | All users       | Project Members, Admins, Editors, and users with [custom root roles](../how-to/how-to-create-and-assign-custom-root-roles.md) |   |   |
| Private   | Project members | Project Members, Admins, Editors, and users with [custom root roles](../how-to/how-to-create-and-assign-custom-root-roles.md) |   |   |

# Set project collaboration mode

To [create a new project](../reference/projects.md#creating-a-new-project) with a specific collaboration mode, do the following:
1. In the Unleash Admin UI, go to **Projects** > **New project**.
2. Enter **Project name**.
3. Click **open** to choose your collaboration mode.
4. Click **Create project**.

## Modify project collaboration mode

To modify the collaboration mode of an existing project, do the following:
1. In the Unleash Admin UI, go to **Projects** and select the project you want to modify.
2. Go to **Project settings > Enterprise settings** and use the **Project collaboration mode** list to update your collaboration mode.
3. Click **Save changes**.

### Change collaboration mode to protected

When you change the collaboration mode of an existing project to protected, all users who do not have sufficient permissions lose the ability to create new change requests. Existing change requests remain in place. Users with insufficient permissions can still cancel their change requests but can no longer update them.

### Change collaboration mode to private

When you change the collaboration mode of an existing project to private, all users who do not have [sufficient permissions](#private-collaboration-mode) lose access to the project, including their existing change requests.

## Migrate existing projects

When upgrading Unleash to version 4.22.0 or later, all migrated projects get the open collaboration mode by default. Go to [Modify project collaboration mode](#modify-project-collaboration-mode) for steps on how to change the collaboration mode of an existing project.
