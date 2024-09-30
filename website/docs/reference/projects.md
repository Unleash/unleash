---
id: projects
title: Projects
---

## Overview

Projects help you organize feature flags within Unleash. For example, you can use projects to group feature flags by development teams or different functional modules within your application.

Each instance requires at least one project. New instances get a default project that all members can access. You cannot delete this project, but you can [rename](#update-a-project) or [archive it](#archive-a-project).

You can configure which [environments](environments.md) are available within a project. By default, all global environments are available. You can only enable and disable feature flags for the environments you've configured for the project.

By default, projects have an open [collaboration mode](project-collaboration-mode.md), which means all members of your instance can access the project and submit change requests. To learn more, visit [Project Collaboration Mode](project-collaboration-mode.md).

## Create a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

To create a new project:
1. Go to **Projects** > **New project** and enter a project name.
2. Optionally configure settings such as [environments](environments.md), [stickiness](stickiness.md), [collaboration mode](project-collaboration-mode.md), and [change requests](change-requests.md).
3. Click **Create project**.


## Update a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

You can update all aspects of a project except its ID.

To update a project, go to **Projects** and select the project you'd like to edit. In the **Project settings** tab, you can update general settings such as project name, description, [stickiness](stickiness.md), [collaboration mode](project-collaboration-mode.md), and more. You can also configure user and API access, [change requests](change-requests.md), and [actions](actions.md), add [segments](segments.mdx) and [environments](environments.md), and update the [default strategy](#project-default-strategy).

The available project settings depend on a user's [root and project roles](rbac.md).

## Archive a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing). | **Version**: 6.2 in BETA.

:::

The archive projects functionality allows you to hide a project while maintaining historical project data. Archiving lets you manage short-lived projects, for example, to represent specific initiatives in your organization.

Before archiving a project, you must archive all feature flags within it. Archiving automatically disables all project [actions](actions.md). Once you archive a project, you cannot add or move feature flags to it.

To archive a project:

1. Go to **Projects > Project settings > Settings**.
2. Go to the **Archive project** section and click **Archive project**.
3. Confirm by clicking **Yes, I'm sure**.

### Revive a project

To revive an archived project, go to **Projects > Archived projects** and click **Revive project** on the project you want to restore.

## Delete a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

When deleting a project within the Admin UI, you must [archive it](#archive-a-project) first. Alternatively, you can [delete projects directly](./api/unleash/delete-project) using the API.

To delete a project:

1. Go to **Projects > Archived projects** and click **Permanently delete project** on the project you want to delete.
2. Confirm by clicking **Yes, I'm sure**.

## Move a feature flag between projects

A feature flag belongs to a single project. To move a feature flag between two projects, both projects must have the exact same environments enabled.

To move a feature flag between projects:

1. Go to **Projects** and select the feature flag's current project.
2. In the **Flags** tab, click the feature flag's name.
3. Go to **Settings > Project**.
4. Select the new project from the list.
5. Click **Save**, then click **Change project** to confirm your changes.

## Project default strategy

import Figure from '@site/src/components/Figure/Figure.tsx'

:::note Availability

**Version**: 5.2.0+.

:::

Each project has a default strategy of [gradual rollout](activation-strategies.md#gradual-rollout) to 100% of the user base. The default strategy only applies when **no active strategies** are defined for a flag in a specific environment.

You can change the default strategies of a project per environment. You can customize the default strategies by changing the rollout percentage and [stickiness](stickiness.md) and adding [segments](segments.mdx), [constraints](strategy-constraints.md), and [variants](strategy-variants.md).

To change the default strategy for an environment in a project:

1. Go to **Projects > Project settings > Default strategy**.
2. Go to the environment you want to configure and click **Edit default strategy for 'environment'**.
3. Configure the strategy values, such as the rollout percentage, stickiness, segments, constraints, and variants.
4. Click **Save strategy**.

<Figure caption="You can configure each environment's default strategy with the corresponding edit button." img="/img/edit-default-strategy-development.png" />

## View project insights

Project insights is a great way to see how your project performed in the last 30 days compared to the previous 30 days. You can explore key metrics such as the total number of changes, the average time to production, the number of features created and archived, and project health.

To view your project insights, go to the **Insights** within a project.


