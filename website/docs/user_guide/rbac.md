---
id: rbac
title: Role-based Access control
---

This document forms the specifications for [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control) which was introduced as part of the **Unleash v4 release**.

### Core principles {#core-principles}

Unleash has two levels in it’s hierarchy of resources:

1. **Root resources** - Everything that lives across the entire Unleash instance. Examples of this includes:
   - activation strategies
   - context field definitions
   - addon configurations
   - applications
   - users
2. **Project resources** - Resources which are only available under a project. Today this is only “feature toggles” (but we expect more resources to live under a project in the future). A feature toggle will belong to only one single project. In Unleash-Open source there exists only a single project, the “default” project, while Unleash Enterprise supports multiple projects.

![RBAC overview](/img/rbac.png)

Unleash v4 allows you control access to both "root resources" and individual project resources.

### Root Roles {#root-roles}

> Available for Unleash Open-Source and Unleash Enterprise.

Unleash will come with three "root" role out of the box:

- **Admin** - Used to administer the Unleash instance. Is allowed to add/remove users, add them to roles and update role permissions.
- **Editor** - Represent users with typical read and write access to Unleash. They will typically be allowed to create new projects (for enterprise), create feature toggles on the "default" project, configure context fields etc. They will not be able to add/remove users or roles.
- **Viewer** - Users with this role are only allowed to read resources in Unleash. They might be added as collaborators to specific projects.

### Project {#project}

> Project roles are part of Unleash Enterprise.

Per project two roles are now available:

- **Owner** - Allowed to update the project. This includes adding and removing project members and their role.
- **Member** - Allowed to create and update feature toggles within the project. They can not update the project itself

It is important to highlight that we have not introduced a Viewer role on the project level. We believe that all users in Unleash should be able to to View all feature toggles and configuration within an organization. (If we learn this not to be the case we can add a separate role for READ access later).

### Custom Project Roles {#custom-roles}

:::info availability
Custom project roles were introduced in Unleash 4.5 and are only available in Unleash Enterprise.
:::

Custom project roles give you fine-grained control over permissions across your unleash instance. Roles are assigned on a **per-project basis** by default, but can also be further customized to differ between a project's environments.

By default, **every member of your organization is assigned the viewer** role. Users with this role can access all projects and see all feature toggles, strategies, etc., but cannot add, remove, or update anything.

These roles are available by default:
- role1
- role2

#### Creating your own roles


You can create your own custom roles if the default roles don't fulfill your needs. For a step-by-step walkthrough of how you create and assign custom roles, see the how-to guide.

When creating a custom role of your own, the available options are ...
