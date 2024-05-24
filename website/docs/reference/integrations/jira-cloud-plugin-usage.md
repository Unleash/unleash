---
title: Jira Cloud Integration - Usage
---

With the Unleash Jira Cloud Plugin you can create, view and manage Unleash feature flags directly from a Jira issue.

The plugin also shows you current status of connected flags.

## Using the plugin

To use the plugin, you'll need to create an issue or use an existing one. Once the issue is saved and you open up the issue panel, you'll be greeted with a button to activate the Unleash plugin for that issue.

<Figure caption="The Unleash Feature Flags button gets added to the top-level actions of new issues. Use that button to activate the Unleash plugin for that issue." img="/img/jira-cloud-activate-unleash-panel-button.png" />

### Connecting a flag to an issue

<Figure caption="Once active, the Unleash plugin adds a button labeled 'connect toggle' to the issue." img="/img/jira-cloud-issue-button.png" />


Use the issue's "connect toggle" button to open a dialog. 

There are a few steps to connect a flag:

1. Select the Unleash project that contains the flag:


![Jira Cloud: connect feature flag form. The project selection dropdown contains all Unleash projects](/img/jira-cloud-select-project-expanded.png)

2. Use the "create new toggle" option to choose whether you want to add an existing flag or create a new one.  

<Figure caption="When you add an existing flag, use the flag name select list to choose from existing flags in the selected Unleash project." img="/img/jira-cloud-add-existing-toggle.png" />

<Figure caption="When you add a new flag, you must give it a name and can choose to give it a description." img="/img/jira-cloud-add-new-toggle.png" />

### Flag status as part of Issue view

Once you've connected at least one flag to an issue, the Unleash plugin will list the current status of each environment for
that flag. If the current user is allowed to edit the issue, they can also enable or disable environments directly
from Jira.

<Figure caption="A Jira Cloud issue with a connected flag. The Unleash feature flags section now shows the connected flags along with the flag's environments. There are controls to enable or disable the flag in the development and production environments" img="/img/jira-cloud-toggle-status.png" />

### Change Requests

The plugin respects Unleash's [change requests](../change-requests.md). If change requests are turned on in the connected project and the selected environment, the plugin will ask whether you want to create a change request or not. 

If you already have an active change request for that project and that environment, the changes will be added to your existing change request.


If you confirm that you would like to open a change request, then the plugin will create one for you and present a confirmation dialog.

<Figure caption="A dialog appears when the plugin creates a change request for you. The dialog contains a link directly to the newly created change request." img="/img/jira-cloud-change-request-confirmation.png" />

When the Change Request has been reviewed and applied in Unleash, the flag will show the requested state after the next refresh 
of the issue and flag status page.


### Disconnecting flag from Issue

If a flag is no longer relevant for your Jira Issue, you can disconnect it using the "disconnect toggle" button. This button is only available if your user has edit permissions for the Jira issue.

![Jira Cloud: issue with a connected flag. The 'disconnect flag' button (highlighted) is displayed next to the flag's name.](/img/jira-cloud-disconnect-toggle.png)

The flag will be disconnected immediately. However, the plugin will not delete the flag from Unleash,
so you can still reconnect your Jira issue to the same flag using the "Connect to existing flag" functionality
