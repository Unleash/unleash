---
id: projects
title: Projects
---

:::info feature availability

All users get access to Unleash's projects, but only pro and enterprise users can create, update, or delete them.

:::

This document explains how Unleash uses projects, including how to create and maintain them.

## The default project

All users get access to the default project. You cannot delete this project. You can, however, rename it if you're using the pro or enterprise version of Unleash.

## Understanding purpose of projects {#understanding-purpose-of-projects}

Projects are a way to organize your feature toggles within Unleash. Within a large organization, having multiple feature toggles, staying on top of the feature toggles might become a challenge. Every feature toggle will be part of a project. Projects can be linked to a development team or to functional modules within the software.

A common pattern is to organize the feature toggles according to key areas of the application, e.g. “Basic user process” and “Advanced user process”. This is illustrated below.

![A diagram with two boxes labeled \"Basic user process\" and \"Advanced user process\", respectively. The former contains features \"New login\" and \"Winter theme enablement\", the latter \"New in-app purchase\" and \"Updated invoice repository\".](/img/project_concept.png)

## Creating a new project {#creating-a-new-project}

When you log into Unleash for the first time, there is a Default project already created. All feature toggles are included in the Default project, unless explicitly set to a different one.

From the top-line menu – click on “Projects”

![The Unleash admin UI with the \"Projects\" nav link in the top bar highlighted.](/img/projects_button.png)

The available projects will now be listed. To create a new Project – choose the “Add new project”

![A list of projects. There is a button saying \"Add new project\".](/img/projects_new_project.png)

The configuration of a new Project is now available. the following input is available to create the new Project.

![A project creation form. The form fields are labeled \"project ID\", \"name\", and \"description\". The "Create" button is highlighted.](/img/projects_save_new_project.png)

| Item         | Description                        |
| ------------ | ---------------------------------- |
| Project Id   | Id for this Project                |
| Project name | The name of the Project.           |
| Description  | A short description of the project |

## Deleting an existing project {#deleting-an-existing-project}

To keep your feature toggles clean, removing deprecated projects is important. From the overview of Projects –
1. In the top right of the project card, find the project menu represented by three vertical dots.


![A list of projects. Each project has three vertical dots — a kebab menu — next to it.](/img/projects_menu_button.png)

2. Click on Delete Project

![A list of projects. Each project has three vertical dots — a kebab menu — next to it, which exposes a menu with the \"Edit project\" and \"Delete project\" options when interacted with.](/img/projects_delete_button.png)

## Filter feature toggles on projects {#filter-feature-toggles-on-projects}

When browsing the feature toggles in Unleash, you might want to filter the view by looking only at the ones included in the project of interest. This is possible from the Feature toggle overview.

From the UI top navigation menu, choose "Feature toggles".

![The Unleash Admin UI navigation menu with the \"Feature toggles\" option highlighted by a red arrow.](/img/projects_menu.png)

The list of features toggles can be filtered on the project of your choice. By default, all feature toggles are listed in the view.

![The feature toggle list with toggles scoped to the \"fintech\" project. The filter is activated by using a form control.](/img/project_select.png)

From the drop-down, chose the project to filter on.

![The feature toggle list with an overlay listing all the projects available. You can select a project and the list will update with the toggles belonging to that project.](/img/projects_select_dropdown.png)

The view will now be updated with the filtered feature toggles.

## Assigning project to a new feature toggle {#assigning-project-to-a-new-feature-toggle}

When you create a new feature toggle, you can choose which project to create it in. The default project is whatever project you are currently configuring.

![A form to create a toggle. An arrow points to an input labeled \"project\".](/img/projects_change_project.png)

All available projects are available from the drop-down menu.

![A form to create a toggle. The \"project\" input is expanded to show projects you can create the toggle in.](/img/projects_toggle_project_dropdown.png)

## Change project for an existing feature toggle {#change-project-for-an-existing-feature-toggle}

If you want to change which project a feature toggle belongs to, you can change that from the feature toggle's configuration page. Under the _settings_ tab, choose the _project_ option and choose the new project from the dropdown menu.

![A feature toggle's settings tab. The project setting shows a dropdown to change projects.](/img/projects_existing_toggle_dropdown.png)
