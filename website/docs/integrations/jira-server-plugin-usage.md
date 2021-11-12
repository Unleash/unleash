---
id: jira_server_plugin_usage
title: Jira Server Integration - Usage
---

> The Jira Server Plugin is part of Unleash Enterprise.

With the Unleash Jira server plugin you can create new feature toggles in Unleash from a Jira issue as well as link
existing toggles to Jira issues.

The plugin also shows you current status of connected toggles.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the Issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

### Connecting a toggle to an issue

![Jira Server - Issue panel button](/img/jira_server_issue_panel_button.png)

Clicking this button opens a dialog, allowing you to either connect an existing toggle

![Jira Server - Add Existing toggle](/img/jira_server_add_existing_toggle.png)

or if you flip the switch that says "Use existing toggle", allows you to create a new toggle

![Jira Server - Add new toggle](/img/jira_server_add_new_toggle.png)

### Toggle status as part of Issue view

Once you've connected at least one toggle to an issue, our plugin will list the current status of each environment for
that toggle. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

![Jira Server - Toggle status](/img/jira_server_toggle_status.png)


### Disconnecting toggle from Issue

If a toggle is no longer relevant for your Jira Issue, you can disconnect it using the Disconnect toggle button (
provided your user has edit rights on the issue)

![Jira Server - Disconnect toggle](/img/jira_server_disconnect_toggle.png)

Once you click the button, you'll need to confirm the dialog that opens up.

![Jira Server - Disconnect toggle dialog](/img/jira_server_disconnect_toggle_dialog.png)

If confirmed, the toggle will be disconnected immediately. However, the plugin will not delete the toggle from Unleash,
so you can still reconnect your Jira issue to the same toggle using the "Connect to existing toggle" functionality 
