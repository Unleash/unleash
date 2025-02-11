---
id: rbac
title: Role-based Access Control
---

:::note Availability

**Version**: `4.0+`

:::

Unleash implements role-based access control on two levels:

1. **Root level** - affects resources shared across the entire Unleash instance, for example activation strategies, users, integrations.
2. **Project level** - affects resources specific to a [project](./projects), such as feature flags, change requests, or API tokens.

![RBAC overview](/img/rbac.png)

## Predefined roles

Unleash comes with a set of predefined roles. Root roles are available to all Unleash
users, while the Project roles are only available to [Pro](/availability#plans) and [Enterprise](https://www.getunleash.io/pricing) users. The following table lists the roles, what they do, and what plans they are available in. Additionally, [Enterprise](https://www.getunleash.io/pricing) users can create their
own [custom root roles](#custom-root-roles) and [custom project roles](#custom-project-roles).

| Role       | Scope   | Description                                                                                                                                                                                                                                                                                                                                                         | Availability       |
|------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| **Admin**  | Root    | Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform.                                                                                                                                                                                                                                          | All versions       |
| **Editor** | Root    | Users with the root editor role have access to most features in Unleash, but they cannot manage users and roles in the root scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default. | All versions       |
| **Viewer** | Root    | Users with the root viewer role can only read root resources in Unleash. Viewers can be added to specific projects as project members. Users with the viewer role may not view API tokens.                                                                                                                                                                          | All versions       |
| **Owner**  | Project | Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature flags within the project, and control advanced project features like archiving and deleting the project.                                                                                                      | [Pro](/availability#plans) and [Enterprise](https://www.getunleash.io/pricing) |
| **Member** | Project | Users with the project member role are allowed to view, create, and update feature flags within a project, but have limited permissions in regards to managing the project's user access and can not archive or delete the project.                                                                                                                               | [Pro](/availability#plans) and [Enterprise](https://www.getunleash.io/pricing) |

## Custom root roles

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `5.4+`

:::

Custom root roles let you define your own root roles with a specific set of root permissions. The roles can then be
assigned to entities (users, service accounts, and groups) at the root level. This allows you to control access to
resources in a more precise, fine-grained way. For a step-by-step walkthrough of how to create and assign custom root
roles, refer to [_how to create and assign custom root roles_](../how-to/how-to-create-and-assign-custom-root-roles.md).

Each custom root role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **root permissions** (required)

### Root permissions

You can assign the following root permissions:

#### API token permissions

| Permission Name            | Description                               |
|----------------------------|-------------------------------------------|
| Read frontend API tokens   | View [frontend API tokens](./api-tokens-and-client-keys#frontend-tokens).   |
| Create frontend API tokens | Create frontend API tokens. |
| Update frontend API tokens | Update frontend API tokens. |
| Delete frontend API tokens | Delete frontend API tokens. |
| Read client API tokens     | View [client API tokens](./api-tokens-and-client-keys#client-tokens).     |
| Create client API tokens   | Create client API tokens.   |
| Update client API tokens   | Update client API tokens.   |
| Delete client API tokens   | Delete client API tokens.   |

#### Application permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Update applications | Update [applications](./applications). |

#### Authentication permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Change authentication settings | Update authentication settings, such as for [single sign-on (SSO)](./sso). |

#### Context field permissions

| Permission Name       | Description                          |
|-----------------------|--------------------------------------|
| Create context fields | Create [context fields](./unleash-context#custom-context-fields). |
| Update context fields | Update context fields. |
| Delete context fields | Delete context fields. |

#### Instance maintenance permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Change instance banners | Change instance [banners](./banners). |
| Change maintenance mode state | Change [maintenance mode](./maintenance-mode) state. |
| Update CORS settings | Update [CORS settings](./front-end-api#cors). |
| Read instance logs and login history | Read instance logs and [login history](./login-history.md). |

#### Integration permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Create integrations | Create [integrations](./integrations). |
| Update integrations | Update integrations. |
| Delete integrations | Delete integrations. |

#### Project permissions

| Permission Name | Description                    |
|-----------------|--------------------------------|
| Create projects | Create [projects](./projects). |

#### Role permissions

| Permission Name | Description               |
|-----------------|---------------------------|
| Read roles      | View [roles](./rbac). |

#### Segment permissions

| Permission Name | Description                    |
|-----------------|--------------------------------|
| Create segments | Create [segments](./segments). |
| Edit segments   | Edit segments.   |
| Delete segments | Delete segments. |

#### Strategy permissions

| Permission Name   | Description                      |
|-------------------|----------------------------------|
| Create strategies | Create [strategies](./activation-strategies). |
| Update strategies | Update strategies. |
| Delete strategies | Delete strategies. |

#### Tag type permissions

| Permission Name  | Description                     |
|------------------|---------------------------------|
| Update tag types | Update [tag types](./feature-toggles#tags). |
| Delete tag types | Delete tag types. |

## Custom project roles

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.6+`

:::

Custom project roles let you define your own project roles with a specific set of project permissions down to the
environment level. The roles can then be assigned to users in specific projects. All users have viewer access to all
projects and resources but must be assigned a project role to be allowed to edit a project's resources. For a
step-by-step walkthrough of how to create and assign custom project roles, see [_how to create and assign custom project
roles_](../how-to/how-to-create-and-assign-custom-project-roles).

Each custom project role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **project and environment permissions** (required)

### Project permissions

You can assign the following project permissions. These permissions are valid across all of the [project](./projects)'s
environments.

#### API tokens
| Permission Name | Description |
| --- | --- |
| Read API token | View [API tokens](./api-tokens-and-client-keys) for a specific project. |
| Create API token | Create API tokens for a specific project. |
| Delete API token | Delete API tokens for a specific project. |

#### Change requests
| Permission Name | Description |
| --- | --- |
| Read change request                      | View [change request](./change-requests) configuration (included in _Update the project_).                                                                                                                                                         |
| Write change request                      | Edit change request configuration (included in _Update the project_).                                                                                                                                                      |  


#### Features and strategies
| Permission Name | Description | 
| --- | --- |
| Create feature flags | Create [feature flags](./feature-toggles) within the project and create feature flag variants. This permission alone does not give access to assigning strategies to a flags. Use the _create activation strategies_ environment permission, if needed. |
| Update feature flags | Update feature flag descriptions, mark flags as stale, add, update, and remove flag tags, and update flag variants within the project.                                                                          |
| Update feature flag dependency | Update feature flag dependencies within the project. |
| Delete feature flags | Archive feature flags within the project.                                                                                                                                                                                         |
| Change feature flag project            | Move flags to other projects they have access to.                                                                                                                                                                                 |
| Create/edit variants                      | Create and edit [variants](./strategy-variants) within the project. (Deprecated with v4.21. Use environment-specific permissions for working with variants.)                                                                                    |
| Create/edit project segment | Create and edit [segments](./segments) within the project. |

#### Projects
| Permission Name                                   | Description                                                                                                                                                                                                                                       |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Update project                        | Edit all aspects of a [project](./projects), such as enabling or disabling environment or adding new users. |
| User access read                          | View to user access configuration (included in _Update project_).                                                                                                                                                                  |
| User access write                         | Edit user access configuration (included in _Update project_).                                                                                                                                                                
| Default strategy read                     | View the default strategy configuration (included in _Update project_).                                                                                                                                                       |
| Default strategy write                    | Edit the default strategy configuration (included in _Update project_).                                                                                                                                                      |                           
| Read settings                             | View other project settings (included in _Update project_). |                                                                                                                                                              |                             
| Write settings | Edit other project settings (included in _Update project_).                            
| Delete the project                        | Delete the project.                                                                                                                                                                                                                 |
### Environment permissions

You can assign the following permissions on a per-environment level within the project:

| Permission Name                       | Description                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Create activation strategies | Assign feature flag [activation strategies](./activation-strategies) within the environment.                                                                                                                                                                                                                                                                       |
| Update activation strategies | Update feature flag activation strategies within the environment.                                                                                                                                                                                                                                                                       |
| Delete activation strategies | Delete feature flag activation strategies within the environment.                                                                                                                                                                                                                                                                       |
| Enable/disable flags         | Enable and disable flags within the environment.                                                                                                                                                                                                                                                                                        |
| Update variants              | Create, edit, and remove variants within the environment.                                                                                                                                                                                                                                                                                |
| Approve a change request     | Approve [change requests](./change-requests) in the environment.                                                                                                                                                                                                                                                                       |
| Apply a change request       | Apply change requests in the environment.                                                                                                                                                                                                                                                                                               |
| Skip change requests         | Skip the change request process for a project and environment where change requests are enabled.  |

## Multiple project roles

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `5.6+`

:::

Multiple project roles allow you to assign multiple project roles to a user or group within a project. By doing so, you
can effectively merge the permissions associated with each role, resulting in a comprehensive set of permissions for the
user or group in question. This ensures that individuals or teams have all the access they require to complete their
tasks, as the system will automatically grant the most permissive rights from the combination of assigned roles.

This multi-role assignment feature can be particularly beneficial in complex projects with dynamic teams where a user or
group needs to wear multiple hats. For example, a team member could serve as both a developer and a quality assurance
tester. By combining roles, you simplify the access management process, eliminating the need to create a new, custom
role that encapsulates the needed permissions.

## User groups

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.14+`

:::

User groups allow you to assign roles to a group of users within a project, rather than to a user directly. This allows
you to manage your user permissions more easily when there's lots of users in the system. For a guide on how to create
and manage user groups see [_how to create and manage user groups_](../how-to/how-to-create-and-manage-user-groups.md).

A user group consists of the following:

- a **name** (required)
- a **description** (optional)
- a **list of users** (required)
- a list of SSO groups to sync from (optional)
- a root role associated with the group (optional; available in v5.1+)

Groups do nothing on their own. They must either be given a root role directly or a role on a project to assign
permissions.

Groups that do not have a root role need to be assigned a role on a project to be useful. You can assign both predefined
roles and custom project roles to groups.

Any user that is a member of a group with a root role will inherit that root role's permissions on the root level.

While a user can only have one role in a given project, a user may belong to multiple groups, and each of those groups
may be given a role on a project. In the case where a given user is given permissions through more than one group, the
user will inherit the most permissive permissions of all their groups in that project.

## User group SSO integration

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.18+`

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
