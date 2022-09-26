---
id: rbac
title: Role-based Access control
---

This document forms the specifications for [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control) which was introduced as part of the **Unleash v4 release**.

## Core principles {#core-principles}

Unleash has two levels in its hierarchy of resources:

1. **Global resources** - Everything that lives across the entire Unleash instance. Examples of this include:
   - activation strategies
   - context field definitions
   - addon configurations
   - applications
   - users
2. **Project resources** - Resources which are only available under a project. Today this is only “feature toggles” (but we expect more resources to live under a project in the future). A feature toggle will belong to only one single project. In Unleash-Open source there exists only a single project, the “default” project, while Unleash Enterprise supports multiple projects.

![RBAC overview](/img/rbac.png)

Unleash v4 allows you control access to both global resources and individual project resources.

## Standard roles

Unleash comes with a set of built-in roles that you can use. The _global roles_ are available to all Unleash users, while the _project-based roles_ are only available to Pro and Enterprise users. The below table lists the roles, what they do, and what plans they are available in. Additionally, enterprise users can create their own [custom project roles](#custom-project-roles).

When you add a new user, you can assign them one of the global roles listed below.

| Role | Scope | Description | Availability |
| --- | --- | --- | --- |
| **Admin** | Global | Users with the global admin role have superuser access to Unleash and can perform any operation within the Unleash platform. | All versions |
| **Editor** | Global | Users with the editor role have access to most features in Unleash but can not manage users and roles in the global scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default. | All versions |
| **Viewer** | Global | Users with the viewer role can read global resources in Unleash. | All versions |
| **Owner** | Project | Users with this the project owner role have full control over the project, and can add and manage other users within the project context; manage feature toggles within the project; and control advanced project features like archiving and deleting the project. | Pro and Enterprise |
| **Member** | Project | Users with the project member role are allowed to view, create, and update feature toggles within a project, but have limited permissions in regards to managing the project's user access and can not archive or delete the project. | Pro and Enterprise |

## Custom Project Roles

:::info availability

Custom project roles were introduced in **Unleash 4.6** and are only available in Unleash Enterprise.

:::

Custom project roles let you define your own roles with a specific set of project permissions down to the environment level. The roles can then be assigned to users in specific projects. All users have viewer access to all projects and resources, but must be assigned a project role to be allowed to edit a project's resources. For a step-by-step walkthrough of how to create and assign custom project roles, see [_how to create and assign custom project roles_](../how-to/how-to-create-and-assign-custom-project-roles.md).

Each custom project role consists of:

- a **name** (required)
- a **role description** (optional)
- a set of **project permissions** (optional)
- a set of **environment permissions** (optional)

### Project permissions

You can assign the following project permissions. The permissions will be valid across all of the project's environments.

- **update the project**

  Lets the user update project settings, such as enabling/disabling environments, add users, etc.

- **delete the project**

  Lets the user delete the project.

- **create feature toggles within the project**

  Lets the user create feature toggles within the project and create variants for said toggle. Note that they **can not assign strategies** to toggles without having the _create activation strategy_ permission for the corresponding environment.

- **update feature toggles within the project**

  Lets the user update feature toggle descriptions; mark toggles as stale / not stale; add, update, and remove toggle tags; and update toggle variants within the project.

- **delete feature toggles within the project**

  Lets the user archive feature toggles within the project.

- **change feature toggle project**

  Lets the user move toggles to other projects they have access to.

- **create/edit variants**

  Lets the user create and edit variants within the project.

### Environment permissions

You can assign the following permissions on a per-environment level within the project:

- **create activation strategies**

  Lets the user assign feature toggle activation strategies within the environment.

- **update activation strategies**

  Lets the user update feature toggle activation strategies within the environment.

- **delete activation strategies**

  Lets the user delete feature toggle activation strategies within the environment.

- **enable/disable toggles**

  Lets the user enable and disable toggles within the environment.

## User Groups

:::info availability

User groups are available to Unleash Enterprise users since **Unleash 4.14**.

:::

User groups allow you to assign roles to a group of users within a project, rather than to a user directly. This allows you to manage your user permissions more easily when there's lots of users in the system. For a guide on how to create and manage user groups see [_how to create and manage user groups_](../how-to/how-to-create-and-manage-user-groups.md).

A user group consists of the following:

- a **name** (required)
- a **description** (optional)
- a list of users (optional)

Groups do nothing on their own. They must be given a role on a project to assign permissions. You can assign both standard roles and custom project roles to groups.

While a user can only have one role in a given project, a user may belong to multiple groups, and each of those groups may be given a role on a project. In the case where a given user is given permissions to a project through more than one group, the user will inherit most permissive permissions of all their groups in that project.
