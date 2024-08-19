---
id: projects
title: Projects
---

# Overview

Projects are a way to organize your feature flags within Unleash. Each instance must have at least one project. For example, you can use projects to group the feature flags of a development team or functional modules within your application.

New instances get a default project that all members can access. You cannot delete this project, but you can [rename](#update-a-project) or [archive it](#archive-a-project).

You can configure which [environments](./environments.md) are available within a project. By default, all global environments are available. You can only enable and disable feature flags for the environments you've configured for the project.

## Create a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

To create a new project, do the following:
1. Go to **Projects** > **New project** and enter a project name.
2. Optionally configure the available environments, [stickiness](/reference/stickiness.md), [collaboration mode](/reference/project-collaboration-mode.md), and [change requests](/reference/change-requests.md).
3. Click **Create project**.


## Update a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

You can update all configuration

## Archive a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing). | **Version**: 6.?+ in BETA.

:::

The archive projects functionality allows you to hide a project while maintaing historical project data. This allows you to have short-lived projects, for example, to represent specific 'projects' in your organization.

You must archive all feature flags within a project before archiving it. Once a project is archived, you cannot add or move feature flags to it.

1 .Go to **Projects** > **Project settings** > **Settings**.
1. Go to **Archive project** section and click **Archive project**.
2. In the confirmation dialog, click **Yes, I'm sure.**

### Revive a project

To revive an archived project, go to **Projects** > **Archived projects** and click **Revive project** on the project you'd like to restore.

## Delete a project

:::note Availability

**Plan**: [Pro](https://www.getunleash.io/pricing) and [Enterprise](https://www.getunleash.io/pricing).

:::

When deleting a project within the Amind UI, you must [archive it](#archive-a-project) first. With the API, you can [delete projects](/reference/api/unleash/delete-project) straight away.

To delete a project, do the following:

1. Go to **Projects** > **Archived projects** and click **Permanently delete project** on the project you'd like to delete.
2. In the confirmation dialog, click **Yes, I'm sure.**

When using the Admin UI, you must archive a project before deleting. You can delete directly in the API. 'Permanently delete project'


## Filter feature flags on projects

When browsing the feature flags in Unleash, you might want to filter the view by looking only at the ones included in the project of interest. This is possible from the Feature flag overview.

From the UI top navigation menu, choose "Feature flags".

![The Unleash Admin UI navigation menu with the "Feature flags" option highlighted by a red arrow.](/img/projects_menu.png)

The list of features flags can be filtered on the project of your choice. By default, all feature flags are listed in the view. You can use the search to filter to a specific project or even for multiple projects in the same time if you need.

![The feature flag list with flags scoped to the "fintech" project. The filter is activated by using a form control.](/img/project_select.png)

In the search you can type "project:specific-name" to filter that project only.

![The feature flag list with an overlay listing all the projects available. You can select a project and the list will update with the flags belonging to that project.](/img/projects_select_dropdown.png)

The view will now be updated with the filtered feature flags.

## Assigning project to a new feature flag

When you create a new feature flag, you can choose which project to create it in. The default project is whatever project you are currently configuring.

![A form to create a flag. An arrow points to an input labeled "project".](/img/projects_change_project.png)

All available projects are available from the drop-down menu.

![A form to create a flag. The "project" input is expanded to show projects you can create the flag in.](/img/projects_toggle_project_dropdown.png)

## Change project for an existing feature flag

If you want to change which project a feature flag belongs to, you can change that from the feature flag's configuration page. Under the _settings_ tab, choose the _project_ option and choose the new project from the dropdown menu.

![A feature flag's settings tab. The project setting shows a dropdown to change projects.](/img/projects_existing_toggle_dropdown.png)

## Project default strategy
import Figure from '@site/src/components/Figure/Figure.tsx'

:::info Availability

The project default strategy feature is generally available starting with **Unleash 5.2.0**.

:::

You can define default strategies for each of a project's environments. The default strategy for an environment will be added to a feature when you enable it in an environment **if and only if** the feature has **no active strategies** defined.

All default project strategies use the [gradual rollout activation strategy](activation-strategies.md). By default, the rollout 100%. You can customize the strategies by changing the rollout percentage and adding [constraints](strategy-constraints.md) and [segments](segments.mdx) as you would for any other strategy.

### Configuration

Custom strategies are configured from each project's project settings tab.

<Figure caption="The default strategy configuration page is available from the project settings tab." img="/img/project-settings-default-strategy.png" />

The default strategies screen lists a strategy for each of the project's environments

<Figure caption="Each strategy can be individually configured with the corresponding edit button." img="/img/edit-default-strategy.png" />
## Change environment
## Project insights

# Project roles


# Project insights
The project overview gives statistics for a project, including:
* the number of all changes/events in the past 30 days compared to previous 30 days
* the average time from when a feature was created to when it was enabled in the "production" environment. This value is calculated for all features in the project lifetime.
* the number of features created in the past 30 days compared to previous 30 days
* the number of features archived in the past 30 days compared to previous 30 days

![Project overview with 4 statistics for total changes, average time to production, features created and features archived.](/img/project_overview.png)
