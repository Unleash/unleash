---
id: rbac
title: Role-based Access control
---

This document forms the specifications
for [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control) (RBAC) which was introduced as part of
the **Unleash v4 release**.

## Core principles {#core-principles}

Unleash has two levels in its hierarchy of resources:

1. **Root resources** - Everything that lives across the entire Unleash instance. Examples of this include:
    - activation strategies
    - context field definitions
    - integration configurations
    - applications
    - users
2. **Project resources** - Resources which are only available under a project. Today this is only “feature flags” (but
   we expect more resources to live under a project in the future). A feature flag will belong to only one single
   project. In Unleash-Open source there exists only a single project, the “default” project, while Unleash Enterprise
   supports multiple projects.

![RBAC overview](/img/rbac.png)

Unleash v4 allows you control access to both root resources and individual project resources.

## Predefined roles

Unleash comes with a set of built-in predefined roles that you can use. The _root roles_ are available to all Unleash
users, while the _project-based roles_ are only available to Pro and Enterprise users. The below table lists the roles,
what they do, and what plans they are available in. Additionally, Enterprise users can create their
own [custom root roles](#custom-root-roles) and [custom project roles](#custom-project-roles).

When you add a new user, you can assign them one of the root roles listed below.

| Role       | Scope   | Description                                                                                                                                                                                                                                                                                                                                                         | Availability       |
|------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| **Admin**  | Root    | Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform.                                                                                                                                                                                                                                          | All versions       |
| **Editor** | Root    | Users with the root editor role have access to most features in Unleash, but can not manage users and roles in the root scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default. | All versions       |
| **Viewer** | Root    | Users with the root viewer role can only read root resources in Unleash. Viewers can be added to specific projects as project members. Users with the viewer role may not view API tokens.                                                                                                                                                                          | All versions       |
| **Owner**  | Project | Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature flags within the project, and control advanced project features like archiving and deleting the project.                                                                                                      | Pro and Enterprise |
| **Member** | Project | Users with the project member role are allowed to view, create, and update feature flags within a project, but have limited permissions in regards to managing the project's user access and can not archive or delete the project.                                                                                                                               | Pro and Enterprise |

## Custom Root Roles

:::info availability

Custom root roles were introduced in **Unleash 5.4** and are only available in Unleash Enterprise.

:::

Custom root roles let you define your own root roles with a specific set of root permissions. The roles can then be
assigned to entities (users, service accounts and groups) at the root level. This allows you to control access to
resources in a more precise, fine-grained way. For a step-by-step walkthrough of how to create and assign custom root
roles, refer to [_how to create and assign custom root roles_](../how-to/how-to-create-and-assign-custom-root-roles.md).

Each custom root role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **root permissions** (required)

### Root permissions

You can assign the following root permissions:

#### Integration permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Create integrations | Lets the user create integrations. |
| Update integrations | Lets the user update integrations. |
| Delete integrations | Lets the user delete integrations. |

#### API token permissions

| Permission Name            | Description                               |
|----------------------------|-------------------------------------------|
| Read frontend API tokens   | Lets the user read frontend API tokens.   |
| Create frontend API tokens | Lets the user create frontend API tokens. |
| Update frontend API tokens | Lets the user update frontend API tokens. |
| Delete frontend API tokens | Lets the user delete frontend API tokens. |
| Read client API tokens     | Lets the user read client API tokens.     |
| Create client API tokens   | Lets the user create client API tokens.   |
| Update client API tokens   | Lets the user update client API tokens.   |
| Delete client API tokens   | Lets the user delete client API tokens.   |

#### Application permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Update applications | Lets the user update applications. |

#### Context field permissions

| Permission Name       | Description                          |
|-----------------------|--------------------------------------|
| Create context fields | Lets the user create context fields. |
| Update context fields | Lets the user update context fields. |
| Delete context fields | Lets the user delete context fields. |

#### Project permissions

| Permission Name | Description                    |
|-----------------|--------------------------------|
| Create projects | Lets the user create projects. |

#### Role permissions

| Permission Name | Description               |
|-----------------|---------------------------|
| Read roles      | Lets the user read roles. |

#### Segment permissions

| Permission Name | Description                    |
|-----------------|--------------------------------|
| Create segments | Lets the user create segments. |
| Edit segments   | Lets the user edit segments.   |
| Delete segments | Lets the user delete segments. |

#### Strategy permissions

| Permission Name   | Description                      |
|-------------------|----------------------------------|
| Create strategies | Lets the user create strategies. |
| Update strategies | Lets the user update strategies. |
| Delete strategies | Lets the user delete strategies. |

#### Tag type permissions

| Permission Name  | Description                     |
|------------------|---------------------------------|
| Update tag types | Lets the user update tag types. |
| Delete tag types | Lets the user delete tag types. |

## Custom Project Roles

:::info availability

Custom project roles were introduced in **Unleash 4.6** and are only available in Unleash Enterprise.

:::

Custom project roles let you define your own project roles with a specific set of project permissions down to the
environment level. The roles can then be assigned to users in specific projects. All users have viewer access to all
projects and resources, but must be assigned a project role to be allowed to edit a project's resources. For a
step-by-step walkthrough of how to create and assign custom project roles, see [_how to create and assign custom project
roles_](../how-to/how-to-create-and-assign-custom-project-roles.md).

Each custom project role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **project and / or environment permissions** (required)

### Project permissions

You can assign the following project permissions. The permissions will be valid across all of the project's
environments.

| Permission                                    | Description                                                                                                                                                                                                                                       |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **update the project**                        | Lets the user update project settings, such as enabling/disabling environments, add users, etc.                                                                                                                                                   |
| **user access read**                          | Read access to Project User Access (included in "update the project" permission)                                                                                                                                                                  |
| **user access write**                         | Write access to Project User Access (included in "update the project" permission)                                                                                                                                                                 
| **default strategy read**                     | Read access to default strategy configuration (included in "update the project" permission)                                                                                                                                                       |
| **default strategy write**                    | Write access to default strategy configuration (included in "update the project" permission)                                                                                                                                                      |                    
| **change request read**                       | Read access to change request configuration (included in "update the project" permission)                                                                                                                                                         |                                                                                                                                                                                                                                              
| **change request write**                      | Write access to change request configuration (included in "update the project" permission)                                                                                                                                                        |                      
| **settings read**                             | Read access to other project settings (included in "update the project" permission) |                                                                                                                                                              |                             
| **settings write** | Write access to other project settings (included in "update the project" permission)                            
| **delete the project**                        | Lets the user delete the project.                                                                                                                                                                                                                 |
| **create feature flags within the project** | Lets the user create feature flags within the project and create variants for said flag. Note that they **cannot assign strategies** to flags without having the _create activation strategy_ permission for the corresponding environment. |
| **update feature flags within the project** | Lets the user update feature flag descriptions; mark flags as stale / not stale; add, update, and remove flag tags; and update flag variants within the project.                                                                          |
| **delete feature flags within the project** | Lets the user archive feature flags within the project.                                                                                                                                                                                         |
| **change feature flag project**             | Lets the user move flags to other projects they have access to.                                                                                                                                                                                 |
| **create/edit variants**                      | Lets the user create and edit variants within the project. (Deprecated with v4.21 in favor of environment-specific permissions for working with variants[^1].)                                                                                    |

### Environment permissions

You can assign the following permissions on a per-environment level within the project:

| Permission                       | Description                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **create activation strategies** | Lets the user assign feature flag activation strategies within the environment.                                                                                                                                                                                                                                                                       |
| **update activation strategies** | Lets the user update feature flag activation strategies within the environment.                                                                                                                                                                                                                                                                       |
| **delete activation strategies** | Lets the user delete feature flag activation strategies within the environment.                                                                                                                                                                                                                                                                       |
| **enable/disable flags**         | Lets the user enable and disable flags within the environment.                                                                                                                                                                                                                                                                                        |
| **update variants**              | Lets the user create, edit and remove variants within the environment.                                                                                                                                                                                                                                                                                |
| **approve a change request**     | Lets the user approve [change requests](change-requests.md) in the environment.                                                                                                                                                                                                                                                                       |
| **apply a change request**       | Lets the user apply change requests in the environment.                                                                                                                                                                                                                                                                                               |
| **skip change requests**         | Lets the user ignore change request requirements. This applies **only when using the API** directly; when using the admin UI, users with this permission will still need to go through the normal change request flow. You can find more details in the section on [circumventing change requests](change-requests.md#circumventing-change-requests). |

## Multiple Project Roles

:::info availability

Multiple project roles is an enterprise feature available from **Unleash 5.6** onwards.

:::

Multiple project roles allow you to assign multiple project roles to a user or group within a project. By doing so, you
can effectively merge the permissions associated with each role, resulting in a comprehensive set of permissions for the
user or group in question. This ensures that individuals or teams have all the access they require to complete their
tasks, as the system will automatically grant the most permissive rights from the combination of assigned roles.

This multi-role assignment feature can be particularly beneficial in complex projects with dynamic teams where a user or
group needs to wear multiple hats. For example, a team member could serve as both a developer and a quality assurance
tester. By combining roles, you simplify the access management process, eliminating the need to create a new, custom
role that encapsulates the needed permissions.

## User Groups

:::info availability

User groups are available to Unleash Enterprise users since **Unleash 4.14**. Root role groups are planned to be
released in **Unleash 5.1**.

:::

User groups allow you to assign roles to a group of users within a project, rather than to a user directly. This allows
you to manage your user permissions more easily when there's lots of users in the system. For a guide on how to create
and manage user groups see [_how to create and manage user groups_](../how-to/how-to-create-and-manage-user-groups.md).

A user group consists of the following:

- a **name** (required)
- a **description** (optional)
- a **list of users** (required)
- a list of SSO groups to sync from (optional)
- a root role associated with the group (optional) (only available in **Unleash 5.1** and later)

Groups do nothing on their own. They must either be given a root role directly or a role on a project to assign
permissions.

Groups that do not have a root role need to be assigned a role on a project to be useful. You can assign both predefined
roles and custom project roles to groups.

Any user that is a member of a group with a root role will inherit that root role's permissions on the root level.

While a user can only have one role in a given project, a user may belong to multiple groups, and each of those groups
may be given a role on a project. In the case where a given user is given permissions through more than one group, the
user will inherit most permissive permissions of all their groups in that project.

## User Group SSO Integration

:::info availability

User group syncing is planned to be released in Unleash 4.18 and will be available for Enterprise customers.

:::

User groups also support integration with your Single Sign-On (SSO) provider. This allows you to automatically assign
users to groups when they log in through SSO. Check out [_how to set up group SSO
sync_](../how-to/how-to-set-up-group-sso-sync.md) for a step-by-step walkthrough.

Users that have been added to a group through your SSO provider will be automatically removed next time they log in if
they've been removed from the SSO group. Users that have been manually added to the group will not be affected.

To enable group sync, you'll need to set two fields in your SSO provider configuration options:

- **enable group syncing**:

  Turns on group syncing. This is disabled by default.

- **group field JSON path**

  A JSON path that should point to the groups field in your token response. This should match the exact field returned
  by the provider. For example, if your token looks like this:

  ```json
  {

    "iss": "https://some-url.com",
    "azp": "1234987819200.apps.some-url.com",
    "aud": "1234987819200.apps.some-url.com",
    "sub": "10769150350006150715113082367",
    "at_hash": "HK6E_P6Dh8Y93mRNtsDB1Q",
    "hd": "example.com",
    "email": "jsmith@example.com",
    "email_verified": "true",
    "groups": ["test-group", "test-group-2"], //the field where groups are specified
    "iat": 1353601026,
    "exp": 1353604926,
    "nonce": "0394852-3190485-2490358"
  }
  ```
  You need to set the "Group Field JSON path" to "groups".

Once you've enabled group syncing and set an appropriate path, you'll need to add the SSO group names to the Unleash
group. This can be done by navigating to the Unleash group you want to enable sync for and adding the SSO group names to
the "SSO group ID/name" property.

[^1]: The project-level permission is still required for the [**create/overwrite variants
** (PUT)](/docs/reference/api/unleash/overwrite-feature-variants.api.mdx) and [**update variants
** (PATCH)](/docs/reference/api/unleash/patch-feature-variants.api.mdx) API endpoints, but it is not used for anything
within the admin UI. The API endpoints have been superseded by the [**create/overwrite environment variants
** (PUT)](/docs/reference/api/unleash/overwrite-feature-variants-on-environments.api.mdx) and [**update environment
variants** (PATCH)](/docs/reference/api/unleash/patch-environments-feature-variants.api.mdx) endpoints, respectively.
