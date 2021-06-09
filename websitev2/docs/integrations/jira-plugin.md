---
id: jira_plugin
title: Jira Integration
---

# Jira Plugin (Enterprise only)

With the Unleash JIRA plugin you can create new feature toggles in Unleash from a JIRA issue. You'll also be able to link existing toggles to JIRA issues as well as see current status of the linked toggle as both a custom field and as an Issue Panel.

## Installation

You will receive an installation link from your Unleash sales representative. You'll need to keep this link, since it will be needed for upgrades or uninstallation later. When following the link you'll be greeted by an installation screen similar to the one down below ![Jira plugin install](/img/jira_plugin_installation.png)

## Configuring plugin

Once installed you'll need to head to "Manage your apps"

![Jira - app menu bar location](/img/jira_apps_menu_bar.png) ![Jira - manage your apps link](/img/jira_manage_apps.png)

Once there you should see "Unleash Admin" in your sidebar.

Click it and you'll get taken to our configuration page

![Jira - manage apps sidebar](/img/jira_manage_apps_sidebar.png)

Once on the configuration page. You should enter your installation URL and an API Key with access level `Admin`

- See [the API token doc](/user_guide/api-token) for how to configure an Admin token

![Jira - Configure unleash app](/img/jira_configure_unleash_app.png)

After you've entered the URL and API key and clicked `Submit` your api token will no longer be visible.

![Jira - API key already set](/img/jira_admin_api_key_set.png)

Now, you're ready to use the plugin from Jira issues

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the Issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

![Jira - Issue panel button](/img/jira_issue_panel_button.png)

Clicking this button adds a section to your issue panel allowing you to connect a feature toggle to the issue. If no feature toggle is connected to the issue, you'll be greeted by an entry form for creating the toggle.

![Jira - Create Feature Toggle entry form](/img/jira_create_feature_toggle.png)

Once you've entered the necessary information; name, project, toggle type, and whether the toggle starts out enabled you can click the `Create Feature Toggle` button and Unleash will create the toggle for you. Once created, the section in your issue view changes to show if the toggle is enabled. It also adds a link back to your unleash installation allowing easy access to more advanced configuration of the feature toggle.

![Jira - Issue with existing Feature Toggle](/img/jira_existing_feature_toggle.png)
