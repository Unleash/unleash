---
title: Jira Cloud Integration - Usage
---

With the Unleash Jira Cloud Plugin you can create, view and manage Unleash feature toggles directly from a Jira issue.

The plugin also shows you current status of connected toggles.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

<Figure caption="The Unleash Feature Flags button gets added to the top-level actions of new issues. Use that button to activate the Unleash plugin for that issue." img="/img/jira-cloud-activate-unleash-panel-button.png" />

### Connecting a toggle to an issue

![Jira Cloud - Button that opens modal to connect toggles to Jira Issue](/img/jira-cloud-issue-button.png)

Clicking this button opens a dialog where you first select an Unleash Project to connect toggle from,

![Jira Cloud - Dropdown to select Unleash project](/img/jira-cloud-select-project-expanded.png)

allowing you then to either connect an existing toggle

![Jira Cloud - Dropdown to select existing toggle to connect](/img/jira-cloud-add-existing-toggle.png)

or if you flip the switch that says "Create new toggle", allows you to create a new toggle

![Jira Cloud - Switch that opens the form to create and connect a new toggle](/img/jira-cloud-add-new-toggle.png)

### Toggle status as part of Issue view

Once you've connected at least one toggle to an issue, our plugin will list the current status of each environment for
that toggle. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

![Jira Cloud - Overview of toggle status in Jira Issue](/img/jira-cloud-toggle-status.png)

### Change Requests

The plugin respects Unleash's [change requests](../change-requests.md). If change requests are turned on in the connected project and the selected environment, the plugin will ask whether you want to create a change request or not. 

If you already have an active change request for that project and that environment, the changes will be added to your existing change request.

![Jira Cloud - Modal opens for creating a new change request](/img/jira-cloud-change-request-dialog.png)

If you confirm that you would like to open a change request, then the plugin will create one for you and present a confirmation dialog.

<Figure caption="A dialog appears when the plugin creates a change request for you. The dialog contains a link directly to the newly created change request." img="/img/jira-cloud-change-request-confirmation.png" />

When the Change Request has been reviewed and applied in Unleash, the toggle will show the requested state after the next refresh 
of the issue and toggle status page.


### Disconnecting toggle from Issue

If a toggle is no longer relevant for your Jira Issue, you can disconnect it using the Disconnect toggle button (
provided your user has edit rights on the issue)

![Jira Cloud: issue with a connected toggle. The 'disconnect toggle' button (highlighted) is displayed next to the toggle's name.](/img/jira-cloud-disconnect-toggle.png)

The toggle will be disconnected immediately. However, the plugin will not delete the toggle from Unleash,
so you can still reconnect your Jira issue to the same toggle using the "Connect to existing toggle" functionality
