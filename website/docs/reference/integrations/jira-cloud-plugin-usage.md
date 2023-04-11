---
title: Jira Cloud Integration - Usage
---

> The Jira Cloud Plugin is part of Unleash Enterprise.

With the Unleash Jira Cloud Plugin you can create new feature toggles in Unleash from a Jira issue as well as link
existing toggles to Jira issues.

The plugin also shows you current status of connected toggles.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

![Jira Cloud - Activate Unleash Panel Button](/img/jira_cloud_activate_unleash_panel_button.png)

### Connecting a toggle to an issue

![Jira Cloud - Issue button](/img/jira_cloud_issue_button.png)

Clicking this button opens a dialog where you first select an Unleash Project to connect toggle from,

![Jira Cloud - Select Unleash project](/img/jira_cloud_select_project_expanded.png)

allowing you then to either connect an existing toggle

![Jira Cloud - Add Existing toggle](/img/jira_cloud_add_existing_toggle.png)

or if you flip the switch that says "Create new toggle", allows you to create a new toggle

![Jira Cloud - Add new toggle](/img/jira_cloud_add_new_toggle.png)

### Toggle status as part of Issue view

Once you've connected at least one toggle to an issue, our plugin will list the current status of each environment for
that toggle. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

![Jira Cloud - Toggle status](/img/jira_cloud_toggle_status.png)

### Change Requests

When enabling or disabling a toggle, if Change Requests have been activated for the Unleash project and environment the toggle belongs to

![Jira Cloud - Toggle click](/img/jira_cloud_change_request_clicked_toggle.png)

a dialog will open to alert the user that a change request will have to be created.

![Jira Cloud - Create change request](/img/jira_cloud_change_request_dialog.png)

Clicking the "Yes" button creates a 
Change Request in Unleash, and a confirmation will be displayed in the dialog along with a link to the new Change Request.

![Jira Cloud - Change request confirmation](/img/jira_cloud_change_request_confirmation.png)

When the Change Request has been reviewed and applied in Unleash, the toggle will show the requested state after the next refresh 
of the issue and toggle status page.


### Disconnecting toggle from Issue

If a toggle is no longer relevant for your Jira Issue, you can disconnect it using the Disconnect toggle button (
provided your user has edit rights on the issue)

![Jira Cloud - Disconnect toggle](/img/jira_cloud_disconnect_toggle.png)

Once you click the button, you'll need to confirm the dialog that opens up.

![Jira Cloud - Disconnect toggle dialog](/img/jira_cloud_disconnect_toggle_dialog.png)

If confirmed, the toggle will be disconnected immediately. However, the plugin will not delete the toggle from Unleash,
so you can still reconnect your Jira issue to the same toggle using the "Connect to existing toggle" functionality
