---
title: Project collaboration mode
---

:::info Availability

The change requests feature is an enterprise-only feature that was introduced in **Unleash 4.22.0**.

:::

Unleash project collaboration mode is a feature that allows to specify who can submit [change requests](change-requests.md). Currently, there are two modes:
- **open** where everyone can submit change requests. This is a default setting for the existing and new Unleash projects.
- **protected** where [admins, project members and owners](rbac.md#standard-roles) can submit change requests. Viewers and editors who are not added to projects will not be able to submit change requests.

## Project collaboration mode setting

Project collaboration mode is controlled from the "Create Project" and "Edit Project" screens.

![Create project with collaboration mode](/img/collaboration-mode.png)

When project collaboration mode is protected all users who are not project members or admins will have all the
change request operations disabled.
