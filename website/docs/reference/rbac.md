---
id: rbac
title: Role-based access control
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

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
resources in a more precise, fine-grained way.

Each custom root role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **root permissions** (required)

### Create and assign a custom root role

To create a custom root role in the Admin UI, do the following:

1. In **Admin settings > User config > Root roles**, click **New root role**.
2. Give the role a name and description and select all permissions you want to assign to the role.
3. Click **Add role** to save.

Once you have the role set up, you can assign it a user:

1. In **Admin settings > User config > Users**, select the user you want to assign the role to.
2. Click **Edit user**.
3. For **Role**, select the root role you want the user to have.
4. Click **Save**.

### Root permissions

You can assign the following root permissions:

#### API token permissions

| Permission Name            | Description                               |
|----------------------------|-------------------------------------------|
| Read Frontend tokens   | View [Frontend tokens](./api-tokens-and-client-keys#frontend-tokens).   |
| Create Frontend tokens | Create Frontend tokens. |
| Update Frontend tokens | Update Frontend tokens. |
| Delete Frontend tokens | Delete Frontend tokens. |
| Read Backend tokens     | View [Backend tokens](./api-tokens-and-client-keys#backend-tokens).     |
| Create Backend tokens   | Create Backend tokens.   |
| Update Backend tokens   | Update Backend tokens.   |
| Delete Backend tokens   | Delete Backend tokens.   |

#### Application permissions

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Update applications | Update [applications](./applications). |

#### Authentication permissions

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `6.9+`

:::
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

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `6.9+`

:::

| Permission Name     | Description                        |
|---------------------|------------------------------------|
| Change instance banners | Change instance [banners](./banners). |
| Change maintenance mode state | Change [maintenance mode](./maintenance-mode) state. |
| Update CORS settings | Update [CORS settings](./front-end-api#configure-cross-origin-resource-sharing-cors). |
| Read instance logs and login history | Read instance logs and [login history](./login-history). |

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

#### Release template permissions

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `6.8+ in BETA`

:::

| Permission Name | Description               |
|-----------------|---------------------------|
| Create release plan template      | Create [release template](./release-templates). |
| Update release plan template      | Update [release template](./release-templates). |
| Delete release plan template      | Delete [release template](./release-templates). |

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
projects and resources but must be assigned a project role to be allowed to edit a project's resources.

Each custom project role consists of:

- a **name** (required)
- a **role description** (required)
- a set of **project and environment permissions** (required)

### Create and assign a custom project role

To create a custom project role in the Admin UI, do the following:

1. In **Admin settings > User config > Project roles**, click **New project role**.
2. Give the role a name and description and select all permissions you want to assign to the role.
3. Click **Add role** to save.

Once you have the role set up, you can assign it to individual users inside a project:

1. In **Settings > User access**, click **Edit**.
2. For **Role**, select the custom project roles you want to apply.
3. Click **Save**.

### Project-level permissions

You can assign the following project-level permissions. These permissions are valid across all of the [project](./projects)'s environments.

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
### Environment-level permissions

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

## View a user's roles and permissions

:::note Availability

**Version**: `6.9+`

:::

The access overview page helps administrators see exactly what a user can do in Unleash and which roles grant those permissions. You can explore permissions at the root level or for specific environments and projects.

To view a user’s permissions, go to **Admin settings > User config > Users**. Select a user and click **Access overview**.


## User groups

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.14+`

:::

User groups allow you to manage user permissions efficiently by assigning roles to a collection of users instead of individually. This is particularly useful for projects with many users.

You can create and manage user groups in the Admin UI at **Admin settings > User config > Groups**.

When creating a user group, you can define the following:

- **Name**: A unique identifier for the group.
- **Description**: A brief explanation of the group's purpose.
- **Users**: A list of users who are members of this group.
- **SSO groups** to sync from: A list of single sign-on (SSO) groups to synchronize members from.
- **Root role**: A role assigned to the group at the root level. (Available in v5.1+)

Groups themselves do not grant permissions. To be functional, a group must either:
- Be assigned a root role. Members of this group will inherit the root role's permissions globally.
- Be assigned a role on a specific project. This grants the group's members the specified permissions within that project. You can assign both predefined and custom project roles to groups.

A user can belong to multiple groups, and each group a user belongs to can have a different role assigned to it on a specific project.
If a user gains permissions for a project through multiple groups, they will inherit the most permissive set of permissions from all their assigned group roles for that project.

You can’t add a group with a [custom root role](#custom-root-roles) to a project. If you need both root-level and project-level access through [group syncing](#set-up-group-sso-syncing), you can sync the same directory group from your Active Directory or identity provider to two separate Unleash groups: one for root permissions and one for project access.

## Set up group SSO syncing

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `4.18+`

:::

You can integrate user groups with your single sign-on (SSO) provider to automatically manage user assignments.
Note that this just-in-time process updates groups only when a user logs in, which differs from a full provisioning system like [SCIM](/how-to/how-to-setup-provisioning-with-okta) that syncs all user information proactively.

When a user logs in through SSO, they are automatically added to or removed from a user group based on their SSO group membership. Manually added users are not affected by the SSO sync.

To enable group syncing, you configure two settings in your SSO provider configuration:

- **Enable group syncing**: Turns the feature on.
- **Group field JSON path**: A JSON path expression that points to the field in your SSO token response that contains the user's groups.

For example, if your token response looks like this, you would set the Group field JSON path to `groups`:

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

After you enable syncing, you must link the SSO group names to the corresponding user group.

Once you've enabled group syncing and set an appropriate path, you'll need to add the SSO group names to the Unleash
group. This can be done by navigating to the Unleash group you want to enable sync for and adding the SSO group names to
the "SSO group ID/name" property.

### Configure SSO group sync

You must be an Admin in Unleash to perform these steps.

1. Go to **Admin settings > Single sign-on**. Select your integration and click **Enable Group Syncing**.
2. in **Group Field JSON Path**, enter the JSON path for the groups field in your token response.
3. Click **Save**.
4. Go to **User config > Groups** and select the user group you want to sync and click **Edit**.
5. Add the exact SSO group names or IDs you want to link to the group.
6. Click **Save**.

The next time a user who belongs to one of the linked SSO groups logs in, they are automatically added to the user group. If they have been removed from the SSO group, their access will be revoked on their next login.

[^1]: The project-level permission is still required for the [**create/overwrite variants
** (PUT)](/reference/api/unleash/overwrite-feature-variants) and [**update variants
** (PATCH)](/reference/api/unleash/patch-feature-variants) API endpoints, but it is not used for anything
within the admin UI. The API endpoints have been superseded by the [**create/overwrite environment variants
** (PUT)](/reference/api/unleash/overwrite-feature-variants-on-environments) and [**update environment
variants** (PATCH)](/reference/api/unleash/patch-environments-feature-variants) endpoints, respectively.
