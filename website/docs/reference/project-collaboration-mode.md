---
title: Project Collaboration Mode
---

:::info Availability

The project collaboration mode is an enterprise-only feature that was introduced in **Unleash 4.22.0**.

:::

A project's **collaboration mode** specifies **who can submit [change requests](change-requests.md)**. There are two collaboration modes:
- [**open**](#open-collaboration-mode)
- [**protected**](#protected-collaboration-mode)
- [**private**](#private-collaboration-mode)

## **Open** collaboration mode

Anyone can submit change requests in an **open** project, regardless of their permissions within the project and globally. This is the default collaboration mode for projects.

The open collaboration mode is the default in Unleash and is how all projects worked in Unleash before the introduction of collaboration modes.

## **Protected** collaboration mode

Only admins and project members can submit change requests in a **protected** project. Other users can not submit change requests.

## **Private** collaboration mode

Private collaboration mode renders the project invisible to all **viewers** who are not project members. This means that **viewers** cannot see the project in the project list, nor can they access the project's features or locate the project anywhere within Unleash.

**Editors** and **admins** can still see private projects.

### Change requests

When you change a project's collaboration mode from open to protected, users who do not have the right permissions will lose the ability to create new change requests.

However, existing change requests created by these users will not be deleted. Any users with open change requests will still be able to cancel the change request, but they will **not** be able to update the change request.

## Project collaboration mode setting

The collaboration mode for a project can be set at the time of creation and modified at any subsequent time, found within the 'Enterprise Settings' section.

![Project creation form with a collaboration mode field and corresponding explanation.](/img/collaboration-mode.png)

Since the collaboration mode is an integral feature of the project, the options to modify it can be found on the 'Project Settings' page.

![The project-level header section with the "edit project" button highlighted.](/img/edit-project.png)

## Pre-existing projects

Projects that were created in earlier versions of Unleash (before the release of project collaboration modes) get the **open** mode when they are migrated to a version of Unleash with project collaboration modes.

To change the project collaboration mode for an existing project you have to edit the project.

