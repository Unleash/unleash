---
title: Jira Server Integration - Usage
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />

:::info Deprecated

The Jira Server plugin is **deprecated**, please use the [Unleash Jira Cloud plugin](/integrate/jira-cloud-plugin-installation) instead

:::

With the Unleash Jira server plugin you can create new feature flags in Unleash from a Jira issue as well as link
existing flags to Jira issues.

The plugin also shows you current status of connected flags.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the Issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

### Connecting a flag to an issue

![Jira Server - Issue panel button](/img/jira_server_issue_panel_button.png)

Clicking this button opens a dialog, allowing you to either connect an existing flag

![Jira Server - Add Existing flag](/img/jira_server_add_existing_toggle.png)

or if you flip the switch that says "Use existing flag", allows you to create a new flag

![Jira Server - Add new flag](/img/jira_server_add_new_toggle.png)

### Flag status as part of Issue view

Once you've connected at least one flag to an issue, our plugin will list the current status of each environment for
that flag. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

![Jira Server - Flag status](/img/jira_server_toggle_status.png)


### Disconnecting flag from Issue

If a flag is no longer relevant for your Jira Issue, you can disconnect it using the Disconnect flag button (
provided your user has edit rights on the issue)

![Jira Server - Disconnect flag](/img/jira_server_disconnect_toggle.png)

Once you click the button, you'll need to confirm the dialog that opens up.

![Jira Server - Disconnect flag dialog](/img/jira_server_disconnect_toggle_dialog.png)

If confirmed, the flag will be disconnected immediately. However, the plugin will not delete the flag from Unleash,
so you can still reconnect your Jira issue to the same flag using the "Connect to existing flag" functionality
