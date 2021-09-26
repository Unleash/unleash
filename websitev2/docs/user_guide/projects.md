---
id: projects
title: Projects
---

<div class="alert alert--info" role="alert">
  Projects are part of Unleash Pro and Unleash Enterprise.
</div>

## Overview {#overview}

This topic explains how projects are supported in Unleash, how to create and maintain them.

## Understanding purpose of projects {#understanding-purpose-of-projects}

Projects are a way to organize your feature toggles within Unleash. Within a large organization, having multiple feature toggles, staying on top of the feature toggles might become a challenge. Every feature toggle will be part of a project. Projects can be linked to a development team or to functional modules within the software.

A common pattern is to organize the feature toggles according to key areas of the application, e.g. “Basic user process” and “Advanced user process”. This is illustrated below.

![Project concept](/img/project_concept.png)

## Creating a new project {#creating-a-new-project}

When you log into Unleash for the first time, there is a Default project already created. All feature toggles are included in the Default project, unless explicitly set to a different one.

From the top-line menu – click on “Projects”

![Project concept](/img/projects_button.png)

The available projects will now be listed. To create a new Project – choose the “Add new project”

![Project concept](/img/projects_new_project.png)

The configuration of a new Project is now available. the following input is available to create the new Project.

![Project concept](/img/projects_save_new_project.png)

| Item         | Description                        |
| ------------ | ---------------------------------- |
| Project Id   | Id for this Project                |
| Project name | The name of the Project.           |
| Description  | A short description of the project |

## Deleting an existing project {#deleting-an-existing-project}

To keep your feature toggles clean, removing deprecated projects is important. From the overview of Projects – 
1. In the top right of the project card, find the project menu represented by three vertical dots.


![Project concept](/img/projects_menu_button.png)

2. Click on Delete Project

![Project concept](/img/projects_delete_button.png)

## Filter feature toggles on projects {#filter-feature-toggles-on-projects}

When browsing the feature toggles in Unleash, you might want to filter the view by looking only at the ones included in the project of interest. This is possible from the Feature toggle overview.

From the top-line menu – choose the hamburger icon

![Project concept](/img/projects_menu.png)

The list of features toggles can be filtered on the project of your choice. By default, all feature toggles are listed in the view.

![Project concept](/img/project_select.png)

From the drop-down, chose the project to filter on.

![Project concept](/img/projects_select_dropdown.png)

The view will now be updated with the filtered feature toggles.

## Assigning project to a new feature toggle {#assigning-project-to-a-new-feature-toggle}

When creating a new feature toggle, the project where the feature toggle will be created may be chosen. The default project is “Default”

![Project concept](/img/projects_change_project.png)

All available projects are available from the drop-down menu.

![Project concept](/img/projects_toggle_project_dropdown.png)

## Change project for an existing feature toggle {#change-project-for-an-existing-feature-toggle}

There might be a need to change the project a feature toggle belongs to. Changing the project is possible from the feature toggle configuration page.

![Project concept](/img/projects_existing_toggle_dropdown.png)

To change the project, simply change the project from the drop-down menu.
