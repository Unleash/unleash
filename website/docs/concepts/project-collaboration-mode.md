---
title: Project collaboration mode
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.22+`

:::

## Overview

Project collaboration modes allow you to manage project visibility and interaction levels, ensuring better control and collaboration within your organization.

The collaboration mode of a [project](/concepts/projects) defines who within your Unleash instance can access the project. This setting also determines who can submit [change requests](/concepts/change-requests)–a feature that provides controlled and secure updates for feature flags.

Unleash supports three collaboration modes: **open**, **protected**, and **private**. A user's [predefined root and project roles](/concepts/rbac#predefined-roles), as well as their [custom root roles](/concepts/rbac#custom-root-roles), determine what projects they can access.

### Open collaboration mode

All users of your Unleash instance can view the project and submit change requests. This is the default collaboration mode.


### Protected collaboration mode

All users of your Unleash instance can view the project but only project Members and Admins can submit change requests.


### Private collaboration mode

Only project Members, Admins, Editors, and users with any [custom root role](/concepts/rbac#custom-root-roles) can view the project. Viewers, who are not project Members, can't see the project in the project list. Only project Members and Admins can submit change requests. 

To grant users visibility into private projects through a custom root role, you must assign the role directly to the user rather than through a [user group](/concepts/rbac#user-groups).


|           | View project                                                                                    | Submit change requests     |
|-----------|-------------------------------------------------------------------------------------------------|----------------------------|
| Open      | All users                                                                                       | All users                  |
| Protected | All users                                                                                       | Project Members and Admins |
| Private   | Project Members, Admins, Editors, and users with any [custom root role](/concepts/rbac#custom-root-roles) assigned directly (not through a user group) | Project Members and Admins |

## Set project collaboration mode

To [create a new project](/concepts/projects#create-a-project) with a specific collaboration mode, do the following:
1. In the Unleash Admin UI, go to **Projects** > **New project**.
2. Enter **Project name**.
3. Click **Open** to choose your collaboration mode.
4. Click **Create project**.

### Modify project collaboration mode

To modify the collaboration mode of an existing project, do the following:
1. In the Unleash Admin UI, go to **Projects** and select the project you want to modify.
2. Go to **Project settings > Enterprise settings** and use the **Project collaboration mode** list to update your collaboration mode.
3. Click **Save changes**.

#### Change collaboration mode to protected

When you change the collaboration mode of an existing project to protected, all users who do not have sufficient permissions lose the ability to create new change requests. Existing change requests remain in place. Users with insufficient permissions can still cancel their change requests but can no longer update them.

#### Change collaboration mode to private

When you change the collaboration mode of an existing project to private, all users who do not have [sufficient permissions](#private-collaboration-mode) lose access to the project, including their existing change requests.

### Migrate existing projects

When upgrading Unleash to version `4.22.0` or later, all migrated projects get the open collaboration mode by default. See [Modify project collaboration mode](#modify-project-collaboration-mode) for instructions on changing the collaboration mode of an existing project.