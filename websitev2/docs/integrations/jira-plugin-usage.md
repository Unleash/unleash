---
id: jira_plugin_usage
title: Jira Integration - Usage
---

> The Jira Plugin is part of Unleash Enterprise.

With the Unleash JIRA plugin you can create new feature toggles in Unleash from a JIRA issue. You'll also be able to link existing toggles to JIRA issues as well as see current status of the linked toggle as both a custom field and as an Issue Panel.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the Issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

![Jira - Issue panel button](/img/jira_issue_panel_button.png)

Clicking this button adds a section to your issue panel allowing you to connect a feature toggle to the issue. If no feature toggle is connected to the issue, you'll be greeted by an entry form for creating the toggle.

![Jira - Create Feature Toggle entry form](/img/jira_create_feature_toggle.png)

### Creating a new feature toggle

Once you've entered the necessary information:

- name - The name must be unique, at the current time, you'll receive an error from the plugin if the name already exist.
- project - Here we fetch valid projects from your Unleash installation and provide you with a dropdown, we'll default to the Default project.
- toggle-type - Again, the plugin will fetch valid types for the toggle from your Unleash installation and provide you with a dropdown.
- enabled - Is the toggle enabled when created

Click the `Create Feature Toggle` button and Unleash will create the toggle for you. Once created, the section in your issue view changes to show if the toggle is enabled.

It also adds a link back to your unleash installation allowing easy access to more advanced configuration of the feature toggle.

Since this leaves JIRA and enters Unleash, you'll be met by the Unleash login screen if you don't already have an active session in Unleash.

![Jira - Issue with existing Feature Toggle](/img/jira_existing_feature_toggle.png)

### Connecting existing feature toggle

- Still to come
