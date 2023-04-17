---
title: Jira Cloud Integration - Usage
---

With the Unleash Jira Cloud Plugin you can create, view and manage Unleash feature toggles directly from a Jira issue.

The plugin also shows you current status of connected toggles.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

<Figure caption="The Unleash Feature Flags button gets added to the top-level actions of new issues. Use that button to activate the Unleash plugin for that issue." img="/img/jira-cloud-activate-unleash-panel-button.png" />

### Connecting a toggle to an issue

<Figure caption="Once active, the Unleash plugin adds a button labeled 'connect toggle' to the issue." img="/img/jira-cloud-issue-button.png" />


Use the issue's "connect toggle" button to open a dialog. 

There are a few steps to connect a toggle:

1. Select the Unleash project that contains the toggle:


![Jira Cloud: connect feature toggle form. The project selection dropdown contains all Unleash projects](/img/jira-cloud-select-project-expanded.png)

2. Use the "create new toggle" option to choose whether you want to add an existing toggle or create a new one.  

<Figure caption="When you add an existing toggle, use the toggle name select list to choose from existing toggles in the selected Unleash project." img="/img/jira-cloud-add-existing-toggle.png" />

<Figure caption="When you add a new toggle, you must give it a name and can choose to give it a description." img="/img/jira-cloud-add-new-toggle.png" />

### Toggle status as part of Issue view

Once you've connected at least one toggle to an issue, the Unleash plugin will list the current status of each environment for
that toggle. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

<Figure caption="A Jira Cloud issue with a connected toggle. The Unleash feature flags section now shows the connected toggles along with the toggle's environments. There are controls to enable or disable the toggle in the development and production environments" img="/img/jira-cloud-toggle-status.png" />

### Change Requests

The plugin respects Unleash's [change requests](../change-requests.md). If change requests are turned on in the connected project and the selected environment, the plugin will ask whether you want to create a change request or not. 

If you already have an active change request for that project and that environment, the changes will be added to your existing change request.


If you confirm that you would like to open a change request, then the plugin will create one for you and present a confirmation dialog.

<Figure caption="A dialog appears when the plugin creates a change request for you. The dialog contains a link directly to the newly created change request." img="/img/jira-cloud-change-request-confirmation.png" />

When the Change Request has been reviewed and applied in Unleash, the toggle will show the requested state after the next refresh 
of the issue and toggle status page.


### Disconnecting toggle from Issue

If a toggle is no longer relevant for your Jira Issue, you can disconnect it using the "disconnect toggle" button. This button is only available if your user has edit permissions for the Jira issue.

![Jira Cloud: issue with a connected toggle. The 'disconnect toggle' button (highlighted) is displayed next to the toggle's name.](/img/jira-cloud-disconnect-toggle.png)

The toggle will be disconnected immediately. However, the plugin will not delete the toggle from Unleash,
so you can still reconnect your Jira issue to the same toggle using the "Connect to existing toggle" functionality
