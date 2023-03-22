---
title: Project collaboration mode
---

:::info Availability

The project collaboration mode is an enterprise-only feature that was introduced in **Unleash 4.22.0**.

:::

A project's **collaboration mode** specifies **who can submit [change requests](change-requests.md)**. There are two collaboration modes:
- [**open**](#open-collaboration-mode)
- [**protected**](#protected-collaboration-mode)

## **Open** collaboration mode

Anyone can submit change requests in an **open** project, regardless of their permissions within the project and globally. This is the default collaboration mode for projects.

The open collaboration mode is the default in Unleash and is how all projects worked in Unleash before the introduction of collaboration modes.

## **Protected** collaboration mode

Only admins and project members can submit change requests in a **protected** project. Other users can not submit change requests.

### Change requests

When you change a project's collaboration mode from open to protected, users who do not have the right permissions will lose the ability to create new change requests.

However, existing change requests created by these users will not be deleted. Any users with open change requests will still be able to cancel the change request, but they will **not** be able to update the change request.

## Project collaboration mode setting

You can set a project's collaboration mode when you create a project and at any point after creation.

![Project creation form with a collaboration mode field and corresponding explanation.](/img/collaboration-mode.png)
Because the project's collaboration mode is a core part of the project, the controls to change it are available on the "edit project" page.

![The project-level header section with the "edit project" button highlighted.](/img/edit-project.png)

## Pre-existing projects

Projects that were created in earlier versions of Unleash (before the release of project collaboration modes) get the **open** mode when they are migrated to a version of Unleash with project collaboration modes.

To change the project collaboration mode for an existing project you have to edit the project.

